---
doc_id: 02-permissions
title: Permissions Map (AS-IS)
owners:
  - Engineering
status: Draft
as_is_snapshot_date: 2026-02-14
---

# Rainbow Tour Guides v2 Permissions Map (AS-IS)

This document maps current role permissions to UI routes, API/server actions, database tables, and Supabase RLS policy evidence as implemented in this repository. It is strictly AS-IS. Where repo sources conflict, this doc labels uncertainty as `UNKNOWN / NOT CONFIRMED IN CODE`.

Policy source tags used below:
- `[S]` = policy seen in `supabase-schema.sql` snapshot
- `[M]` = policy seen in `supabase/migrations/*.sql`

## 1) Roles & Assumptions

| Role | Identity / state source | Effective access shape (AS-IS) | Notes |
|---|---|---|---|
| Visitor (anon) | No Supabase session | Public marketing/content routes (`/`, `/cities*`, `/guides*`, etc.) | `middleware.ts` treats `/api` as public prefix, so API endpoints must self-enforce auth/role. |
| Traveler | `profiles.role = 'traveler'` | Traveler dashboard/profile/bookings/messages/settings routes | `requireRole('traveler')` used on most traveler pages; booking create API does **not** enforce traveler role directly. |
| Guide | `profiles.role = 'guide'` | Guide dashboard/profile/bookings/messages/availability/settings routes | Guide lifecycle states in code: `draft`, `pending`, `approved`, `rejected`. |
| Admin | `profiles.role = 'admin'` | `/admin/*` routes and admin APIs/actions | Admin checks are both middleware-level and route/action-level in most admin handlers. |
| Guide state: draft/pending/approved/rejected | `guides.status` | Controls onboarding/review UX and listing visibility logic | Migration history conflicts on enum evolution; see Gaps. |

Assumptions used in this map:
- Server DB access normally uses anon key + session cookies (`lib/supabase-server.ts`), so RLS is expected to be authoritative.
- One exception uses service role: `lib/admin-user-email.ts` (`auth.admin.getUserById`) for email lookup.
- `/travelers/[id]` is not middleware-public; it requires auth by default (even though it is a “public profile” style page).

## 2) Permissions Matrix

| Action (verb-object) | Allowed role(s) (AS-IS) | UI route(s) | API / action function(s) | DB tables touched | RLS policy names that should enforce | Notes / state gating |
|---|---|---|---|---|---|---|
| View cities directory | Visitor, any authenticated | `/cities`, `/cities/[slug]` | `getCitiesWithMeta`, `getCity`, `getGuidesWithMeta` | `cities`, `countries`, `guides` | `cities_public_read` `[S]`; `countries_public_read` `[S]`; `Active cities are viewable by everyone` `[M]`; `Countries are viewable by everyone` `[M]`; guides read policy varies (`guides_select_all` `[S]` vs approved-only `[M]`) | App queries also filter guides by `status='approved'`. |
| View guide profile/listing | Visitor, any authenticated | `/guides`, `/guides/[slug]` | Server component queries in guide pages | `guides`, `profiles`, `cities`, `countries`, `reviews`, `profile_images` | `guides_select_all` `[S]` or `Approved guides are viewable by everyone` `[M]`; `profiles_select_all` `[S]` / `Profiles are viewable by everyone` `[M]`; `reviews_public_read` `[S]/[M]`; `profile_images_select_public` `[M]` | `/guides/[slug]` adds app-level visibility gate for non-approved guides (owner/admin only). |
| View traveler profile page | Authenticated users (not anon) | `/travelers/[id]` | Server component in traveler public page | `profiles`, `travelers`, `countries`, `profile_images` | `profiles_select_all` `[S]/[M]`; traveler table policy set is migration-only (`Users can view own traveler profile`, `Admins can view all travelers`) `[M]` | Middleware blocks anon. If traveler RLS is own/admin only, non-owner viewer gets partial data. |
| Traveler updates own profile/settings | Traveler | `/traveler/profile`, `/traveler/settings` | `updateTravelerProfile`, `updateTravelerSettings` | `profiles`, `travelers` | `profiles_update_own` `[S]` / `Users can update own profile` `[M]`; traveler own update/insert policies `[M]` | Action code uses `requireRole('traveler')`. |
| Traveler onboarding creates traveler record | Traveler | `/traveler/onboarding` | Client inserts traveler row | `profiles`, `travelers` | Traveler insert policies `[M]`: `Users can insert own traveler profile`, `Users can insert their own traveler record` | No matching policy exists in `supabase-schema.sql` snapshot; migration-dependent. |
| Guide updates own listing/profile/settings | Guide | `/guide/profile`, `/guide/settings` | `updateGuideProfile`, `updateProfileAvatar`, `updateGuideSettings` | `profiles`, `guides`, `cities` | `guides_update_own` `[S]` / `Guides can update own profile` `[M]`; profile own update policies | Action code uses `requireRole('guide')`. |
| Guide onboarding create/update draft then submit pending | Guide | `/guide/onboarding` | Client upsert/update guide row and set status pending | `guides`, `profiles`, `cities` | `guides_insert_own`, `guides_update_own` `[S]`; `Guides can insert own profile`, `Guides can update own profile` `[M]` | Final submit sets `guides.status = 'pending'` for admin review. |
| Traveler creates booking request | Any authenticated user with verified email (route-level), intended traveler | `/guides/[slug]` booking card | `POST /api/bookings/create` | `bookings`, plus read from `profiles`, `cities` for email prep | `Authenticated users can create bookings` `[S]/[M]`; also conflicting stricter insert policies exist (`bookings_traveler_create` `[S]`, `Travelers can create bookings` `[M]`) | API checks auth + email verification; no traveler-role check in handler. |
| Guide reads assigned bookings | Guide | `/guide/bookings`, `/guide/bookings/[id]`, `/guide/dashboard` | Client/server selects bookings by `guide_id` | `bookings`, `profiles`, `cities` | `Guides can read assigned bookings` `[S]`; `bookings_participants_read` `[S]`; `Users can view bookings they're involved in` `[M]` | UI also filters by `guide_id` in queries. |
| Traveler reads own bookings | Traveler | `/traveler/bookings`, `/traveler/bookings/[id]`, `/traveler/dashboard` | Client/server selects bookings by `traveler_id` | `bookings`, `guides`, `profiles`, `cities` | `Travelers can read own bookings` `[S]`; `bookings_participants_read` `[S]`; `Users can view bookings they're involved in` `[M]` | UI also filters by `traveler_id`. |
| Guide approves booking request | Guide assigned to booking | `/guide/bookings`, `/guide/bookings/[id]` | `POST /api/bookings/[id]/approve` | `bookings`, `profiles` (names), Stripe session metadata | Booking update policies: `bookings_guide_update_assigned` `[S]` or `Guides can update bookings they're assigned to` `[M]` / `Participants can update bookings` `[M]` | Route enforces booking owner guide and `status='pending'`; sets `approved_pending_payment`. |
| Guide accepts/declines via legacy status endpoint | Guide assigned to booking | `/guide/bookings`, `/guide/bookings/[id]` | `PATCH /api/bookings/[id]/status` | `bookings` | Same booking update policies as above | Route allows only `accepted`/`declined` from `pending`. Current UI uses this for decline only; accept path uses `/approve`. |
| Traveler creates Stripe checkout session | Authenticated user who owns booking (intended traveler) | Booking payment flows | `POST /api/checkout/create-session` | `bookings`, `guides`, `profiles` | Read/update booking policies as above | Handler uses `requireUser()` and checks `booking.traveler_id === profile.id`. |
| Booking payment verification updates status | Intended traveler flow; endpoint callable without explicit auth | `/traveler/bookings/success`, optional `/api/checkout/verify-session` | `verifyCheckoutSession`, `GET /api/checkout/verify-session` | `bookings` (+ reads `profiles`, `cities`) | Booking update policies; exact active policy depends on source set | No Stripe webhook handler found; confirmation is page/endpoint-driven. |
| Participant cancels booking with refund logic | Traveler or Guide participant | `/traveler/dashboard`, `/guide/dashboard` (modal flow) | `POST /api/bookings/[id]/cancel` | `bookings` (+ Stripe refund metadata) | Booking participant update policies | Route enforces participant and future start time; sets `cancelled_by_traveler` or `cancelled_by_guide`. |
| Traveler cancels booking via direct client update path | Traveler owner | `/traveler/bookings` | Client-side `supabase.from('bookings').update({status:'cancelled_by_traveler'})` | `bookings` | Traveler own update policy | This bypasses `/cancel` API refund logic and its additional checks. |
| Participant reads booking contacts | Traveler or Guide participant | Booking detail pages | `GET /api/bookings/[id]/contacts` | `bookings`, `guides`, `travelers`; plus service-role email fetch | Booking participant read policies + traveler/guide read policies; email lookup bypasses RLS using service role helper | Contact visibility is status-gated in handler/helpers, not only by RLS. |
| Participant reads messages in a booking | Traveler/Guide participant | `/traveler/messages*`, `/guide/messages*` | `getMessages`, thread page queries, realtime subscriptions | `messages`, `bookings`, `profiles` | `messages_participants_read` `[S]`; `Users can view messages in their bookings` `[M]` | UI shows only bookings where `isMessagingEnabled(status)` is true. |
| Participant sends message in booking | Traveler/Guide participant | Message thread UI | `ChatWindow` insert into `messages` | `messages`, `bookings` | `messages_participants_send` `[S]` (status-gated) OR migration policies `Users can send messages in their bookings` / `Participants can insert messages` `[M]` (not status-gated) | Status gating certainty depends on active policy set. |
| Participant marks messages as read | Traveler/Guide participant | Message inbox/thread | `upsertBookingRead`, `getUnreadCounts`, hooks | `booking_reads`, `bookings`, `messages` | `Users can read booking_reads for their bookings`; `Users can insert/update/delete their own booking_reads` `[M]` | `booking_reads` policies exist in migration, not in `supabase-schema.sql` snapshot. |
| Guide manages availability blocks | Guide | `/guide/availability` | `saveAvailabilityPattern`, `blockUnavailableDate`, `unblockUnavailableDate` | `guides`, `guide_unavailable_dates` | `unavailable_guide_manage_own` `[S]`; plus guide own-update policies for `guides` | `guide_unavailable_dates` table/policies appear in snapshot, not migration chain. |
| Guide manages time-off ranges | Guide | `/guide/availability` | `createTimeOffAction`, `updateTimeOffAction`, `deleteTimeOffAction` | `guide_time_off` | `UNKNOWN / NOT CONFIRMED IN CODE` | Table is used in app code but not found in migrations/types snapshot. |
| User manages profile gallery images | Authenticated owner for write; public for read | `/guide/profile`, `/traveler/profile`, public profile pages | `ProfileGallery` CRUD | `profile_images` | `profile_images_select_public`, `profile_images_insert_own`, `profile_images_update_own`, `profile_images_delete_own` `[M]` | Policies are migration-defined; missing from `supabase-schema.sql` snapshot. |
| Authenticated user gets Cloudinary upload signature | Any authenticated | Upload-capable profile pages | `POST /api/cloudinary/sign` | None (auth session only) | N/A (not a table RLS operation) | Enforces preset whitelist + user-scoped folder patterns in API code. |
| Authenticated user deletes Cloudinary asset they own | Any authenticated owner of asset path | Profile image management UI | `POST /api/cloudinary/delete` | None (auth session only) | N/A | API enforces public_id path ownership pattern. |
| Admin moderates guide status | Admin | `/admin/guides`, `/admin/guides/[id]` | `approveGuide`, `rejectGuide`, `suspendGuide`, `unsuspendGuide`, `POST /api/admin/approve-all-guides` | `guides`, `profiles` | `Admins can manage all guides` `[M]` or `UNKNOWN / NOT CONFIRMED` under `[S]`-only set | Route/action code enforces admin role checks. |
| Admin overrides booking status | Admin | `/admin/bookings` | `adminOverrideBookingStatus` | `bookings` | `Admins can manage all bookings` `[M]` or `UNKNOWN / NOT CONFIRMED` under `[S]`-only set | Override allowed set excludes `approved_pending_payment`. |
| Admin search/export bookings/users | Admin | Admin search/export UI | `/api/admin/search`, `/api/admin/bookings/export-csv` | `profiles`, `bookings`, `guides`, `cities` | Admin read policies from migration sets; route handlers also enforce admin role explicitly | API handlers perform role checks before query execution. |
| Debug query logs endpoint | Any caller in development | N/A | `GET/DELETE /api/debug/queries` | In-memory logger only | N/A | No auth check; guarded only by `NODE_ENV !== 'development'`. |

## 3) Booking + Messaging State-Gated Permissions

### Booking statuses found in code

From `types/database.ts`:
- `draft`
- `pending`
- `approved_pending_payment`
- `accepted`
- `awaiting_payment`
- `confirmed`
- `declined`
- `cancelled_by_traveler`
- `cancelled_by_guide`
- `completed`

Status source conflict:
- `supabase-schema.sql` booking enum does **not** include `approved_pending_payment`.
- Migration `20260213103000_add_booking_status_approved_pending_payment.sql` adds it.
- Result: live DB enum state is `UNKNOWN / NOT CONFIRMED IN CODE` without runtime introspection.

### Booking transitions (implemented paths)

| From | To | Trigger path | Who can trigger | Enforcement points |
|---|---|---|---|---|
| (new) | `pending` | `POST /api/bookings/create` | Authenticated requester with verified email | API auth/email check + booking insert RLS |
| `pending` | `approved_pending_payment` | `POST /api/bookings/[id]/approve` | Assigned guide | API ownership+state check + booking update RLS |
| `pending` | `accepted` | `PATCH /api/bookings/[id]/status` | Assigned guide | API ownership+state check + booking update RLS |
| `pending` | `declined` | `PATCH /api/bookings/[id]/status` | Assigned guide | API ownership+state check + booking update RLS |
| active (not cancelled/declined/completed, future start) | `cancelled_by_traveler` or `cancelled_by_guide` | `POST /api/bookings/[id]/cancel` | Traveler/Guide participant | API participant+time checks + booking update RLS |
| owner-visible in `/traveler/bookings` | `cancelled_by_traveler` | Direct client DB update on page | Traveler owner | RLS only; API cancellation checks/refund logic bypassed |
| paid Stripe session | `confirmed` | `verifyCheckoutSession` (`/traveler/bookings/success` or `/api/checkout/verify-session`) | Intended traveler flow; endpoint itself has no explicit role check | Stripe verification + booking update RLS |
| any admin-selected status (limited list) | selected status | `adminOverrideBookingStatus` | Admin | `requireRole('admin')` + booking update RLS |

Not confirmed in code:
- Non-admin path to set `completed` was not found (except admin override path).
- Active use of `awaiting_payment` transition was not found.

### Messaging gate (explicit)

Code-level messaging gate helper (`lib/messaging-rules.ts`):
- Messaging enabled for: `accepted`, `awaiting_payment`, `confirmed`, `completed`.
- Messaging disabled for: `pending`, `approved_pending_payment`, `declined`, cancellations.

DB-level messaging gate:
- In `supabase-schema.sql` `[S]`, `messages_participants_send` requires booking status in (`accepted`, `awaiting_payment`, `confirmed`, `completed`).
- In migration policy sets `[M]`, message insert policies shown do not include explicit status predicates.

UI copy mismatch:
- Thread pages state “messaging unlocks once confirmed,” but helper allows `accepted` too.

## 4) RLS Mapping by Table

### 4.1 Policies seen in `supabase-schema.sql` (`[S]`)

| Table | Policies (names) | Short description |
|---|---|---|
| `bookings` | `Authenticated users can create bookings`; `Guides can read assigned bookings`; `Travelers can create bookings`; `Travelers can read own bookings`; `bookings_participants_read`; `bookings_traveler_create`; `bookings_traveler_update_own`; `bookings_guide_update_assigned` | Mixed legacy + stricter participant/role checks; overlapping policy set. |
| `messages` | `messages_participants_read`; `messages_participants_send` | Participant-only read/send; send includes status gate. |
| `profiles` | `profiles_insert_own`; `profiles_select_all`; `profiles_update_own` | Public read of profiles; owners can write own row. |
| `guides` | `guides_insert_own`; `guides_select_all`; `guides_update_own` | Public read of all guides under this snapshot. |
| `cities` | `cities_public_read` | Public read where active. |
| `countries` | `countries_public_read` | Public read. |
| `guide_unavailable_dates` | `unavailable_guide_manage_own`; `unavailable_public_read` | Guide-own writes, public read. |
| `guide_photos` | `guide_photos_guide_manage_own`; `guide_photos_public_read` | Owner writes, public read. |
| `reviews` | `reviews_public_read`; `reviews_participants_create`; `reviews_author_update` | Public reads; participant creation and author updates. |
| `review_replies` | `review_replies_public_read`; `review_replies_participants_create`; `review_replies_author_update` | Public reads; participant creation and author updates. |

### 4.2 Additional or alternative policies in migrations (`[M]`)

| Table | Policies (names) | Short description |
|---|---|---|
| `travelers` | `Users can view own traveler profile`; `Users can update own traveler profile`; `Users can insert own traveler profile`; `Travelers can view their own data`; `Travelers can update their own data`; `Admins can view all travelers`; `Users can insert their own traveler record` | Own-row traveler access + admin read in migration sets. |
| `bookings` | `Users can view bookings they're involved in`; `Travelers can create bookings`; `Guides can update bookings they're assigned to`; `Travelers can update their own bookings`; `Admins can manage all bookings`; `Participants can update bookings`; `Authenticated users can create bookings` | Multiple overlapping generations; role strictness differs by migration. |
| `messages` | `Users can view messages in their bookings`; `Users can send messages in their bookings`; `Participants can view messages`; `Participants can insert messages` | Participant-based, usually no explicit status gating in migration-defined predicates. |
| `profiles` | `Profiles are viewable by everyone`; `Users can update own profile`; `Users can insert own profile on signup`; plus trigger-era policy variants (`Users can select their own profile`, etc.) | Multiple policy generations coexist in history. |
| `guides` | `Approved guides are viewable by everyone`; `Guides can view their own profile regardless of status`; `Guides can update own profile`; `Guides can insert own profile`; `Admins can manage all guides`; `Guides are viewable by everyone` | Visibility semantics vary by migration generation. |
| `admin_events` | `Only admins can view admin events`; `Only admins can create admin events`; `Admins can view events`; `System/Admins can insert events` | Admin audit table policies vary by generation. |
| `booking_reads` | `Users can read booking_reads for their bookings`; `Users can insert their own booking_reads`; `Users can update their own booking_reads`; `Users can delete their own booking_reads` | Read receipts table participant-scoped. |
| `profile_images` | `profile_images_select_public`; `profile_images_insert_own`; `profile_images_update_own`; `profile_images_delete_own` | Public read, owner write. |
| `guide_verifications` | `Guides can insert their own verification`; `Guides can update their own pending verification`; `Guides can read their own verification`; `Admins can read all verifications`; `Admins can update verifications` | Verification workflow table; currently not used by app flows found. |
| `storage.objects` | `Users can upload/update/delete their own guide photo`; `Guide photos are publicly accessible`; `Users can upload/update/delete/read their own ID documents`; `Admins can read all ID documents`; `Users can upload/update/delete their own avatar`; `Avatars are publicly accessible`; `Admins can upload/update/delete blog images`; `Blog images are publicly accessible` | Storage bucket access controls for legacy Supabase storage flows. |

## 5) Gaps & Risks

### Security Gaps

1. Policy source drift is significant.
`supabase-schema.sql`, `supabase/schema.v2.sql`, and migration files describe materially different policy sets, so true enforcement in deployed DB is `UNKNOWN / NOT CONFIRMED IN CODE` without checking `pg_policies` live.

2. `guide_time_off` table is used by app code but not found in migrations/types.
App reads/writes `guide_time_off` in availability/time-off flows, but repo evidence for table creation, RLS, and indexes is missing.

3. Messaging gate may be UI-only under some migration policy sets.
Schema snapshot policy `[S]` gates sends by booking status, while migration policies `[M]` shown do not.

4. Traveler cancellation has two enforcement paths.
`/api/bookings/[id]/cancel` has refund/time/status controls, but `/traveler/bookings` performs direct `bookings.status` updates and bypasses that logic.

5. `/api/checkout/verify-session` has no explicit auth/role guard.
It relies on Stripe session validation + DB RLS behavior, and no Stripe webhook handler was found (confirmation is page/endpoint-driven).

6. Middleware marks all `/api/*` routes as public-prefix.
Correctness depends entirely on per-route checks; most endpoints enforce auth, but this remains a high-sensitivity design point.

7. Broad profile/guide readability in some policy sets.
`profiles_select_all` and `guides_select_all` in snapshot `[S]` are permissive; if active, privacy depends more on app filtering than DB restriction.

8. Booking/status model drift.
`approved_pending_payment` exists in code and migration but not in schema snapshot enum, and admin override allowed-status list excludes it.

9. Debug endpoint is unauthenticated in development.
`GET/DELETE /api/debug/queries` requires only `NODE_ENV=development`.

### Performance Risks in Policy Predicates

Current indexes are present for many RLS columns (`bookings.traveler_id`, `bookings.guide_id`, `bookings.status`, `messages.booking_id`, `profiles.role`, etc.), but these are recommended checks/gaps to validate:

- Add/verify index on `bookings(stripe_checkout_session_id)` for payment verification lookup path.
- Consider composite index `messages(booking_id, created_at)` for thread reads and realtime catch-up patterns.
- Consider composite indexes `bookings(guide_id, status)` and `bookings(traveler_id, status)` for frequent scoped status queries.
- If `guide_time_off` exists in DB, add/verify index on `(guide_id, starts_at)`.
- For storage policies relying on `storage.foldername(name)`, verify storage-side indexing strategy is sufficient for scale.

## 6) Minimal RLS Test Plan

Use four users: `traveler_a`, `traveler_b`, `guide_a`, `guide_b`, plus `admin_a`, plus anon client.
Create at least one booking `booking_1` between `traveler_a` and `guide_a`.

| Test | Actor | Operation | Expected result |
|---|---|---|---|
| T1 | anon | `SELECT` from `bookings` | Denied/empty by RLS. |
| T2 | `traveler_a` | Read `booking_1` | Allowed. |
| T3 | `traveler_b` | Read `booking_1` | Denied/empty. |
| T4 | `guide_a` | Read `booking_1` | Allowed. |
| T5 | `guide_b` | Read `booking_1` | Denied/empty. |
| T6 | `traveler_a` | Update `booking_1.status` to cancellation status | Allowed only for own booking and per active policy. |
| T7 | `traveler_b` | Update `booking_1.status` | Denied. |
| T8 | `traveler_a` | Insert message on `booking_1` when status is `pending` | Should fail if status-gated policy is active; pass indicates weak/missing DB gate. |
| T9 | `traveler_a` | Insert message on `booking_1` when status is `confirmed` | Allowed. |
| T10 | `traveler_b` | Insert/read messages for `booking_1` | Denied. |
| T11 | `guide_a` | Upsert `booking_reads` for `booking_1` | Allowed. |
| T12 | `guide_b` | Upsert `booking_reads` for `booking_1` | Denied. |
| T13 | `admin_a` | Update guide status and booking status via admin action path | Allowed if admin policies active. |
| T14 | non-admin | Call `/api/admin/search` | `403 Forbidden`. |
| T15 | anon | Call `/api/bookings/create` without session | `401 Unauthorized`. |

## Evidence Index

- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/middleware.ts` - public/protected route boundaries, role redirects, `/api` public prefix.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/auth-helpers.ts` - `requireUser`, `requireRole`, role redirect helpers.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/supabase-server.ts` - server client uses anon key (RLS expected).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts` - role/status enums and typed table inventory.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/create/route.ts` - booking creation auth/email checks.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts` - guide approve flow to `approved_pending_payment`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/status/route.ts` - pending -> accepted/declined route.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts` - participant cancellation + refund logic.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/contacts/route.ts` - participant check + contact visibility rules.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/booking-contact-visibility.ts` - contact status gate helper.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/messaging-rules.ts` - messaging status gate helper.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/messaging/MessageInbox.tsx` - booking filtering by messaging gate.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/messaging/chat-window.tsx` - direct message insert path.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/messages/[threadId]/page.tsx` - traveler thread ownership + gate.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/messages/[threadId]/page.tsx` - guide thread ownership + gate.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/chat-actions.ts` - `booking_reads` upsert/read operations.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/checkout/create-session/route.ts` - traveler booking ownership check + Stripe session creation.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts` - payment verification and booking confirmation update.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/checkout/verify-session/route.ts` - public endpoint wrapper for checkout verification.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/success/page.tsx` - traveler-gated payment success confirmation path.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/page.tsx` - direct client cancellation update path.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/booking/CancelBookingModal.tsx` - API-based cancellation path.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/availability/actions.ts` - `guide_unavailable_dates` writes.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/guide-availability.ts` - reads `guide_unavailable_dates` and `guide_time_off`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/guide-time-off.ts` - CRUD against `guide_time_off`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/profile/ProfileGallery.tsx` - `profile_images` CRUD path.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/cloudinary/sign/route.ts` - auth + folder/preset checks.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/cloudinary/delete/route.ts` - auth + asset ownership checks.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/admin-user-email.ts` - service-role email lookup bypass path.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/actions/admin-actions.ts` - admin guide moderation + booking override actions.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/admin/search/route.ts` - admin-only search endpoint.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/admin/bookings/export-csv/route.ts` - admin-only booking export.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/admin/approve-all-guides/route.ts` - admin-only bulk approve.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/debug/queries/route.ts` - dev-only, no auth debug endpoint.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase-schema.sql` - snapshot table/policy/index definitions (`[S]`).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/schema.v2.sql` - alternate schema document with TODO RLS notes.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20251210_enable_rls_policies.sql` - early broad RLS policy set.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260116000000_enable_rls_policies.sql` - alternate broad RLS policy generation.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260114002000_relax_booking_insert_policy.sql` - booking insert policy relaxation.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/create_booking_reads.sql` - `booking_reads` table + RLS.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260203000000_create_profile_images.sql` - `profile_images` table + RLS.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20251230150500_add_guide_onboarding_fields.sql` - `guide_verifications` table + RLS.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20251230150000_create_storage_buckets.sql` - storage bucket policies.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260114003000_add_avatars_blog_buckets.sql` - additional storage policies.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260213103000_add_booking_status_approved_pending_payment.sql` - enum extension for booking status.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260116200000_add_travelers_insert_policy.sql` - traveler insert policy.
