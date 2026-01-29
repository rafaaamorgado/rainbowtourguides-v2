

SET statement\_timeout \= 0;  
SET lock\_timeout \= 0;  
SET idle\_in\_transaction\_session\_timeout \= 0;  
SET client\_encoding \= 'UTF8';  
SET standard\_conforming\_strings \= on;  
SELECT pg\_catalog.set\_config('search\_path', '', false);  
SET check\_function\_bodies \= false;  
SET xmloption \= content;  
SET client\_min\_messages \= warning;  
SET row\_security \= off;

CREATE SCHEMA IF NOT EXISTS "public";

ALTER SCHEMA "public" OWNER TO "pg\_database\_owner";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE TYPE "public"."booking\_status" AS ENUM (  
   'draft',  
   'pending',  
   'accepted',  
   'awaiting\_payment',  
   'confirmed',  
   'declined',  
   'cancelled\_by\_traveler',  
   'cancelled\_by\_guide',  
   'completed'  
);

ALTER TYPE "public"."booking\_status" OWNER TO "postgres";

CREATE TYPE "public"."guide\_status" AS ENUM (  
   'pending',  
   'approved',  
   'rejected',  
   'draft'  
);

ALTER TYPE "public"."guide\_status" OWNER TO "postgres";

CREATE TYPE "public"."profile\_role" AS ENUM (  
   'traveler',  
   'guide',  
   'admin'  
);

ALTER TYPE "public"."profile\_role" OWNER TO "postgres";

CREATE TYPE "public"."verification\_status" AS ENUM (  
   'pending',  
   'approved',  
   'rejected'  
);

ALTER TYPE "public"."verification\_status" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."enforce\_review\_booking\_participants"() RETURNS "trigger"  
   LANGUAGE "plpgsql"  
   AS $$  
declare  
 b\_traveler uuid;  
 b\_guide\_profile uuid;  
begin  
 select b.traveler\_id, g.id  
   into b\_traveler, b\_guide\_profile  
 from public.bookings b  
 join public.guides g on g.id \= b.guide\_id  
 where b.id \= new.booking\_id;

 if b\_traveler is null or b\_guide\_profile is null then  
   raise exception 'Invalid booking\_id: %', new.booking\_id;  
 end if;

 if not (  
   (new.author\_id \= b\_traveler and new.subject\_id \= b\_guide\_profile) or  
   (new.author\_id \= b\_guide\_profile and new.subject\_id \= b\_traveler)  
 ) then  
   raise exception 'Review must be between booking participants';  
 end if;

 if not exists (select 1 from public.bookings b2 where b2.id \= new.booking\_id and b2.status \= 'completed'::public.booking\_status) then  
   raise exception 'Review allowed only for completed bookings';  
 end if;

 return new;  
end;  
$$;

ALTER FUNCTION "public"."enforce\_review\_booking\_participants"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."guides\_auto\_approve\_and\_slug"() RETURNS "trigger"  
   LANGUAGE "plpgsql"  
   AS $$  
declare  
 v\_full\_name text;  
begin  
 if new.approved is null or new.approved \= false then  
   new.approved :\= true;  
 end if;

 if new.verification\_status is null then  
   new.verification\_status :\= 'approved';  
 end if;

 if new.slug is null or new.slug \= '' then  
   select p.full\_name  
   into v\_full\_name  
   from public.profiles p  
   where p.id \= new.id;

   if v\_full\_name is not null then  
     new.slug :\=  
       lower(  
         regexp\_replace(  
           v\_full\_name,  
           '\[^a-zA-Z0-9\]+',  
           '-',  
           'g'  
         )  
       )  
       || '-' || left(new.id::text, 8);  
   else  
     new.slug :\= 'guide-' || left(new.id::text, 8);  
   end if;  
 end if;

 return new;  
end;  
$$;

ALTER FUNCTION "public"."guides\_auto\_approve\_and\_slug"() OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."handle\_new\_user"() RETURNS "trigger"  
   LANGUAGE "plpgsql" SECURITY DEFINER  
   SET "search\_path" TO 'public', 'auth'  
   AS $$  
declare  
 v\_role public.profile\_role;  
 v\_full\_name text;  
 v\_avatar\_url text;  
begin  
 v\_role :\= coalesce((new.raw\_user\_meta\_data\-\>\>'role')::public.profile\_role, 'traveler'::public.profile\_role);  
 v\_full\_name :\= coalesce(new.raw\_user\_meta\_data\-\>\>'full\_name', new.email, 'New user');  
 v\_avatar\_url :\= new.raw\_user\_meta\_data\-\>\>'avatar\_url';

 insert into public.profiles (  
   id, role, full\_name, avatar\_url, is\_suspended  
 )  
 values (  
   new.id, v\_role, v\_full\_name, v\_avatar\_url, false  
 )  
 on conflict (id) do update set  
   role \= excluded.role,  
   full\_name \= excluded.full\_name,  
   avatar\_url \= excluded.avatar\_url,  
   updated\_at \= now();

 if v\_role \= 'guide'::public.profile\_role then  
   insert into public.guides (  
     id,  
     city\_id,  
     headline,  
     bio,  
     experience\_tags,  
     price\_4h,  
     price\_6h,  
     price\_8h,  
     currency,  
     max\_group\_size,  
     instant\_book\_enabled,  
     availability\_pattern,  
     approved,  
     verification\_status  
   )  
   values (  
     new.id,  
     (select id from public.cities where is\_active \= true order by name limit 1),  
     null,  
     null,  
     array\[\]::text\[\],  
     null,  
     null,  
     null,  
     'EUR',  
     6,  
     true,  
     '{}'::jsonb,  
     true,  
     'approved'  
   )  
   on conflict (id) do update set  
     approved \= true,  
     verification\_status \= 'approved',  
     updated\_at \= now();  
 end if;

 return new;  
end;  
$$;

ALTER FUNCTION "public"."handle\_new\_user"() OWNER TO "postgres";

SET default\_tablespace \= '';

SET default\_table\_access\_method \= "heap";

CREATE TABLE IF NOT EXISTS "public"."bookings" (  
   "id" "uuid" DEFAULT "gen\_random\_uuid"() NOT NULL,  
   "traveler\_id" "uuid" NOT NULL,  
   "guide\_id" "uuid" NOT NULL,  
   "city\_id" "uuid" NOT NULL,  
   "start\_at" timestamp with time zone NOT NULL,  
   "duration\_hours" integer NOT NULL,  
   "party\_size" integer,  
   "traveler\_note" "text",  
   "status" "public"."booking\_status" DEFAULT 'draft'::"public"."booking\_status" NOT NULL,  
   "price\_total" numeric DEFAULT 0 NOT NULL,  
   "currency" "text",  
   "accepted\_at" timestamp with time zone,  
   "confirmed\_at" timestamp with time zone,  
   "cancelled\_at" timestamp with time zone,  
   "completed\_at" timestamp with time zone,  
   "stripe\_checkout\_session\_id" "text",  
   "stripe\_payment\_intent\_id" "text",  
   "created\_at" timestamp with time zone DEFAULT "now"() NOT NULL,  
   "updated\_at" timestamp with time zone DEFAULT "now"() NOT NULL,  
   CONSTRAINT "bookings\_duration\_positive" CHECK (("duration\_hours" \> 0))  
);

ALTER TABLE "public"."bookings" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."cities" (  
   "id" "uuid" DEFAULT "gen\_random\_uuid"() NOT NULL,  
   "country\_id" "uuid" NOT NULL,  
   "name" "text" NOT NULL,  
   "slug" "text" NOT NULL,  
   "is\_active" boolean DEFAULT true NOT NULL,  
   "created\_at" timestamp with time zone DEFAULT "now"() NOT NULL,  
   "updated\_at" timestamp with time zone DEFAULT "now"() NOT NULL,  
   "hero\_image\_url" "text",  
   "hero\_image\_path" "text",  
   "hero\_image\_backup\_url" "text",  
   "hero\_image\_source" "text",  
   "hero\_image\_attribution" "text",  
   "hero\_image\_attribution\_url" "text",  
   "hero\_image\_license" "text",  
   "hero\_image\_updated\_at" timestamp with time zone  
);

ALTER TABLE "public"."cities" OWNER TO "postgres";

COMMENT ON COLUMN "public"."cities"."hero\_image\_url" IS 'Hero/banner image URL for city page';

CREATE OR REPLACE VIEW "public"."cities\_with\_approved\_guides" AS  
SELECT  
   NULL::"uuid" AS "id",  
   NULL::"uuid" AS "country\_id",  
   NULL::"text" AS "name",  
   NULL::"text" AS "slug",  
   NULL::boolean AS "is\_active",  
   NULL::timestamp with time zone AS "created\_at",  
   NULL::timestamp with time zone AS "updated\_at",  
   NULL::"text" AS "hero\_image\_url",  
   NULL::"text" AS "hero\_image\_path",  
   NULL::"text" AS "hero\_image\_backup\_url",  
   NULL::"text" AS "hero\_image\_source",  
   NULL::"text" AS "hero\_image\_attribution",  
   NULL::"text" AS "hero\_image\_attribution\_url",  
   NULL::"text" AS "hero\_image\_license",  
   NULL::timestamp with time zone AS "hero\_image\_updated\_at",  
   NULL::"text" AS "country\_name",  
   NULL::character(2) AS "country\_iso\_code",  
   NULL::boolean AS "country\_is\_supported",  
   NULL::bigint AS "approved\_guide\_count";

ALTER VIEW "public"."cities\_with\_approved\_guides" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."countries" (  
   "id" "uuid" DEFAULT "gen\_random\_uuid"() NOT NULL,  
   "name" "text" NOT NULL,  
   "iso\_code" character(2) NOT NULL,  
   "created\_at" timestamp with time zone DEFAULT "now"() NOT NULL,  
   "updated\_at" timestamp with time zone DEFAULT "now"() NOT NULL,  
   "is\_supported" boolean DEFAULT true NOT NULL  
);

ALTER TABLE "public"."countries" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."guide\_photos" (  
   "id" "uuid" DEFAULT "gen\_random\_uuid"() NOT NULL,  
   "guide\_id" "uuid" NOT NULL,  
   "url" "text" NOT NULL,  
   "sort\_order" integer DEFAULT 0 NOT NULL,  
   "created\_at" timestamp with time zone DEFAULT "now"() NOT NULL  
);

ALTER TABLE "public"."guide\_photos" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."profiles" (  
   "id" "uuid" NOT NULL,  
   "role" "public"."profile\_role" DEFAULT 'traveler'::"public"."profile\_role" NOT NULL,  
   "full\_name" "text" NOT NULL,  
   "pronouns" "text",  
   "avatar\_url" "text",  
   "country\_of\_origin" "text",  
   "languages" "text"\[\],  
   "is\_suspended" boolean DEFAULT false NOT NULL,  
   "created\_at" timestamp with time zone DEFAULT "now"() NOT NULL,  
   "updated\_at" timestamp with time zone DEFAULT "now"() NOT NULL,  
   "photo\_url" "text",  
   "bio" "text"  
);

ALTER TABLE "public"."profiles" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."reviews" (  
   "id" "uuid" DEFAULT "gen\_random\_uuid"() NOT NULL,  
   "booking\_id" "uuid" NOT NULL,  
   "author\_id" "uuid" NOT NULL,  
   "subject\_id" "uuid" NOT NULL,  
   "rating" integer NOT NULL,  
   "comment" "text",  
   "created\_at" timestamp with time zone DEFAULT "now"() NOT NULL,  
   CONSTRAINT "reviews\_no\_self\_review" CHECK (("author\_id" \<\> "subject\_id")),  
   CONSTRAINT "reviews\_rating\_check" CHECK ((("rating" \>= 1) AND ("rating" \<= 5)))  
);

ALTER TABLE "public"."reviews" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."guide\_reviews" AS  
SELECT "r"."id",  
   "r"."booking\_id",  
   "r"."author\_id",  
   "r"."subject\_id",  
   "r"."rating",  
   "r"."comment",  
   "r"."created\_at"  
  FROM ("public"."reviews" "r"  
    JOIN "public"."profiles" "p" ON (("p"."id" \= "r"."subject\_id")))  
 WHERE ("p"."role" \= 'guide'::"public"."profile\_role");

ALTER VIEW "public"."guide\_reviews" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."guide\_unavailable\_dates" (  
   "id" "uuid" DEFAULT "gen\_random\_uuid"() NOT NULL,  
   "guide\_id" "uuid" NOT NULL,  
   "start\_date" "date" NOT NULL,  
   "end\_date" "date" NOT NULL,  
   "reason" "text",  
   "created\_at" timestamp with time zone DEFAULT "now"() NOT NULL,  
   CONSTRAINT "guide\_unavailable\_dates\_valid\_range" CHECK (("end\_date" \>= "start\_date"))  
);

ALTER TABLE "public"."guide\_unavailable\_dates" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."guides" (  
   "id" "uuid" NOT NULL,  
   "city\_id" "uuid" NOT NULL,  
   "headline" "text",  
   "bio" "text",  
   "experience\_tags" "text"\[\],  
   "price\_4h" numeric,  
   "price\_6h" numeric,  
   "price\_8h" numeric,  
   "currency" "text",  
   "max\_group\_size" integer,  
   "instant\_book\_enabled" boolean DEFAULT false NOT NULL,  
   "availability\_pattern" "jsonb",  
   "approved" boolean DEFAULT false NOT NULL,  
   "verification\_status" "public"."verification\_status" DEFAULT 'pending'::"public"."verification\_status" NOT NULL,  
   "id\_document\_url" "text",  
   "reviewed\_by" "uuid",  
   "reviewed\_at" timestamp with time zone,  
   "created\_at" timestamp with time zone DEFAULT "now"() NOT NULL,  
   "updated\_at" timestamp with time zone DEFAULT "now"() NOT NULL,  
   "status" "public"."guide\_status" DEFAULT 'pending'::"public"."guide\_status" NOT NULL,  
   "slug" "text",  
   "tagline" "text",  
   "available\_days" "text"\[\],  
   "typical\_start\_time" time without time zone,  
   "typical\_end\_time" time without time zone,  
   "lgbtq\_alignment" "jsonb",  
   "about" "text",  
   "languages" "text"\[\] DEFAULT '{}'::"text"\[\],  
   "themes" "text"\[\] DEFAULT '{}'::"text"\[\],  
   "is\_verified" boolean DEFAULT false NOT NULL,  
   "base\_price\_4h" numeric(10,2),  
   "base\_price\_6h" numeric(10,2),  
   "base\_price\_8h" numeric(10,2),  
   "hourly\_rate" numeric(10,2)  
);

ALTER TABLE "public"."guides" OWNER TO "postgres";

COMMENT ON COLUMN "public"."guides"."headline" IS 'Tour headline';

COMMENT ON COLUMN "public"."guides"."bio" IS 'Short bio about the guide';

COMMENT ON COLUMN "public"."guides"."experience\_tags" IS 'Guide specialties/experience tags';

COMMENT ON COLUMN "public"."guides"."approved" IS 'Admin approval status (boolean)';

COMMENT ON COLUMN "public"."guides"."status" IS 'Guide status (enum: draft, pending, approved, rejected)';

COMMENT ON COLUMN "public"."guides"."slug" IS 'URL-friendly identifier for guide profile pages';

COMMENT ON COLUMN "public"."guides"."tagline" IS 'Short headline (deprecated, use headline)';

COMMENT ON COLUMN "public"."guides"."available\_days" IS 'Days of week guide is available';

COMMENT ON COLUMN "public"."guides"."typical\_start\_time" IS 'Typical tour start time';

COMMENT ON COLUMN "public"."guides"."typical\_end\_time" IS 'Typical tour end time';

COMMENT ON COLUMN "public"."guides"."lgbtq\_alignment" IS 'LGBTQ+ alignment responses (JSON)';

COMMENT ON COLUMN "public"."guides"."about" IS 'Detailed tour description';

COMMENT ON COLUMN "public"."guides"."themes" IS 'Tour themes (legacy)';

CREATE TABLE IF NOT EXISTS "public"."messages" (  
   "id" "uuid" DEFAULT "gen\_random\_uuid"() NOT NULL,  
   "booking\_id" "uuid" NOT NULL,  
   "sender\_id" "uuid" NOT NULL,  
   "body" "text" NOT NULL,  
   "created\_at" timestamp with time zone DEFAULT "now"() NOT NULL  
);

ALTER TABLE "public"."messages" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."review\_replies" (  
   "id" "uuid" DEFAULT "gen\_random\_uuid"() NOT NULL,  
   "review\_id" "uuid" NOT NULL,  
   "author\_id" "uuid" NOT NULL,  
   "body" "text" NOT NULL,  
   "created\_at" timestamp with time zone DEFAULT "now"() NOT NULL  
);

ALTER TABLE "public"."review\_replies" OWNER TO "postgres";

CREATE OR REPLACE VIEW "public"."traveler\_reviews" AS  
SELECT "r"."id",  
   "r"."booking\_id",  
   "r"."author\_id",  
   "r"."subject\_id",  
   "r"."rating",  
   "r"."comment",  
   "r"."created\_at"  
  FROM ("public"."reviews" "r"  
    JOIN "public"."profiles" "p" ON (("p"."id" \= "r"."subject\_id")))  
 WHERE ("p"."role" \= 'traveler'::"public"."profile\_role");

ALTER VIEW "public"."traveler\_reviews" OWNER TO "postgres";

ALTER TABLE ONLY "public"."bookings"  
   ADD CONSTRAINT "bookings\_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."cities"  
   ADD CONSTRAINT "cities\_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."cities"  
   ADD CONSTRAINT "cities\_slug\_key" UNIQUE ("slug");

ALTER TABLE ONLY "public"."countries"  
   ADD CONSTRAINT "countries\_iso\_code\_key" UNIQUE ("iso\_code");

ALTER TABLE ONLY "public"."countries"  
   ADD CONSTRAINT "countries\_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."guide\_photos"  
   ADD CONSTRAINT "guide\_photos\_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."guide\_unavailable\_dates"  
   ADD CONSTRAINT "guide\_unavailable\_dates\_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."guides"  
   ADD CONSTRAINT "guides\_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."messages"  
   ADD CONSTRAINT "messages\_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."profiles"  
   ADD CONSTRAINT "profiles\_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."review\_replies"  
   ADD CONSTRAINT "review\_replies\_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."reviews"  
   ADD CONSTRAINT "reviews\_pkey" PRIMARY KEY ("id");

CREATE INDEX "bookings\_city\_id\_idx" ON "public"."bookings" USING "btree" ("city\_id");

CREATE INDEX "bookings\_guide\_id\_idx" ON "public"."bookings" USING "btree" ("guide\_id");

CREATE INDEX "bookings\_start\_at\_idx" ON "public"."bookings" USING "btree" ("start\_at");

CREATE INDEX "bookings\_status\_idx" ON "public"."bookings" USING "btree" ("status");

CREATE INDEX "bookings\_traveler\_id\_idx" ON "public"."bookings" USING "btree" ("traveler\_id");

CREATE INDEX "cities\_country\_id\_idx" ON "public"."cities" USING "btree" ("country\_id");

CREATE INDEX "cities\_is\_active\_idx" ON "public"."cities" USING "btree" ("is\_active");

CREATE UNIQUE INDEX "cities\_slug\_unique" ON "public"."cities" USING "btree" ("slug");

CREATE UNIQUE INDEX "countries\_iso\_code\_unique" ON "public"."countries" USING "btree" ("iso\_code");

CREATE INDEX "guide\_photos\_guide\_id\_idx" ON "public"."guide\_photos" USING "btree" ("guide\_id");

CREATE UNIQUE INDEX "guide\_photos\_guide\_sort\_unique" ON "public"."guide\_photos" USING "btree" ("guide\_id", "sort\_order");

CREATE INDEX "guide\_unavailable\_dates\_guide\_id\_idx" ON "public"."guide\_unavailable\_dates" USING "btree" ("guide\_id");

CREATE INDEX "guide\_unavailable\_dates\_range\_idx" ON "public"."guide\_unavailable\_dates" USING "btree" ("start\_date", "end\_date");

CREATE INDEX "guides\_approved\_idx" ON "public"."guides" USING "btree" ("approved");

CREATE INDEX "guides\_city\_id\_idx" ON "public"."guides" USING "btree" ("city\_id");

CREATE INDEX "guides\_is\_verified\_idx" ON "public"."guides" USING "btree" ("is\_verified");

CREATE UNIQUE INDEX "guides\_slug\_unique\_idx" ON "public"."guides" USING "btree" ("slug") WHERE ("slug" IS NOT NULL);

CREATE INDEX "guides\_status\_idx" ON "public"."guides" USING "btree" ("status");

CREATE INDEX "guides\_verification\_status\_idx" ON "public"."guides" USING "btree" ("verification\_status");

CREATE INDEX "messages\_booking\_id\_idx" ON "public"."messages" USING "btree" ("booking\_id");

CREATE INDEX "messages\_created\_at\_idx" ON "public"."messages" USING "btree" ("created\_at");

CREATE INDEX "messages\_sender\_id\_idx" ON "public"."messages" USING "btree" ("sender\_id");

CREATE INDEX "profiles\_is\_suspended\_idx" ON "public"."profiles" USING "btree" ("is\_suspended");

CREATE INDEX "profiles\_role\_idx" ON "public"."profiles" USING "btree" ("role");

CREATE INDEX "review\_replies\_author\_id\_idx" ON "public"."review\_replies" USING "btree" ("author\_id");

CREATE INDEX "review\_replies\_review\_id\_idx" ON "public"."review\_replies" USING "btree" ("review\_id");

CREATE INDEX "reviews\_author\_id\_idx" ON "public"."reviews" USING "btree" ("author\_id");

CREATE UNIQUE INDEX "reviews\_booking\_author\_subject\_unique" ON "public"."reviews" USING "btree" ("booking\_id", "author\_id", "subject\_id");

CREATE INDEX "reviews\_booking\_id\_idx" ON "public"."reviews" USING "btree" ("booking\_id");

CREATE INDEX "reviews\_subject\_id\_idx" ON "public"."reviews" USING "btree" ("subject\_id");

CREATE OR REPLACE VIEW "public"."cities\_with\_approved\_guides" AS  
SELECT "c"."id",  
   "c"."country\_id",  
   "c"."name",  
   "c"."slug",  
   "c"."is\_active",  
   "c"."created\_at",  
   "c"."updated\_at",  
   "c"."hero\_image\_url",  
   "c"."hero\_image\_path",  
   "c"."hero\_image\_backup\_url",  
   "c"."hero\_image\_source",  
   "c"."hero\_image\_attribution",  
   "c"."hero\_image\_attribution\_url",  
   "c"."hero\_image\_license",  
   "c"."hero\_image\_updated\_at",  
   "co"."name" AS "country\_name",  
   "co"."iso\_code" AS "country\_iso\_code",  
   "co"."is\_supported" AS "country\_is\_supported",  
   "count"("g"."id") FILTER (WHERE ("g"."approved" \= true)) AS "approved\_guide\_count"  
  FROM (("public"."cities" "c"  
    JOIN "public"."countries" "co" ON (("co"."id" \= "c"."country\_id")))  
    LEFT JOIN "public"."guides" "g" ON (("g"."city\_id" \= "c"."id")))  
 GROUP BY "c"."id", "co"."name", "co"."iso\_code", "co"."is\_supported";

CREATE OR REPLACE TRIGGER "guides\_before\_insert\_auto\_approve" BEFORE INSERT ON "public"."guides" FOR EACH ROW EXECUTE FUNCTION "public"."guides\_auto\_approve\_and\_slug"();

CREATE OR REPLACE TRIGGER "guides\_before\_update\_auto\_approve" BEFORE UPDATE ON "public"."guides" FOR EACH ROW EXECUTE FUNCTION "public"."guides\_auto\_approve\_and\_slug"();

CREATE OR REPLACE TRIGGER "trg\_enforce\_review\_booking\_participants" BEFORE INSERT OR UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."enforce\_review\_booking\_participants"();

ALTER TABLE ONLY "public"."bookings"  
   ADD CONSTRAINT "bookings\_city\_id\_fkey" FOREIGN KEY ("city\_id") REFERENCES "public"."cities"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."bookings"  
   ADD CONSTRAINT "bookings\_guide\_id\_fkey" FOREIGN KEY ("guide\_id") REFERENCES "public"."guides"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."bookings"  
   ADD CONSTRAINT "bookings\_traveler\_id\_fkey" FOREIGN KEY ("traveler\_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."cities"  
   ADD CONSTRAINT "cities\_country\_id\_fkey" FOREIGN KEY ("country\_id") REFERENCES "public"."countries"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."guide\_photos"  
   ADD CONSTRAINT "guide\_photos\_guide\_id\_fkey" FOREIGN KEY ("guide\_id") REFERENCES "public"."guides"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."guide\_unavailable\_dates"  
   ADD CONSTRAINT "guide\_unavailable\_dates\_guide\_id\_fkey" FOREIGN KEY ("guide\_id") REFERENCES "public"."guides"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."guides"  
   ADD CONSTRAINT "guides\_city\_id\_fkey" FOREIGN KEY ("city\_id") REFERENCES "public"."cities"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."guides"  
   ADD CONSTRAINT "guides\_id\_fkey" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."guides"  
   ADD CONSTRAINT "guides\_reviewed\_by\_fkey" FOREIGN KEY ("reviewed\_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;

ALTER TABLE ONLY "public"."messages"  
   ADD CONSTRAINT "messages\_booking\_id\_fkey" FOREIGN KEY ("booking\_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."messages"  
   ADD CONSTRAINT "messages\_sender\_id\_fkey" FOREIGN KEY ("sender\_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."profiles"  
   ADD CONSTRAINT "profiles\_id\_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."review\_replies"  
   ADD CONSTRAINT "review\_replies\_author\_id\_fkey" FOREIGN KEY ("author\_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."review\_replies"  
   ADD CONSTRAINT "review\_replies\_review\_id\_fkey" FOREIGN KEY ("review\_id") REFERENCES "public"."reviews"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."reviews"  
   ADD CONSTRAINT "reviews\_author\_id\_fkey" FOREIGN KEY ("author\_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."reviews"  
   ADD CONSTRAINT "reviews\_booking\_id\_fkey" FOREIGN KEY ("booking\_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."reviews"  
   ADD CONSTRAINT "reviews\_subject\_id\_fkey" FOREIGN KEY ("subject\_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;

CREATE POLICY "Authenticated users can create bookings" ON "public"."bookings" FOR INSERT WITH CHECK (("auth"."uid"() \= "traveler\_id"));

CREATE POLICY "Guides can read assigned bookings" ON "public"."bookings" FOR SELECT TO "authenticated" USING (("auth"."uid"() \= "guide\_id"));

CREATE POLICY "Travelers can create bookings" ON "public"."bookings" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() \= "traveler\_id"));

CREATE POLICY "Travelers can read own bookings" ON "public"."bookings" FOR SELECT TO "authenticated" USING (("auth"."uid"() \= "traveler\_id"));

ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings\_guide\_update\_assigned" ON "public"."bookings" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() \= "guide\_id") AND (EXISTS ( SELECT 1  
  FROM "public"."profiles" "p"  
 WHERE (("p"."id" \= "auth"."uid"()) AND ("p"."role" \= 'guide'::"public"."profile\_role") AND ("p"."is\_suspended" \= false)))))) WITH CHECK ((("auth"."uid"() \= "guide\_id") AND (EXISTS ( SELECT 1  
  FROM "public"."profiles" "p"  
 WHERE (("p"."id" \= "auth"."uid"()) AND ("p"."role" \= 'guide'::"public"."profile\_role") AND ("p"."is\_suspended" \= false))))));

CREATE POLICY "bookings\_participants\_read" ON "public"."bookings" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1  
  FROM "public"."profiles" "p"  
 WHERE (("p"."id" \= "auth"."uid"()) AND ("p"."is\_suspended" \= false)))) AND (("auth"."uid"() \= "traveler\_id") OR ("auth"."uid"() \= "guide\_id"))));

CREATE POLICY "bookings\_traveler\_create" ON "public"."bookings" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() \= "traveler\_id") AND (EXISTS ( SELECT 1  
  FROM "public"."profiles" "p"  
 WHERE (("p"."id" \= "auth"."uid"()) AND ("p"."role" \= 'traveler'::"public"."profile\_role") AND ("p"."is\_suspended" \= false)))) AND (EXISTS ( SELECT 1  
  FROM "public"."guides" "g"  
 WHERE (("g"."id" \= "bookings"."guide\_id") AND ("g"."approved" \= true))))));

CREATE POLICY "bookings\_traveler\_update\_own" ON "public"."bookings" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() \= "traveler\_id") AND (EXISTS ( SELECT 1  
  FROM "public"."profiles" "p"  
 WHERE (("p"."id" \= "auth"."uid"()) AND ("p"."role" \= 'traveler'::"public"."profile\_role") AND ("p"."is\_suspended" \= false)))))) WITH CHECK ((("auth"."uid"() \= "traveler\_id") AND (EXISTS ( SELECT 1  
  FROM "public"."profiles" "p"  
 WHERE (("p"."id" \= "auth"."uid"()) AND ("p"."role" \= 'traveler'::"public"."profile\_role") AND ("p"."is\_suspended" \= false))))));

ALTER TABLE "public"."cities" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cities\_public\_read" ON "public"."cities" FOR SELECT USING (("is\_active" \= true));

ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "countries\_public\_read" ON "public"."countries" FOR SELECT USING (true);

ALTER TABLE "public"."guide\_photos" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guide\_photos\_guide\_manage\_own" ON "public"."guide\_photos" TO "authenticated" USING (("auth"."uid"() \= "guide\_id")) WITH CHECK (("auth"."uid"() \= "guide\_id"));

CREATE POLICY "guide\_photos\_public\_read" ON "public"."guide\_photos" FOR SELECT USING (true);

ALTER TABLE "public"."guide\_unavailable\_dates" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."guides" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "guides\_insert\_own" ON "public"."guides" FOR INSERT TO "authenticated" WITH CHECK (("id" \= "auth"."uid"()));

CREATE POLICY "guides\_select\_all" ON "public"."guides" FOR SELECT USING (true);

CREATE POLICY "guides\_update\_own" ON "public"."guides" FOR UPDATE TO "authenticated" USING (("id" \= "auth"."uid"())) WITH CHECK (("id" \= "auth"."uid"()));

ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages\_participants\_read" ON "public"."messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1  
  FROM "public"."bookings" "b"  
 WHERE (("b"."id" \= "messages"."booking\_id") AND (("b"."traveler\_id" \= "auth"."uid"()) OR ("b"."guide\_id" \= "auth"."uid"()))))));

CREATE POLICY "messages\_participants\_send" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() \= "sender\_id") AND (EXISTS ( SELECT 1  
  FROM "public"."bookings" "b"  
 WHERE (("b"."id" \= "messages"."booking\_id") AND (("b"."traveler\_id" \= "auth"."uid"()) OR ("b"."guide\_id" \= "auth"."uid"())) AND ("b"."status" \= ANY (ARRAY\['accepted'::"public"."booking\_status", 'awaiting\_payment'::"public"."booking\_status", 'confirmed'::"public"."booking\_status", 'completed'::"public"."booking\_status"\])))))));

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles\_insert\_own" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" \= "auth"."uid"()));

CREATE POLICY "profiles\_select\_all" ON "public"."profiles" FOR SELECT USING (true);

CREATE POLICY "profiles\_update\_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" \= "auth"."uid"())) WITH CHECK (("id" \= "auth"."uid"()));

ALTER TABLE "public"."review\_replies" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review\_replies\_author\_update" ON "public"."review\_replies" FOR UPDATE TO "authenticated" USING (("auth"."uid"() \= "author\_id")) WITH CHECK (("auth"."uid"() \= "author\_id"));

CREATE POLICY "review\_replies\_participants\_create" ON "public"."review\_replies" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() \= "author\_id") AND (EXISTS ( SELECT 1  
  FROM ("public"."reviews" "r"  
    JOIN "public"."bookings" "b" ON (("b"."id" \= "r"."booking\_id")))  
 WHERE (("r"."id" \= "review\_replies"."review\_id") AND (("b"."traveler\_id" \= "auth"."uid"()) OR ("b"."guide\_id" \= "auth"."uid"())))))));

CREATE POLICY "review\_replies\_public\_read" ON "public"."review\_replies" FOR SELECT USING (true);

ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews\_author\_update" ON "public"."reviews" FOR UPDATE TO "authenticated" USING (("auth"."uid"() \= "author\_id")) WITH CHECK (("auth"."uid"() \= "author\_id"));

CREATE POLICY "reviews\_participants\_create" ON "public"."reviews" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() \= "author\_id") AND (EXISTS ( SELECT 1  
  FROM "public"."bookings" "b"  
 WHERE (("b"."id" \= "reviews"."booking\_id") AND ("b"."status" \= 'completed'::"public"."booking\_status") AND ((("b"."traveler\_id" \= "reviews"."author\_id") AND ("b"."guide\_id" \= "reviews"."subject\_id")) OR (("b"."guide\_id" \= "reviews"."author\_id") AND ("b"."traveler\_id" \= "reviews"."subject\_id"))))))));

CREATE POLICY "reviews\_public\_read" ON "public"."reviews" FOR SELECT USING (true);

CREATE POLICY "unavailable\_guide\_manage\_own" ON "public"."guide\_unavailable\_dates" TO "authenticated" USING ((("auth"."uid"() \= "guide\_id") AND (EXISTS ( SELECT 1  
  FROM "public"."profiles" "p"  
 WHERE (("p"."id" \= "auth"."uid"()) AND ("p"."role" \= 'guide'::"public"."profile\_role") AND ("p"."is\_suspended" \= false)))))) WITH CHECK ((("auth"."uid"() \= "guide\_id") AND (EXISTS ( SELECT 1  
  FROM "public"."profiles" "p"  
 WHERE (("p"."id" \= "auth"."uid"()) AND ("p"."role" \= 'guide'::"public"."profile\_role") AND ("p"."is\_suspended" \= false))))));

CREATE POLICY "unavailable\_public\_read" ON "public"."guide\_unavailable\_dates" FOR SELECT USING (true);

GRANT USAGE ON SCHEMA "public" TO "postgres";  
GRANT USAGE ON SCHEMA "public" TO "anon";  
GRANT USAGE ON SCHEMA "public" TO "authenticated";  
GRANT USAGE ON SCHEMA "public" TO "service\_role";

GRANT ALL ON FUNCTION "public"."enforce\_review\_booking\_participants"() TO "anon";  
GRANT ALL ON FUNCTION "public"."enforce\_review\_booking\_participants"() TO "authenticated";  
GRANT ALL ON FUNCTION "public"."enforce\_review\_booking\_participants"() TO "service\_role";

GRANT ALL ON FUNCTION "public"."guides\_auto\_approve\_and\_slug"() TO "anon";  
GRANT ALL ON FUNCTION "public"."guides\_auto\_approve\_and\_slug"() TO "authenticated";  
GRANT ALL ON FUNCTION "public"."guides\_auto\_approve\_and\_slug"() TO "service\_role";

GRANT ALL ON FUNCTION "public"."handle\_new\_user"() TO "anon";  
GRANT ALL ON FUNCTION "public"."handle\_new\_user"() TO "authenticated";  
GRANT ALL ON FUNCTION "public"."handle\_new\_user"() TO "service\_role";

GRANT ALL ON TABLE "public"."bookings" TO "anon";  
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";  
GRANT ALL ON TABLE "public"."bookings" TO "service\_role";

GRANT ALL ON TABLE "public"."cities" TO "anon";  
GRANT ALL ON TABLE "public"."cities" TO "authenticated";  
GRANT ALL ON TABLE "public"."cities" TO "service\_role";

GRANT ALL ON TABLE "public"."cities\_with\_approved\_guides" TO "anon";  
GRANT ALL ON TABLE "public"."cities\_with\_approved\_guides" TO "authenticated";  
GRANT ALL ON TABLE "public"."cities\_with\_approved\_guides" TO "service\_role";

GRANT ALL ON TABLE "public"."countries" TO "anon";  
GRANT ALL ON TABLE "public"."countries" TO "authenticated";  
GRANT ALL ON TABLE "public"."countries" TO "service\_role";

GRANT ALL ON TABLE "public"."guide\_photos" TO "anon";  
GRANT ALL ON TABLE "public"."guide\_photos" TO "authenticated";  
GRANT ALL ON TABLE "public"."guide\_photos" TO "service\_role";

GRANT ALL ON TABLE "public"."profiles" TO "anon";  
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";  
GRANT ALL ON TABLE "public"."profiles" TO "service\_role";

GRANT ALL ON TABLE "public"."reviews" TO "anon";  
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";  
GRANT ALL ON TABLE "public"."reviews" TO "service\_role";

GRANT ALL ON TABLE "public"."guide\_reviews" TO "anon";  
GRANT ALL ON TABLE "public"."guide\_reviews" TO "authenticated";  
GRANT ALL ON TABLE "public"."guide\_reviews" TO "service\_role";

GRANT ALL ON TABLE "public"."guide\_unavailable\_dates" TO "anon";  
GRANT ALL ON TABLE "public"."guide\_unavailable\_dates" TO "authenticated";  
GRANT ALL ON TABLE "public"."guide\_unavailable\_dates" TO "service\_role";

GRANT ALL ON TABLE "public"."guides" TO "anon";  
GRANT ALL ON TABLE "public"."guides" TO "authenticated";  
GRANT ALL ON TABLE "public"."guides" TO "service\_role";

GRANT ALL ON TABLE "public"."messages" TO "anon";  
GRANT ALL ON TABLE "public"."messages" TO "authenticated";  
GRANT ALL ON TABLE "public"."messages" TO "service\_role";

GRANT ALL ON TABLE "public"."review\_replies" TO "anon";  
GRANT ALL ON TABLE "public"."review\_replies" TO "authenticated";  
GRANT ALL ON TABLE "public"."review\_replies" TO "service\_role";

GRANT ALL ON TABLE "public"."traveler\_reviews" TO "anon";  
GRANT ALL ON TABLE "public"."traveler\_reviews" TO "authenticated";  
GRANT ALL ON TABLE "public"."traveler\_reviews" TO "service\_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";  
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";  
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";  
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service\_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";  
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";  
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";  
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service\_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";  
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";  
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";  
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service\_role";

