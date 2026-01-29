


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."booking_status" AS ENUM (
    'draft',
    'pending',
    'accepted',
    'awaiting_payment',
    'confirmed',
    'declined',
    'cancelled_by_traveler',
    'cancelled_by_guide',
    'completed'
);


ALTER TYPE "public"."booking_status" OWNER TO "postgres";


CREATE TYPE "public"."guide_status" AS ENUM (
    'pending',
    'approved',
    'rejected',
    'draft'
);


ALTER TYPE "public"."guide_status" OWNER TO "postgres";


CREATE TYPE "public"."profile_role" AS ENUM (
    'traveler',
    'guide',
    'admin'
);


ALTER TYPE "public"."profile_role" OWNER TO "postgres";


CREATE TYPE "public"."verification_status" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE "public"."verification_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_review_booking_participants"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  b_traveler uuid;
  b_guide_profile uuid;
begin
  select b.traveler_id, g.id
    into b_traveler, b_guide_profile
  from public.bookings b
  join public.guides g on g.id = b.guide_id
  where b.id = new.booking_id;

  if b_traveler is null or b_guide_profile is null then
    raise exception 'Invalid booking_id: %', new.booking_id;
  end if;

  if not (
    (new.author_id = b_traveler and new.subject_id = b_guide_profile) or
    (new.author_id = b_guide_profile and new.subject_id = b_traveler)
  ) then
    raise exception 'Review must be between booking participants';
  end if;

  if not exists (select 1 from public.bookings b2 where b2.id = new.booking_id and b2.status = 'completed'::public.booking_status) then
    raise exception 'Review allowed only for completed bookings';
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."enforce_review_booking_participants"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."guides_auto_approve_and_slug"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_full_name text;
begin
  if new.approved is null or new.approved = false then
    new.approved := true;
  end if;

  if new.verification_status is null then
    new.verification_status := 'approved';
  end if;

  if new.slug is null or new.slug = '' then
    select p.full_name
    into v_full_name
    from public.profiles p
    where p.id = new.id;

    if v_full_name is not null then
      new.slug :=
        lower(
          regexp_replace(
            v_full_name,
            '[^a-zA-Z0-9]+',
            '-',
            'g'
          )
        )
        || '-' || left(new.id::text, 8);
    else
      new.slug := 'guide-' || left(new.id::text, 8);
    end if;
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."guides_auto_approve_and_slug"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
declare
  v_role public.profile_role;
  v_full_name text;
  v_avatar_url text;
begin
  v_role := coalesce((new.raw_user_meta_data->>'role')::public.profile_role, 'traveler'::public.profile_role);
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', new.email, 'New user');
  v_avatar_url := new.raw_user_meta_data->>'avatar_url';

  insert into public.profiles (
    id, role, full_name, avatar_url, is_suspended
  )
  values (
    new.id, v_role, v_full_name, v_avatar_url, false
  )
  on conflict (id) do update set
    role = excluded.role,
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url,
    updated_at = now();

  if v_role = 'guide'::public.profile_role then
    insert into public.guides (
      id,
      city_id,
      headline,
      bio,
      experience_tags,
      price_4h,
      price_6h,
      price_8h,
      currency,
      max_group_size,
      instant_book_enabled,
      availability_pattern,
      approved,
      verification_status
    )
    values (
      new.id,
      (select id from public.cities where is_active = true order by name limit 1),
      null,
      null,
      array[]::text[],
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
      approved = true,
      verification_status = 'approved',
      updated_at = now();
  end if;

  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."bookings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "traveler_id" "uuid" NOT NULL,
    "guide_id" "uuid" NOT NULL,
    "city_id" "uuid" NOT NULL,
    "start_at" timestamp with time zone NOT NULL,
    "duration_hours" integer NOT NULL,
    "party_size" integer,
    "traveler_note" "text",
    "status" "public"."booking_status" DEFAULT 'draft'::"public"."booking_status" NOT NULL,
    "price_total" numeric DEFAULT 0 NOT NULL,
    "currency" "text",
    "accepted_at" timestamp with time zone,
    "confirmed_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "stripe_checkout_session_id" "text",
    "stripe_payment_intent_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "bookings_duration_positive" CHECK (("duration_hours" > 0))
);


ALTER TABLE "public"."bookings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "country_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "hero_image_url" "text",
    "hero_image_path" "text",
    "hero_image_backup_url" "text",
    "hero_image_source" "text",
    "hero_image_attribution" "text",
    "hero_image_attribution_url" "text",
    "hero_image_license" "text",
    "hero_image_updated_at" timestamp with time zone
);


ALTER TABLE "public"."cities" OWNER TO "postgres";


COMMENT ON COLUMN "public"."cities"."hero_image_url" IS 'Hero/banner image URL for city page';



CREATE OR REPLACE VIEW "public"."cities_with_approved_guides" AS
SELECT
    NULL::"uuid" AS "id",
    NULL::"uuid" AS "country_id",
    NULL::"text" AS "name",
    NULL::"text" AS "slug",
    NULL::boolean AS "is_active",
    NULL::timestamp with time zone AS "created_at",
    NULL::timestamp with time zone AS "updated_at",
    NULL::"text" AS "hero_image_url",
    NULL::"text" AS "hero_image_path",
    NULL::"text" AS "hero_image_backup_url",
    NULL::"text" AS "hero_image_source",
    NULL::"text" AS "hero_image_attribution",
    NULL::"text" AS "hero_image_attribution_url",
    NULL::"text" AS "hero_image_license",
    NULL::timestamp with time zone AS "hero_image_updated_at",
    NULL::"text" AS "country_name",
    NULL::character(2) AS "country_iso_code",
    NULL::boolean AS "country_is_supported",
    NULL::bigint AS "approved_guide_count";


ALTER VIEW "public"."cities_with_approved_guides" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."countries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "iso_code" character(2) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_supported" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."countries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guide_photos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guide_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."guide_photos" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "role" "public"."profile_role" DEFAULT 'traveler'::"public"."profile_role" NOT NULL,
    "full_name" "text" NOT NULL,
    "pronouns" "text",
    "avatar_url" "text",
    "country_of_origin" "text",
    "languages" "text"[],
    "is_suspended" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "photo_url" "text",
    "bio" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "subject_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "reviews_no_self_review" CHECK (("author_id" <> "subject_id")),
    CONSTRAINT "reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."reviews" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."guide_reviews" AS
 SELECT "r"."id",
    "r"."booking_id",
    "r"."author_id",
    "r"."subject_id",
    "r"."rating",
    "r"."comment",
    "r"."created_at"
   FROM ("public"."reviews" "r"
     JOIN "public"."profiles" "p" ON (("p"."id" = "r"."subject_id")))
  WHERE ("p"."role" = 'guide'::"public"."profile_role");


ALTER VIEW "public"."guide_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guide_unavailable_dates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guide_id" "uuid" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "guide_unavailable_dates_valid_range" CHECK (("end_date" >= "start_date"))
);


ALTER TABLE "public"."guide_unavailable_dates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."guides" (
    "id" "uuid" NOT NULL,
    "city_id" "uuid" NOT NULL,
    "headline" "text",
    "bio" "text",
    "experience_tags" "text"[],
    "price_4h" numeric,
    "price_6h" numeric,
    "price_8h" numeric,
    "currency" "text",
    "max_group_size" integer,
    "instant_book_enabled" boolean DEFAULT false NOT NULL,
    "availability_pattern" "jsonb",
    "approved" boolean DEFAULT false NOT NULL,
    "verification_status" "public"."verification_status" DEFAULT 'pending'::"public"."verification_status" NOT NULL,
    "id_document_url" "text",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "public"."guide_status" DEFAULT 'pending'::"public"."guide_status" NOT NULL,
    "slug" "text",
    "tagline" "text",
    "available_days" "text"[],
    "typical_start_time" time without time zone,
    "typical_end_time" time without time zone,
    "lgbtq_alignment" "jsonb",
    "about" "text",
    "languages" "text"[] DEFAULT '{}'::"text"[],
    "themes" "text"[] DEFAULT '{}'::"text"[],
    "is_verified" boolean DEFAULT false NOT NULL,
    "base_price_4h" numeric(10,2),
    "base_price_6h" numeric(10,2),
    "base_price_8h" numeric(10,2),
    "hourly_rate" numeric(10,2)
);


ALTER TABLE "public"."guides" OWNER TO "postgres";


COMMENT ON COLUMN "public"."guides"."headline" IS 'Tour headline';



COMMENT ON COLUMN "public"."guides"."bio" IS 'Short bio about the guide';



COMMENT ON COLUMN "public"."guides"."experience_tags" IS 'Guide specialties/experience tags';



COMMENT ON COLUMN "public"."guides"."approved" IS 'Admin approval status (boolean)';



COMMENT ON COLUMN "public"."guides"."status" IS 'Guide status (enum: draft, pending, approved, rejected)';



COMMENT ON COLUMN "public"."guides"."slug" IS 'URL-friendly identifier for guide profile pages';



COMMENT ON COLUMN "public"."guides"."tagline" IS 'Short headline (deprecated, use headline)';



COMMENT ON COLUMN "public"."guides"."available_days" IS 'Days of week guide is available';



COMMENT ON COLUMN "public"."guides"."typical_start_time" IS 'Typical tour start time';



COMMENT ON COLUMN "public"."guides"."typical_end_time" IS 'Typical tour end time';



COMMENT ON COLUMN "public"."guides"."lgbtq_alignment" IS 'LGBTQ+ alignment responses (JSON)';



COMMENT ON COLUMN "public"."guides"."about" IS 'Detailed tour description';



COMMENT ON COLUMN "public"."guides"."themes" IS 'Tour themes (legacy)';



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "booking_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."review_replies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "review_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."review_replies" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."traveler_reviews" AS
 SELECT "r"."id",
    "r"."booking_id",
    "r"."author_id",
    "r"."subject_id",
    "r"."rating",
    "r"."comment",
    "r"."created_at"
   FROM ("public"."reviews" "r"
     JOIN "public"."profiles" "p" ON (("p"."id" = "r"."subject_id")))
  WHERE ("p"."role" = 'traveler'::"public"."profile_role");


ALTER VIEW "public"."traveler_reviews" OWNER TO "postgres";


ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_iso_code_key" UNIQUE ("iso_code");



ALTER TABLE ONLY "public"."countries"
    ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guide_photos"
    ADD CONSTRAINT "guide_photos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guide_unavailable_dates"
    ADD CONSTRAINT "guide_unavailable_dates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."guides"
    ADD CONSTRAINT "guides_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."review_replies"
    ADD CONSTRAINT "review_replies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



CREATE INDEX "bookings_city_id_idx" ON "public"."bookings" USING "btree" ("city_id");



CREATE INDEX "bookings_guide_id_idx" ON "public"."bookings" USING "btree" ("guide_id");



CREATE INDEX "bookings_start_at_idx" ON "public"."bookings" USING "btree" ("start_at");



CREATE INDEX "bookings_status_idx" ON "public"."bookings" USING "btree" ("status");



CREATE INDEX "bookings_traveler_id_idx" ON "public"."bookings" USING "btree" ("traveler_id");



CREATE INDEX "cities_country_id_idx" ON "public"."cities" USING "btree" ("country_id");



CREATE INDEX "cities_is_active_idx" ON "public"."cities" USING "btree" ("is_active");



CREATE UNIQUE INDEX "cities_slug_unique" ON "public"."cities" USING "btree" ("slug");



CREATE UNIQUE INDEX "countries_iso_code_unique" ON "public"."countries" USING "btree" ("iso_code");



CREATE INDEX "guide_photos_guide_id_idx" ON "public"."guide_photos" USING "btree" ("guide_id");



CREATE UNIQUE INDEX "guide_photos_guide_sort_unique" ON "public"."guide_photos" USING "btree" ("guide_id", "sort_order");



CREATE INDEX "guide_unavailable_dates_guide_id_idx" ON "public"."guide_unavailable_dates" USING "btree" ("guide_id");



CREATE INDEX "guide_unavailable_dates_range_idx" ON "public"."guide_unavailable_dates" USING "btree" ("start_date", "end_date");



CREATE INDEX "guides_approved_idx" ON "public"."guides" USING "btree" ("approved");



CREATE INDEX "guides_city_id_idx" ON "public"."guides" USING "btree" ("city_id");



CREATE INDEX "guides_is_verified_idx" ON "public"."guides" USING "btree" ("is_verified");



CREATE UNIQUE INDEX "guides_slug_unique_idx" ON "public"."guides" USING "btree" ("slug") WHERE ("slug" IS NOT NULL);



CREATE INDEX "guides_status_idx" ON "public"."guides" USING "btree" ("status");



CREATE INDEX "guides_verification_status_idx" ON "public"."guides" USING "btree" ("verification_status");



CREATE INDEX "messages_booking_id_idx" ON "public"."messages" USING "btree" ("booking_id");



CREATE INDEX "messages_created_at_idx" ON "public"."messages" USING "btree" ("created_at");



CREATE INDEX "messages_sender_id_idx" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "profiles_is_suspended_idx" ON "public"."profiles" USING "btree" ("is_suspended");



CREATE INDEX "profiles_role_idx" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "review_replies_author_id_idx" ON "public"."review_replies" USING "btree" ("author_id");



CREATE INDEX "review_replies_review_id_idx" ON "public"."review_replies" USING "btree" ("review_id");



CREATE INDEX "reviews_author_id_idx" ON "public"."reviews" USING "btree" ("author_id");



CREATE UNIQUE INDEX "reviews_booking_author_subject_unique" ON "public"."reviews" USING "btree" ("booking_id", "author_id", "subject_id");



CREATE INDEX "reviews_booking_id_idx" ON "public"."reviews" USING "btree" ("booking_id");



CREATE INDEX "reviews_subject_id_idx" ON "public"."reviews" USING "btree" ("subject_id");



CREATE OR REPLACE VIEW "public"."cities_with_approved_guides" AS
 SELECT "c"."id",
    "c"."country_id",
    "c"."name",
    "c"."slug",
    "c"."is_active",
    "c"."created_at",
    "c"."updated_at",
    "c"."hero_image_url",
    "c"."hero_image_path",
    "c"."hero_image_backup_url",
    "c"."hero_image_source",
    "c"."hero_image_attribution",
    "c"."hero_image_attribution_url",
    "c"."hero_image_license",
    "c"."hero_image_updated_at",
    "co"."name" AS "country_name",
    "co"."iso_code" AS "country_iso_code",
    "co"."is_supported" AS "country_is_supported",
    "count"("g"."id") FILTER (WHERE ("g"."approved" = true)) AS "approved_guide_count"
   FROM (("public"."cities" "c"
     JOIN "public"."countries" "co" ON (("co"."id" = "c"."country_id")))
     LEFT JOIN "public"."guides" "g" ON (("g"."city_id" = "c"."id")))
  GROUP BY "c"."id", "co"."name", "co"."iso_code", "co"."is_supported";



CREATE OR REPLACE TRIGGER "guides_before_insert_auto_approve" BEFORE INSERT ON "public"."guides" FOR EACH ROW EXECUTE FUNCTION "public"."guides_auto_approve_and_slug"();



CREATE OR REPLACE TRIGGER "guides_before_update_auto_approve" BEFORE UPDATE ON "public"."guides" FOR EACH ROW EXECUTE FUNCTION "public"."guides_auto_approve_and_slug"();



CREATE OR REPLACE TRIGGER "trg_enforce_review_booking_participants" BEFORE INSERT OR UPDATE ON "public"."reviews" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_review_booking_participants"();



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "public"."guides"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."bookings"
    ADD CONSTRAINT "bookings_traveler_id_fkey" FOREIGN KEY ("traveler_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."cities"
    ADD CONSTRAINT "cities_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."guide_photos"
    ADD CONSTRAINT "guide_photos_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "public"."guides"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guide_unavailable_dates"
    ADD CONSTRAINT "guide_unavailable_dates_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "public"."guides"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guides"
    ADD CONSTRAINT "guides_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."guides"
    ADD CONSTRAINT "guides_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."guides"
    ADD CONSTRAINT "guides_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."review_replies"
    ADD CONSTRAINT "review_replies_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."review_replies"
    ADD CONSTRAINT "review_replies_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reviews"
    ADD CONSTRAINT "reviews_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;



CREATE POLICY "Authenticated users can create bookings" ON "public"."bookings" FOR INSERT WITH CHECK (("auth"."uid"() = "traveler_id"));



CREATE POLICY "Guides can read assigned bookings" ON "public"."bookings" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "guide_id"));



CREATE POLICY "Travelers can create bookings" ON "public"."bookings" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "traveler_id"));



CREATE POLICY "Travelers can read own bookings" ON "public"."bookings" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "traveler_id"));



ALTER TABLE "public"."bookings" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "bookings_guide_update_assigned" ON "public"."bookings" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "guide_id") AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'guide'::"public"."profile_role") AND ("p"."is_suspended" = false)))))) WITH CHECK ((("auth"."uid"() = "guide_id") AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'guide'::"public"."profile_role") AND ("p"."is_suspended" = false))))));



CREATE POLICY "bookings_participants_read" ON "public"."bookings" FOR SELECT TO "authenticated" USING (((EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."is_suspended" = false)))) AND (("auth"."uid"() = "traveler_id") OR ("auth"."uid"() = "guide_id"))));



CREATE POLICY "bookings_traveler_create" ON "public"."bookings" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "traveler_id") AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'traveler'::"public"."profile_role") AND ("p"."is_suspended" = false)))) AND (EXISTS ( SELECT 1
   FROM "public"."guides" "g"
  WHERE (("g"."id" = "bookings"."guide_id") AND ("g"."approved" = true))))));



CREATE POLICY "bookings_traveler_update_own" ON "public"."bookings" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "traveler_id") AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'traveler'::"public"."profile_role") AND ("p"."is_suspended" = false)))))) WITH CHECK ((("auth"."uid"() = "traveler_id") AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'traveler'::"public"."profile_role") AND ("p"."is_suspended" = false))))));



ALTER TABLE "public"."cities" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "cities_public_read" ON "public"."cities" FOR SELECT USING (("is_active" = true));



ALTER TABLE "public"."countries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "countries_public_read" ON "public"."countries" FOR SELECT USING (true);



ALTER TABLE "public"."guide_photos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "guide_photos_guide_manage_own" ON "public"."guide_photos" TO "authenticated" USING (("auth"."uid"() = "guide_id")) WITH CHECK (("auth"."uid"() = "guide_id"));



CREATE POLICY "guide_photos_public_read" ON "public"."guide_photos" FOR SELECT USING (true);



ALTER TABLE "public"."guide_unavailable_dates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."guides" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "guides_insert_own" ON "public"."guides" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "guides_select_all" ON "public"."guides" FOR SELECT USING (true);



CREATE POLICY "guides_update_own" ON "public"."guides" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "messages_participants_read" ON "public"."messages" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."bookings" "b"
  WHERE (("b"."id" = "messages"."booking_id") AND (("b"."traveler_id" = "auth"."uid"()) OR ("b"."guide_id" = "auth"."uid"()))))));



CREATE POLICY "messages_participants_send" ON "public"."messages" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "sender_id") AND (EXISTS ( SELECT 1
   FROM "public"."bookings" "b"
  WHERE (("b"."id" = "messages"."booking_id") AND (("b"."traveler_id" = "auth"."uid"()) OR ("b"."guide_id" = "auth"."uid"())) AND ("b"."status" = ANY (ARRAY['accepted'::"public"."booking_status", 'awaiting_payment'::"public"."booking_status", 'confirmed'::"public"."booking_status", 'completed'::"public"."booking_status"])))))));



ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert_own" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = "auth"."uid"()));



CREATE POLICY "profiles_select_all" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



ALTER TABLE "public"."review_replies" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "review_replies_author_update" ON "public"."review_replies" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "author_id")) WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "review_replies_participants_create" ON "public"."review_replies" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "author_id") AND (EXISTS ( SELECT 1
   FROM ("public"."reviews" "r"
     JOIN "public"."bookings" "b" ON (("b"."id" = "r"."booking_id")))
  WHERE (("r"."id" = "review_replies"."review_id") AND (("b"."traveler_id" = "auth"."uid"()) OR ("b"."guide_id" = "auth"."uid"())))))));



CREATE POLICY "review_replies_public_read" ON "public"."review_replies" FOR SELECT USING (true);



ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "reviews_author_update" ON "public"."reviews" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "author_id")) WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "reviews_participants_create" ON "public"."reviews" FOR INSERT TO "authenticated" WITH CHECK ((("auth"."uid"() = "author_id") AND (EXISTS ( SELECT 1
   FROM "public"."bookings" "b"
  WHERE (("b"."id" = "reviews"."booking_id") AND ("b"."status" = 'completed'::"public"."booking_status") AND ((("b"."traveler_id" = "reviews"."author_id") AND ("b"."guide_id" = "reviews"."subject_id")) OR (("b"."guide_id" = "reviews"."author_id") AND ("b"."traveler_id" = "reviews"."subject_id"))))))));



CREATE POLICY "reviews_public_read" ON "public"."reviews" FOR SELECT USING (true);



CREATE POLICY "unavailable_guide_manage_own" ON "public"."guide_unavailable_dates" TO "authenticated" USING ((("auth"."uid"() = "guide_id") AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'guide'::"public"."profile_role") AND ("p"."is_suspended" = false)))))) WITH CHECK ((("auth"."uid"() = "guide_id") AND (EXISTS ( SELECT 1
   FROM "public"."profiles" "p"
  WHERE (("p"."id" = "auth"."uid"()) AND ("p"."role" = 'guide'::"public"."profile_role") AND ("p"."is_suspended" = false))))));



CREATE POLICY "unavailable_public_read" ON "public"."guide_unavailable_dates" FOR SELECT USING (true);



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_review_booking_participants"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_review_booking_participants"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_review_booking_participants"() TO "service_role";



GRANT ALL ON FUNCTION "public"."guides_auto_approve_and_slug"() TO "anon";
GRANT ALL ON FUNCTION "public"."guides_auto_approve_and_slug"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."guides_auto_approve_and_slug"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON TABLE "public"."bookings" TO "anon";
GRANT ALL ON TABLE "public"."bookings" TO "authenticated";
GRANT ALL ON TABLE "public"."bookings" TO "service_role";



GRANT ALL ON TABLE "public"."cities" TO "anon";
GRANT ALL ON TABLE "public"."cities" TO "authenticated";
GRANT ALL ON TABLE "public"."cities" TO "service_role";



GRANT ALL ON TABLE "public"."cities_with_approved_guides" TO "anon";
GRANT ALL ON TABLE "public"."cities_with_approved_guides" TO "authenticated";
GRANT ALL ON TABLE "public"."cities_with_approved_guides" TO "service_role";



GRANT ALL ON TABLE "public"."countries" TO "anon";
GRANT ALL ON TABLE "public"."countries" TO "authenticated";
GRANT ALL ON TABLE "public"."countries" TO "service_role";



GRANT ALL ON TABLE "public"."guide_photos" TO "anon";
GRANT ALL ON TABLE "public"."guide_photos" TO "authenticated";
GRANT ALL ON TABLE "public"."guide_photos" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."reviews" TO "anon";
GRANT ALL ON TABLE "public"."reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."reviews" TO "service_role";



GRANT ALL ON TABLE "public"."guide_reviews" TO "anon";
GRANT ALL ON TABLE "public"."guide_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."guide_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."guide_unavailable_dates" TO "anon";
GRANT ALL ON TABLE "public"."guide_unavailable_dates" TO "authenticated";
GRANT ALL ON TABLE "public"."guide_unavailable_dates" TO "service_role";



GRANT ALL ON TABLE "public"."guides" TO "anon";
GRANT ALL ON TABLE "public"."guides" TO "authenticated";
GRANT ALL ON TABLE "public"."guides" TO "service_role";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT ALL ON TABLE "public"."review_replies" TO "anon";
GRANT ALL ON TABLE "public"."review_replies" TO "authenticated";
GRANT ALL ON TABLE "public"."review_replies" TO "service_role";



GRANT ALL ON TABLE "public"."traveler_reviews" TO "anon";
GRANT ALL ON TABLE "public"."traveler_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."traveler_reviews" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







