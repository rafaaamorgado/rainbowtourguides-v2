\# Rainbow Tour Guides v2 — Database Structure (Supabase / public schema)

\*\*Doc ID:\*\* DOC-DB-PUBLIC-SCHEMA    
\*\*Last updated:\*\* 2026-01-15    
\*\*Scope:\*\* Current \`public\` schema (tables, relationships, indexes, RLS policies, functions)    
\*\*Primary goal:\*\* Explain what exists today, how it supports RTG flows, and what’s missing vs the PRD.

\---

\#\# 1\) Executive summary

\#\#\# What you have (good foundation)  
\- A lean marketplace core:  
  \- \`profiles\` (users \+ roles)  
  \- \`guides\` (guide-specific profile extension)  
  \- \`cities\` / \`countries\`  
  \- \`bookings\` (single-session booking)  
  \- \`messages\` (chat per booking)  
  \- \`reviews\` \+ \`review\_replies\`  
  \- guide availability basics: \`guides.availability\_pattern\` \+ \`guide\_unavailable\_dates\` \+ \`guide\_photos\`  
\- RLS exists and mostly follows “participants-only” access patterns for bookings/messages/reviews.

\#\#\# Biggest issues to fix next  
1\) \*\*Privacy hole:\*\* \`profiles\_public\_read\` currently allows \*\*anyone\*\* (including anonymous visitors) to read all profiles.  
2\) \*\*Duplicate review tables:\*\* \`guide\_reviews\` and \`traveler\_reviews\` exist but appear \*\*unused/unconstrained\*\* (nullable PK, no FKs, no indexes, no RLS listed).  
3\) \*\*Booking model mismatch vs PRD:\*\* current schema lacks:  
   \- multi-day “reservation” grouping  
   \- full booking status set (PRD includes pending/declined/cancelled variants)  
   \- fee breakdown (traveler fee, platform commission, refund amounts, payout timing)  
4\) \*\*Admin/ops model not present in DB:\*\* no audit logs, no safety reports, no feature flags/settings tables yet.

\---

\#\# 2\) Entity relationship overview (ERD)

\`\`\`mermaid  
erDiagram  
  countries ||--o{ cities : has  
  cities ||--o{ guides : has  
  profiles ||--o| guides : "guide profile extension (shared id)"  
  cities ||--o{ bookings : has  
  guides ||--o{ bookings : receives  
  profiles ||--o{ bookings : creates\_as\_traveler

  bookings ||--o{ messages : has  
  profiles ||--o{ messages : sends

  bookings ||--o{ reviews : has  
  profiles ||--o{ reviews : author  
  profiles ||--o{ reviews : subject  
  reviews ||--o{ review\_replies : has  
  profiles ||--o{ review\_replies : author

  guides ||--o{ guide\_photos : has  
  guides ||--o{ guide\_unavailable\_dates : blocks

### **Tables \+ columns**

`select`  
  `table_name,`  
  `column_name,`  
  `data_type,`  
  `is_nullable,`  
  `column_default`  
`from information_schema.columns`  
`where table_schema = 'public'`  
`order by table_name, ordinal_position;`

| table\_name              | column\_name                | data\_type                | is\_nullable | column\_default                 |  
| \----------------------- | \-------------------------- | \------------------------ | \----------- | \------------------------------ |  
| bookings                | id                         | uuid                     | NO          | gen\_random\_uuid()              |  
| bookings                | traveler\_id                | uuid                     | NO          | null                           |  
| bookings                | guide\_id                   | uuid                     | NO          | null                           |  
| bookings                | city\_id                    | uuid                     | NO          | null                           |  
| bookings                | start\_at                   | timestamp with time zone | NO          | null                           |  
| bookings                | duration\_hours             | integer                  | NO          | null                           |  
| bookings                | party\_size                 | integer                  | YES         | null                           |  
| bookings                | traveler\_note              | text                     | YES         | null                           |  
| bookings                | status                     | USER-DEFINED             | NO          | 'draft'::booking\_status        |  
| bookings                | price\_total                | numeric                  | NO          | 0                              |  
| bookings                | currency                   | text                     | YES         | null                           |  
| bookings                | accepted\_at                | timestamp with time zone | YES         | null                           |  
| bookings                | confirmed\_at               | timestamp with time zone | YES         | null                           |  
| bookings                | cancelled\_at               | timestamp with time zone | YES         | null                           |  
| bookings                | completed\_at               | timestamp with time zone | YES         | null                           |  
| bookings                | stripe\_checkout\_session\_id | text                     | YES         | null                           |  
| bookings                | stripe\_payment\_intent\_id   | text                     | YES         | null                           |  
| bookings                | created\_at                 | timestamp with time zone | NO          | now()                          |  
| bookings                | updated\_at                 | timestamp with time zone | NO          | now()                          |  
| cities                  | id                         | uuid                     | NO          | gen\_random\_uuid()              |  
| cities                  | country\_id                 | uuid                     | NO          | null                           |  
| cities                  | name                       | text                     | NO          | null                           |  
| cities                  | slug                       | text                     | NO          | null                           |  
| cities                  | is\_active                  | boolean                  | NO          | true                           |  
| cities                  | created\_at                 | timestamp with time zone | NO          | now()                          |  
| cities                  | updated\_at                 | timestamp with time zone | NO          | now()                          |  
| countries               | id                         | uuid                     | NO          | gen\_random\_uuid()              |  
| countries               | name                       | text                     | NO          | null                           |  
| countries               | iso\_code                   | character                | NO          | null                           |  
| countries               | created\_at                 | timestamp with time zone | NO          | now()                          |  
| countries               | updated\_at                 | timestamp with time zone | NO          | now()                          |  
| guide\_photos            | id                         | uuid                     | NO          | gen\_random\_uuid()              |  
| guide\_photos            | guide\_id                   | uuid                     | NO          | null                           |  
| guide\_photos            | url                        | text                     | NO          | null                           |  
| guide\_photos            | sort\_order                 | integer                  | NO          | 0                              |  
| guide\_photos            | created\_at                 | timestamp with time zone | NO          | now()                          |  
| guide\_reviews           | id                         | uuid                     | YES         | null                           |  
| guide\_reviews           | booking\_id                 | uuid                     | YES         | null                           |  
| guide\_reviews           | author\_id                  | uuid                     | YES         | null                           |  
| guide\_reviews           | subject\_id                 | uuid                     | YES         | null                           |  
| guide\_reviews           | rating                     | integer                  | YES         | null                           |  
| guide\_reviews           | comment                    | text                     | YES         | null                           |  
| guide\_reviews           | created\_at                 | timestamp with time zone | YES         | null                           |  
| guide\_unavailable\_dates | id                         | uuid                     | NO          | gen\_random\_uuid()              |  
| guide\_unavailable\_dates | guide\_id                   | uuid                     | NO          | null                           |  
| guide\_unavailable\_dates | start\_date                 | date                     | NO          | null                           |  
| guide\_unavailable\_dates | end\_date                   | date                     | NO          | null                           |  
| guide\_unavailable\_dates | reason                     | text                     | YES         | null                           |  
| guide\_unavailable\_dates | created\_at                 | timestamp with time zone | NO          | now()                          |  
| guides                  | id                         | uuid                     | NO          | null                           |  
| guides                  | city\_id                    | uuid                     | NO          | null                           |  
| guides                  | headline                   | text                     | YES         | null                           |  
| guides                  | bio                        | text                     | YES         | null                           |  
| guides                  | experience\_tags            | ARRAY                    | YES         | null                           |  
| guides                  | price\_4h                   | numeric                  | YES         | null                           |  
| guides                  | price\_6h                   | numeric                  | YES         | null                           |  
| guides                  | price\_8h                   | numeric                  | YES         | null                           |  
| guides                  | currency                   | text                     | YES         | null                           |  
| guides                  | max\_group\_size             | integer                  | YES         | null                           |  
| guides                  | instant\_book\_enabled       | boolean                  | NO          | false                          |  
| guides                  | availability\_pattern       | jsonb                    | YES         | null                           |  
| guides                  | approved                   | boolean                  | NO          | false                          |  
| guides                  | verification\_status        | USER-DEFINED             | NO          | 'pending'::verification\_status |  
| guides                  | id\_document\_url            | text                     | YES         | null                           |  
| guides                  | reviewed\_by                | uuid                     | YES         | null                           |  
| guides                  | reviewed\_at                | timestamp with time zone | YES         | null                           |  
| guides                  | created\_at                 | timestamp with time zone | NO          | now()                          |  
| guides                  | updated\_at                 | timestamp with time zone | NO          | now()                          |  
| messages                | id                         | uuid                     | NO          | gen\_random\_uuid()              |  
| messages                | booking\_id                 | uuid                     | NO          | null                           |  
| messages                | sender\_id                  | uuid                     | NO          | null                           |  
| messages                | body                       | text                     | NO          | null                           |  
| messages                | created\_at                 | timestamp with time zone | NO          | now()                          |  
| profiles                | id                         | uuid                     | NO          | null                           |  
| profiles                | role                       | USER-DEFINED             | NO          | 'traveler'::profile\_role       |  
| profiles                | full\_name                  | text                     | NO          | null                           |  
| profiles                | pronouns                   | text                     | YES         | null                           |  
| profiles                | avatar\_url                 | text                     | YES         | null                           |  
| profiles                | country\_of\_origin          | text                     | YES         | null                           |  
| profiles                | languages                  | ARRAY                    | YES         | null                           |  
| profiles                | is\_suspended               | boolean                  | NO          | false                          |  
| profiles                | created\_at                 | timestamp with time zone | NO          | now()                          |  
| profiles                | updated\_at                 | timestamp with time zone | NO          | now()                          |  
| profiles                | photo\_url                  | text                     | YES         | null                           |  
| review\_replies          | id                         | uuid                     | NO          | gen\_random\_uuid()              |  
| review\_replies          | review\_id                  | uuid                     | NO          | null                           |  
| review\_replies          | author\_id                  | uuid                     | NO          | null                           |  
| review\_replies          | body                       | text                     | NO          | null                           |  
| review\_replies          | created\_at                 | timestamp with time zone | NO          | now()                          |  
| reviews                 | id                         | uuid                     | NO          | gen\_random\_uuid()              |  
| reviews                 | booking\_id                 | uuid                     | NO          | null                           |  
| reviews                 | author\_id                  | uuid                     | NO          | null                           |  
| reviews                 | subject\_id                 | uuid                     | NO          | null                           |  
| reviews                 | rating                     | integer                  | NO          | null                           |  
| reviews                 | comment                    | text                     | YES         | null                           |  
| reviews                 | created\_at                 | timestamp with time zone | NO          | now()                          |  
| traveler\_reviews        | id                         | uuid                     | YES         | null                           |  
| traveler\_reviews        | booking\_id                 | uuid                     | YES         | null                           |  
| traveler\_reviews        | author\_id                  | uuid                     | YES         | null                           |  
| traveler\_reviews        | subject\_id                 | uuid                     | YES         | null                           |  
| traveler\_reviews        | rating                     | integer                  | YES         | null                           |  
| traveler\_reviews        | comment                    | text                     | YES         | null                           |  
| traveler\_reviews        | created\_at                 | timestamp with time zone | YES         | null                           |

### **Foreign keys (relationships)**

`select`  
  `tc.table_name,`  
  `kcu.column_name,`  
  `ccu.table_name as foreign_table_name,`  
  `ccu.column_name as foreign_column_name`  
`from information_schema.table_constraints as tc`  
`join information_schema.key_column_usage as kcu`  
  `on tc.constraint_name = kcu.constraint_name`  
`join information_schema.constraint_column_usage as ccu`  
  `on ccu.constraint_name = tc.constraint_name`  
`where tc.constraint_type = 'FOREIGN KEY'`  
  `and tc.table_schema = 'public'`  
`order by tc.table_name;`

| table\_name              | column\_name | foreign\_table\_name | foreign\_column\_name |  
| \----------------------- | \----------- | \------------------ | \------------------- |  
| bookings                | city\_id     | cities             | id                  |  
| bookings                | guide\_id    | guides             | id                  |  
| bookings                | traveler\_id | profiles           | id                  |  
| cities                  | country\_id  | countries          | id                  |  
| guide\_photos            | guide\_id    | guides             | id                  |  
| guide\_unavailable\_dates | guide\_id    | guides             | id                  |  
| guides                  | city\_id     | cities             | id                  |  
| guides                  | id          | profiles           | id                  |  
| guides                  | reviewed\_by | profiles           | id                  |  
| messages                | booking\_id  | bookings           | id                  |  
| messages                | sender\_id   | profiles           | id                  |  
| review\_replies          | review\_id   | reviews            | id                  |  
| review\_replies          | author\_id   | profiles           | id                  |  
| reviews                 | subject\_id  | profiles           | id                  |  
| reviews                 | author\_id   | profiles           | id                  |  
| reviews                 | booking\_id  | bookings           | id                  |

### **Indexes**

`select`  
  `tablename,`  
  `indexname,`  
  `indexdef`  
`from pg_indexes`  
`where schemaname = 'public'`  
`order by tablename, indexname;`

| tablename               | indexname                             | indexdef                                                                                                                    |  
| \----------------------- | \------------------------------------- | \--------------------------------------------------------------------------------------------------------------------------- |  
| bookings                | bookings\_city\_id\_idx                  | CREATE INDEX bookings\_city\_id\_idx ON public.bookings USING btree (city\_id)                                                  |  
| bookings                | bookings\_guide\_id\_idx                 | CREATE INDEX bookings\_guide\_id\_idx ON public.bookings USING btree (guide\_id)                                                |  
| bookings                | bookings\_pkey                         | CREATE UNIQUE INDEX bookings\_pkey ON public.bookings USING btree (id)                                                       |  
| bookings                | bookings\_start\_at\_idx                 | CREATE INDEX bookings\_start\_at\_idx ON public.bookings USING btree (start\_at)                                                |  
| bookings                | bookings\_status\_idx                   | CREATE INDEX bookings\_status\_idx ON public.bookings USING btree (status)                                                    |  
| bookings                | bookings\_traveler\_id\_idx              | CREATE INDEX bookings\_traveler\_id\_idx ON public.bookings USING btree (traveler\_id)                                          |  
| cities                  | cities\_country\_id\_idx                 | CREATE INDEX cities\_country\_id\_idx ON public.cities USING btree (country\_id)                                                |  
| cities                  | cities\_is\_active\_idx                  | CREATE INDEX cities\_is\_active\_idx ON public.cities USING btree (is\_active)                                                  |  
| cities                  | cities\_pkey                           | CREATE UNIQUE INDEX cities\_pkey ON public.cities USING btree (id)                                                           |  
| cities                  | cities\_slug\_key                       | CREATE UNIQUE INDEX cities\_slug\_key ON public.cities USING btree (slug)                                                     |  
| countries               | countries\_iso\_code\_key                | CREATE UNIQUE INDEX countries\_iso\_code\_key ON public.countries USING btree (iso\_code)                                       |  
| countries               | countries\_pkey                        | CREATE UNIQUE INDEX countries\_pkey ON public.countries USING btree (id)                                                     |  
| guide\_photos            | guide\_photos\_guide\_id\_idx             | CREATE INDEX guide\_photos\_guide\_id\_idx ON public.guide\_photos USING btree (guide\_id)                                        |  
| guide\_photos            | guide\_photos\_guide\_sort\_unique        | CREATE UNIQUE INDEX guide\_photos\_guide\_sort\_unique ON public.guide\_photos USING btree (guide\_id, sort\_order)                |  
| guide\_photos            | guide\_photos\_pkey                     | CREATE UNIQUE INDEX guide\_photos\_pkey ON public.guide\_photos USING btree (id)                                               |  
| guide\_unavailable\_dates | guide\_unavailable\_dates\_guide\_id\_idx  | CREATE INDEX guide\_unavailable\_dates\_guide\_id\_idx ON public.guide\_unavailable\_dates USING btree (guide\_id)                  |  
| guide\_unavailable\_dates | guide\_unavailable\_dates\_pkey          | CREATE UNIQUE INDEX guide\_unavailable\_dates\_pkey ON public.guide\_unavailable\_dates USING btree (id)                         |  
| guide\_unavailable\_dates | guide\_unavailable\_dates\_range\_idx     | CREATE INDEX guide\_unavailable\_dates\_range\_idx ON public.guide\_unavailable\_dates USING btree (start\_date, end\_date)         |  
| guides                  | guides\_approved\_idx                   | CREATE INDEX guides\_approved\_idx ON public.guides USING btree (approved)                                                    |  
| guides                  | guides\_city\_id\_idx                    | CREATE INDEX guides\_city\_id\_idx ON public.guides USING btree (city\_id)                                                      |  
| guides                  | guides\_pkey                           | CREATE UNIQUE INDEX guides\_pkey ON public.guides USING btree (id)                                                           |  
| guides                  | guides\_verification\_status\_idx        | CREATE INDEX guides\_verification\_status\_idx ON public.guides USING btree (verification\_status)                              |  
| messages                | messages\_booking\_id\_idx               | CREATE INDEX messages\_booking\_id\_idx ON public.messages USING btree (booking\_id)                                            |  
| messages                | messages\_created\_at\_idx               | CREATE INDEX messages\_created\_at\_idx ON public.messages USING btree (created\_at)                                            |  
| messages                | messages\_pkey                         | CREATE UNIQUE INDEX messages\_pkey ON public.messages USING btree (id)                                                       |  
| messages                | messages\_sender\_id\_idx                | CREATE INDEX messages\_sender\_id\_idx ON public.messages USING btree (sender\_id)                                              |  
| profiles                | profiles\_is\_suspended\_idx             | CREATE INDEX profiles\_is\_suspended\_idx ON public.profiles USING btree (is\_suspended)                                        |  
| profiles                | profiles\_pkey                         | CREATE UNIQUE INDEX profiles\_pkey ON public.profiles USING btree (id)                                                       |  
| profiles                | profiles\_role\_idx                     | CREATE INDEX profiles\_role\_idx ON public.profiles USING btree (role)                                                        |  
| review\_replies          | review\_replies\_author\_id\_idx          | CREATE INDEX review\_replies\_author\_id\_idx ON public.review\_replies USING btree (author\_id)                                  |  
| review\_replies          | review\_replies\_pkey                   | CREATE UNIQUE INDEX review\_replies\_pkey ON public.review\_replies USING btree (id)                                           |  
| review\_replies          | review\_replies\_review\_id\_idx          | CREATE INDEX review\_replies\_review\_id\_idx ON public.review\_replies USING btree (review\_id)                                  |  
| reviews                 | reviews\_author\_id\_idx                 | CREATE INDEX reviews\_author\_id\_idx ON public.reviews USING btree (author\_id)                                                |  
| reviews                 | reviews\_booking\_author\_subject\_unique | CREATE UNIQUE INDEX reviews\_booking\_author\_subject\_unique ON public.reviews USING btree (booking\_id, author\_id, subject\_id) |  
| reviews                 | reviews\_booking\_id\_idx                | CREATE INDEX reviews\_booking\_id\_idx ON public.reviews USING btree (booking\_id)                                              |  
| reviews                 | reviews\_pkey                          | CREATE UNIQUE INDEX reviews\_pkey ON public.reviews USING btree (id)                                                         |  
| reviews                 | reviews\_subject\_id\_idx                | CREATE INDEX reviews\_subject\_id\_idx ON public.reviews USING btree (subject\_id)                                              |

### **RLS policies**

`select`  
  `schemaname,`  
  `tablename,`  
  `policyname,`  
  `permissive,`  
  `roles,`  
  `cmd,`  
  `qual,`  
  `with_check`  
`from pg_policies`  
`where schemaname = 'public'`  
`order by tablename, policyname;`

| schemaname | tablename               | policyname                              | permissive | roles           | cmd    | qual                                                                                                                                                                        | with\_check                                                                                                                                                                                                                                                                                                                           |  
| \---------- | \----------------------- | \--------------------------------------- | \---------- | \--------------- | \------ | \--------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | \------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |  
| public     | bookings                | Authenticated users can create bookings | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                                        | (auth.uid() \= traveler\_id)                                                                                                                                                                                                                                                                                                           |  
| public     | bookings                | bookings\_guide\_update\_assigned          | PERMISSIVE | {authenticated} | UPDATE | ((auth.uid() \= guide\_id) AND (EXISTS ( SELECT 1  
   FROM profiles p  
  WHERE ((p.id \= auth.uid()) AND (p.role \= 'guide'::profile\_role) AND (p.is\_suspended \= false)))))       | ((auth.uid() \= guide\_id) AND (EXISTS ( SELECT 1  
   FROM profiles p  
  WHERE ((p.id \= auth.uid()) AND (p.role \= 'guide'::profile\_role) AND (p.is\_suspended \= false)))))                                                                                                                                                                |  
| public     | bookings                | bookings\_participants\_read              | PERMISSIVE | {authenticated} | SELECT | ((EXISTS ( SELECT 1  
   FROM profiles p  
  WHERE ((p.id \= auth.uid()) AND (p.is\_suspended \= false)))) AND ((auth.uid() \= traveler\_id) OR (auth.uid() \= guide\_id)))            | null                                                                                                                                                                                                                                                                                                                                 |  
| public     | bookings                | bookings\_traveler\_create                | PERMISSIVE | {authenticated} | INSERT | null                                                                                                                                                                        | ((auth.uid() \= traveler\_id) AND (EXISTS ( SELECT 1  
   FROM profiles p  
  WHERE ((p.id \= auth.uid()) AND (p.role \= 'traveler'::profile\_role) AND (p.is\_suspended \= false)))) AND (EXISTS ( SELECT 1  
   FROM guides g  
  WHERE ((g.id \= bookings.guide\_id) AND (g.approved \= true)))))                                                   |  
| public     | bookings                | bookings\_traveler\_update\_own            | PERMISSIVE | {authenticated} | UPDATE | ((auth.uid() \= traveler\_id) AND (EXISTS ( SELECT 1  
   FROM profiles p  
  WHERE ((p.id \= auth.uid()) AND (p.role \= 'traveler'::profile\_role) AND (p.is\_suspended \= false))))) | ((auth.uid() \= traveler\_id) AND (EXISTS ( SELECT 1  
   FROM profiles p  
  WHERE ((p.id \= auth.uid()) AND (p.role \= 'traveler'::profile\_role) AND (p.is\_suspended \= false)))))                                                                                                                                                          |  
| public     | cities                  | cities\_public\_read                      | PERMISSIVE | {public}        | SELECT | (is\_active \= true)                                                                                                                                                          | null                                                                                                                                                                                                                                                                                                                                 |  
| public     | countries               | countries\_public\_read                   | PERMISSIVE | {public}        | SELECT | true                                                                                                                                                                        | null                                                                                                                                                                                                                                                                                                                                 |  
| public     | guide\_photos            | guide\_photos\_guide\_manage\_own           | PERMISSIVE | {authenticated} | ALL    | (auth.uid() \= guide\_id)                                                                                                                                                     | (auth.uid() \= guide\_id)                                                                                                                                                                                                                                                                                                              |  
| public     | guide\_photos            | guide\_photos\_public\_read                | PERMISSIVE | {public}        | SELECT | true                                                                                                                                                                        | null                                                                                                                                                                                                                                                                                                                                 |  
| public     | guide\_unavailable\_dates | unavailable\_guide\_manage\_own            | PERMISSIVE | {authenticated} | ALL    | ((auth.uid() \= guide\_id) AND (EXISTS ( SELECT 1  
   FROM profiles p  
  WHERE ((p.id \= auth.uid()) AND (p.role \= 'guide'::profile\_role) AND (p.is\_suspended \= false)))))       | ((auth.uid() \= guide\_id) AND (EXISTS ( SELECT 1  
   FROM profiles p  
  WHERE ((p.id \= auth.uid()) AND (p.role \= 'guide'::profile\_role) AND (p.is\_suspended \= false)))))                                                                                                                                                                |  
| public     | guide\_unavailable\_dates | unavailable\_public\_read                 | PERMISSIVE | {public}        | SELECT | true                                                                                                                                                                        | null                                                                                                                                                                                                                                                                                                                                 |  
| public     | guides                  | guides\_public\_read\_approved             | PERMISSIVE | {public}        | SELECT | (approved \= true)                                                                                                                                                           | null                                                                                                                                                                                                                                                                                                                                 |  
| public     | guides                  | guides\_self\_insert                      | PERMISSIVE | {authenticated} | INSERT | null                                                                                                                                                                        | ((auth.uid() \= id) AND (EXISTS ( SELECT 1  
   FROM profiles p  
  WHERE ((p.id \= auth.uid()) AND (p.role \= 'guide'::profile\_role) AND (p.is\_suspended \= false)))))                                                                                                                                                                      |  
| public     | guides                  | guides\_self\_read                        | PERMISSIVE | {authenticated} | SELECT | (auth.uid() \= id)                                                                                                                                                           | null                                                                                                                                                                                                                                                                                                                                 |  
| public     | guides                  | guides\_self\_update                      | PERMISSIVE | {authenticated} | UPDATE | ((auth.uid() \= id) AND (EXISTS ( SELECT 1  
   FROM profiles p  
  WHERE ((p.id \= auth.uid()) AND (p.role \= 'guide'::profile\_role) AND (p.is\_suspended \= false)))))             | ((auth.uid() \= id) AND (EXISTS ( SELECT 1  
   FROM profiles p  
  WHERE ((p.id \= auth.uid()) AND (p.role \= 'guide'::profile\_role) AND (p.is\_suspended \= false)))))                                                                                                                                                                      |  
| public     | messages                | messages\_participants\_read              | PERMISSIVE | {authenticated} | SELECT | (EXISTS ( SELECT 1  
   FROM bookings b  
  WHERE ((b.id \= messages.booking\_id) AND ((b.traveler\_id \= auth.uid()) OR (b.guide\_id \= auth.uid())))))                              | null                                                                                                                                                                                                                                                                                                                                 |  
| public     | messages                | messages\_participants\_send              | PERMISSIVE | {authenticated} | INSERT | null                                                                                                                                                                        | ((auth.uid() \= sender\_id) AND (EXISTS ( SELECT 1  
   FROM bookings b  
  WHERE ((b.id \= messages.booking\_id) AND ((b.traveler\_id \= auth.uid()) OR (b.guide\_id \= auth.uid())) AND (b.status \= ANY (ARRAY\['accepted'::booking\_status, 'awaiting\_payment'::booking\_status, 'confirmed'::booking\_status, 'completed'::booking\_status\])))))) |  
| public     | profiles                | Admins can read all profiles            | PERMISSIVE | {public}        | SELECT | (EXISTS ( SELECT 1  
   FROM profiles p  
  WHERE ((p.id \= auth.uid()) AND (p.role \= 'admin'::profile\_role))))                                                                  | null                                                                                                                                                                                                                                                                                                                                 |  
| public     | profiles                | Users can insert their own profile      | PERMISSIVE | {public}        | INSERT | null                                                                                                                                                                        | (auth.uid() \= id)                                                                                                                                                                                                                                                                                                                    |  
| public     | profiles                | Users can select own profile            | PERMISSIVE | {public}        | SELECT | (auth.uid() \= id)                                                                                                                                                           | null                                                                                                                                                                                                                                                                                                                                 |  
| public     | profiles                | Users can select their own profile      | PERMISSIVE | {public}        | SELECT | (auth.uid() \= id)                                                                                                                                                           | null                                                                                                                                                                                                                                                                                                                                 |  
| public     | profiles                | Users can update own profile fields     | PERMISSIVE | {public}        | UPDATE | (auth.uid() \= id)                                                                                                                                                           | (auth.uid() \= id)                                                                                                                                                                                                                                                                                                                    |  
| public     | profiles                | Users can update their own profile      | PERMISSIVE | {public}        | UPDATE | (auth.uid() \= id)                                                                                                                                                           | null                                                                                                                                                                                                                                                                                                                                 |  
| public     | profiles                | profiles\_public\_read                    | PERMISSIVE | {public}        | SELECT | true                                                                                                                                                                        | null                                                                                                                                                                                                                                                                                                                                 |  
| public     | profiles                | profiles\_self\_insert                    | PERMISSIVE | {authenticated} | INSERT | null                                                                                                                                                                        | (auth.uid() \= id)                                                                                                                                                                                                                                                                                                                    |  
| public     | profiles                | profiles\_self\_update                    | PERMISSIVE | {authenticated} | UPDATE | (auth.uid() \= id)                                                                                                                                                           | (auth.uid() \= id)                                                                                                                                                                                                                                                                                                                    |  
| public     | review\_replies          | review\_replies\_author\_update            | PERMISSIVE | {authenticated} | UPDATE | (auth.uid() \= author\_id)                                                                                                                                                    | (auth.uid() \= author\_id)                                                                                                                                                                                                                                                                                                             |  
| public     | review\_replies          | review\_replies\_participants\_create      | PERMISSIVE | {authenticated} | INSERT | null                                                                                                                                                                        | ((auth.uid() \= author\_id) AND (EXISTS ( SELECT 1  
   FROM (reviews r  
     JOIN bookings b ON ((b.id \= r.booking\_id)))  
  WHERE ((r.id \= review\_replies.review\_id) AND ((b.traveler\_id \= auth.uid()) OR (b.guide\_id \= auth.uid()))))))                                                                                                  |  
| public     | review\_replies          | review\_replies\_public\_read              | PERMISSIVE | {public}        | SELECT | true                                                                                                                                                                        | null                                                                                                                                                                                                                                                                                                                                 |  
| public     | reviews                 | reviews\_author\_update                   | PERMISSIVE | {authenticated} | UPDATE | (auth.uid() \= author\_id)                                                                                                                                                    | (auth.uid() \= author\_id)                                                                                                                                                                                                                                                                                                             |  
| public     | reviews                 | reviews\_participants\_create             | PERMISSIVE | {authenticated} | INSERT | null                                                                                                                                                                        | ((auth.uid() \= author\_id) AND (EXISTS ( SELECT 1  
   FROM bookings b  
  WHERE ((b.id \= reviews.booking\_id) AND (b.status \= 'completed'::booking\_status) AND (((b.traveler\_id \= reviews.author\_id) AND (b.guide\_id \= reviews.subject\_id)) OR ((b.guide\_id \= reviews.author\_id) AND (b.traveler\_id \= reviews.subject\_id)))))))           |  
| public     | reviews                 | reviews\_public\_read                     | PERMISSIVE | {public}        | SELECT | true                                                                                                                                                                        | null                                                                                                                                                                                                                                                                                                                                 |

### **Functions**

`select`  
  `n.nspname as schema,`  
  `p.proname as function_name,`  
  `pg_get_functiondef(p.oid) as definition`  
`from pg_proc p`  
`join pg_namespace n on n.oid = p.pronamespace`  
`where n.nspname = 'public'`  
`order by function_name;`

| schema | function\_name                       | definition                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |  
| \------ | \----------------------------------- | \--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |  
| public | enforce\_review\_booking\_participants | CREATE OR REPLACE FUNCTION public.enforce\_review\_booking\_participants()  
 RETURNS trigger  
 LANGUAGE plpgsql  
AS $function$  
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
$function$  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |  
| public | handle\_new\_user                     | CREATE OR REPLACE FUNCTION public.handle\_new\_user()  
 RETURNS trigger  
 LANGUAGE plpgsql  
 SECURITY DEFINER  
 SET search\_path TO 'public'  
AS $function$  
DECLARE  
  role\_text text;  
  role\_enum public.profile\_role;  
  \_full\_name text;  
  \_avatar\_url text;  
BEGIN  
  \-- Determine role  
  role\_text := COALESCE(NEW.raw\_user\_meta\_data-\>\>'role', 'traveler');  
    
  \-- Validation for enum  
  IF role\_text NOT IN ('traveler', 'guide', 'admin') THEN  
    role\_text := 'traveler';  
  END IF;  
    
  role\_enum := role\_text::public.profile\_role;

  \-- Determine full name  
  \_full\_name := COALESCE(  
    NEW.raw\_user\_meta\_data-\>\>'full\_name',  
    NEW.raw\_user\_meta\_data-\>\>'name',  
    split\_part(NEW.email, '@', 1\)  
  );

  \-- Determine avatar/photo url  
  \_avatar\_url := COALESCE(  
    NEW.raw\_user\_meta\_data-\>\>'avatar\_url',  
    NEW.raw\_user\_meta\_data-\>\>'picture',  
    NEW.raw\_user\_meta\_data-\>\>'photo\_url',  
    NULL  
  );

  \-- Insert/Update profile  
  INSERT INTO public.profiles (id, role, full\_name, avatar\_url)  
  VALUES (  
    NEW.id,  
    role\_enum,  
    \_full\_name,  
    \_avatar\_url  
  )  
  ON CONFLICT (id) DO UPDATE  
  SET  
    role \= CASE   
             WHEN public.profiles.role IS NULL OR public.profiles.role \= 'traveler'::profile\_role   
             THEN EXCLUDED.role   
             ELSE public.profiles.role   
           END,   
    full\_name \= COALESCE(public.profiles.full\_name, EXCLUDED.full\_name),  
    avatar\_url \= COALESCE(public.profiles.avatar\_url, EXCLUDED.avatar\_url),  
    updated\_at \= now();

  RETURN NEW;  
END;  
$function$  
 |

