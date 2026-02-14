---
doc_id: 01-product
owner: Product + Engineering (TBD)
reviewers:
  - Cofounders (TBD)
status: Draft (AS-IS)
last_updated: 2026-02-14
as_is_snapshot_date: 2026-02-14
---

# Rainbow Tour Guides v2 (AS-IS)

## 1) Product definition + what v2 proves
Rainbow Tour Guides v2 is a role-based marketplace where travelers can request private tours from local guides, guides can accept or decline requests, and admins can moderate supply and override bookings. The current codebase proves public browsing of cities/guides, authenticated traveler and guide dashboards, request-first booking creation, guide approval/decline actions, Stripe checkout-based payment confirmation, and booking-scoped chat that is status-gated.

## 2) Personas (AS-IS)

| Persona | Primary goal | Top actions in current build | What they cannot do (AS-IS) |
|---|---|---|---|
| Visitor (not signed in) | Discover guides/cities | Browse `/cities`, `/cities/[slug]`, `/guides`, `/guides/[slug]`, read legal/FAQ/how-it-works pages | Cannot access `/traveler/*`, `/guide/*`, `/admin/*`; cannot create bookings or send messages |
| Traveler | Request, manage, and pay for tours | Create booking request from guide page, view bookings, cancel bookings, view booking detail, open messages for eligible bookings, complete traveler profile/settings | No confirmed in-app review submission flow (reviews pages are placeholder; review route linked from bookings is missing). Payment initiation from traveler UI is not clearly surfaced in booking pages; acceptance flow currently emails payment link |
| Guide | Receive requests and run tours | Complete onboarding, set 4/6/8h prices, manage profile/availability/settings, accept/decline booking requests, view booking details, message traveler when eligible | No implemented payouts engine (payout page is placeholder); no explicit "mark completed" UI found in guide flow |
| Admin | Moderate guides/bookings/users | Review guide applications (approve/reject), suspend/unsuspend guides, view bookings, export booking CSV, override booking status, search users/bookings | Reviews moderation and blog management pages are placeholder UI; user action menu in users table is mostly toast-only |

## 3) AS-IS feature inventory by persona

### Visitor
- Public pages are accessible without auth via middleware public prefixes.
- Public guide discovery is filtered to approved guides in data service.
- Non-approved guide profile pages are blocked unless viewer is that guide or an admin.

### Traveler
- Can create requests through `POST /api/bookings/create` (requires auth and verified email).
- Can view bookings in `/traveler/bookings` and `/traveler/bookings/[id]`.
- Cancel path A: `POST /api/bookings/[id]/cancel` (refund-aware path used by dashboard/modal flows).
- Cancel path B: direct DB status update to `cancelled_by_traveler` in `/traveler/bookings` page (bypasses refund logic).
- Can access chat inbox `/traveler/messages` and thread `/traveler/messages/[threadId]` only when `isMessagingEnabled(status)` is true.
- Reviews surfaces are present but non-functional for submission in current UI.

### Guide
- Onboarding persists draft guide data and submits guide status to `pending` for admin review.
- Approved guides appear on public listing/profile surfaces.
- Guide bookings path accepts requests via `POST /api/bookings/[id]/approve`.
- Guide bookings path declines requests via `PATCH /api/bookings/[id]/status` with `declined`.
- Guide can view traveler contact data via `/api/bookings/[id]/contacts` with status-based masking.
- Messaging available on eligible booking statuses.
- Payouts page exists but is empty-state only.

### Admin
- `/admin/guides` + `/admin/guides/[id]` support approve/reject/suspend/unsuspend flows.
- `/admin/bookings` supports status override and CSV export via `/api/admin/bookings/export-csv`.
- `/api/admin/search` supports admin search for profiles and bookings.
- `/admin/reviews` and `/admin/content/blog` are currently placeholder pages.

## 4) Core journeys (AS-IS routes)

### Journey A: Browse → request → accept → pay → confirm → message
1. Browse cities: `/cities`.
2. Browse city guides: `/cities/[slug]`.
3. Open guide profile and booking form: `/guides/[slug]` (uses active booking card component).
4. Submit booking request: `POST /api/bookings/create`.
5. Booking created with status `pending`; traveler sees `/traveler/bookings/[id]?success=request_sent`.
6. Guide views request: `/guide/bookings` or `/guide/bookings/[id]`.
7. Guide accepts: `POST /api/bookings/[id]/approve`.
8. Booking becomes `approved_pending_payment`; Stripe Checkout session id is stored; traveler payment link is emailed.
9. Traveler completes payment on Stripe and lands on `/traveler/bookings/success?session_id=...&booking_id=...`.
10. Success page verifies checkout (`verifyCheckoutSession`) and sets booking `confirmed`.
11. Messaging becomes available (code gate includes multiple statuses; see section 6).
12. Traveler and guide can message via `/traveler/messages` and `/guide/messages`.

### Journey B: Browse → request → decline
1. Steps 1-5 same as Journey A.
2. Guide declines via `/guide/bookings` or `/guide/bookings/[id]`.
3. API: `PATCH /api/bookings/[id]/status` with `declined`.
4. Traveler receives decline status update (and email send attempt).

### Journey C: Cancellation
1. Traveler or guide opens a cancellable booking before start time.
2. API path: `POST /api/bookings/[id]/cancel`.
3. Status updates to `cancelled_by_traveler` or `cancelled_by_guide`.
4. Refund logic applies (guide: 100%; traveler: 100% if >48h, else 50%).

### Journey D: Complete → review
- `completed` status exists in types/schema and is used in filtering/labels.
- UI flow to set booking `completed`: `UNKNOWN / NOT CONFIRMED IN CODE`.
- Review creation UI route from traveler bookings points to `/traveler/bookings/[id]/review`, but this page is missing.

## 5) Booking lifecycle (statuses, transitions, actors)

### Status set used in app types
`draft`, `pending`, `approved_pending_payment`, `accepted`, `awaiting_payment`, `confirmed`, `declined`, `cancelled_by_traveler`, `cancelled_by_guide`, `completed`.

### Observed transitions in code

| From | To | Triggered by | Where implemented | Notes |
|---|---|---|---|---|
| new | `pending` | Traveler | `POST /api/bookings/create` | Request-first creation |
| `pending` | `approved_pending_payment` | Guide | `POST /api/bookings/[id]/approve` | Sets `accepted_at`, creates Stripe session, emails traveler payment link |
| `pending` | `declined` | Guide | `PATCH /api/bookings/[id]/status` | Guide UI currently uses this only for decline |
| `pending` | `accepted` | Guide/API caller | `PATCH /api/bookings/[id]/status` | API allows it, current guide UI does not call it for accept |
| `approved_pending_payment` (or other unpaid states) | `confirmed` | Traveler payment verification | `verifyCheckoutSession` (used by success page and verify endpoint) | No Stripe webhook handler found |
| cancellable active states | `cancelled_by_traveler` | Traveler | `POST /api/bookings/[id]/cancel` or direct update in traveler bookings page | Direct page update path bypasses refund API |
| cancellable active states | `cancelled_by_guide` | Guide | `POST /api/bookings/[id]/cancel` | Includes refund handling |
| various | admin-selected status | Admin | `adminOverrideBookingStatus` | Override list currently omits `approved_pending_payment` |

### States present but transition not proven in user flow
- `awaiting_payment`: `UNKNOWN / NOT CONFIRMED IN CODE` setter path in current routes.
- `completed`: no explicit traveler/guide UI action found that sets this status.
- `draft` for bookings: exists in shared data-service helper, but main booking route creates `pending`.

## 6) Messaging rules (gating status)

### Code-backed gating
- `isMessagingEnabled(status)` returns true for `accepted`, `awaiting_payment`, `confirmed`, `completed`.
- Inbox filters conversations using `isMessagingEnabled`.
- Supabase RLS policy for message insert (`messages_participants_send`) allows same four statuses.

### Important mismatch
- Traveler and guide thread pages display copy saying messaging unlocks only when booking is confirmed, but gate function allows earlier states (`accepted`, `awaiting_payment`).
- Status-gating decision required (see section 11).

## 7) Pricing & fees (AS-IS vs planned)

### Implemented now
- Guide pricing inputs exist for 4h/6h/8h and are stored as `price_4h`, `price_6h`, `price_8h`.
- Active booking form on guide public page computes base price by duration, service fee `= 8%`, and total `= base + fee`.
- Booking create stores only `price_total` and `currency` snapshot on booking row.
- Approval/checkout uses stored `booking.price_total` as Stripe amount.

### Rules requested in prompt
- Traveler booking fee rule `10% min $15`: `UNKNOWN / NOT CONFIRMED IN CODE`.
- Guide commission rule `20%`: present in some content/spec surfaces (terms page, legacy onboarding step file copy).
- Guide commission rule `20%`: not enforced in booking price calculation path shown to traveler.
- Guide commission rule `20%`: no payout distribution logic found in current app code.

### Price lock / snapshot
- Price is effectively locked at request creation in `bookings.price_total` and reused for checkout amount.
- Separate fee/commission snapshot columns: `UNKNOWN / NOT CONFIRMED IN CODE`.

## 8) Notifications (email + in-app)

### Email triggers implemented

| Trigger | Implementation |
|---|---|
| Traveler creates booking request | `sendBookingRequestEmail` from `POST /api/bookings/create` |
| Guide accepts/declines via status endpoint | `sendBookingStatusEmail` from `PATCH /api/bookings/[id]/status` |
| Guide approves and requests payment | `sendBookingApprovalPaymentEmail` from `POST /api/bookings/[id]/approve` |
| Payment verified | `sendBookingPaidEmail` from `verifyCheckoutSession` |
| Guide application submitted | `notifyAdminNewGuide` → `sendNewGuideApplicationEmail` |
| Admin approves/rejects guide | `sendGuideApprovedEmail` / `sendGuideRejectedEmail` in admin actions |

### Email delivery caveat
- If `RESEND_API_KEY` is missing, email sends no-op (flow continues without hard failure).

### In-app notifications
- Realtime subscriptions update booking/message UIs.
- Dedicated notification center/table: `UNKNOWN / NOT CONFIRMED IN CODE`.

## 9) Safety & eligibility (current build)

### Exists now
- Role-based route protection via middleware + `requireRole`.
- Email verification gate for protected routes and booking creation.
- Guide onboarding submission sets status to `pending` for admin review.
- Admin moderation actions: approve/reject/suspend/unsuspend guide.
- Public guide discovery and city counts are filtered to approved guides.
- Safety/legal pages exist, including safety reporting email (`safety@rainbowtourguides.com`).
- Contact details are status-gated (masked until eligible statuses).

### Not confirmed in executable flow
- In-app incident report workflow: `UNKNOWN / NOT CONFIRMED IN CODE`.
- 24/7 support tooling: `UNKNOWN / NOT CONFIRMED IN CODE`.
- Background checks/video interviews automation: `UNKNOWN / NOT CONFIRMED IN CODE`.

## 10) Done means (current build acceptance checks)

1. Visitor can open `/cities` and `/guides` without authentication.
2. Unauthenticated access to `/traveler/bookings` redirects to sign-in.
3. Unauthenticated access to `/guide/bookings` redirects to sign-in.
4. Traveler with unverified email gets `403` on `POST /api/bookings/create`.
5. Successful booking request creates DB row with `status='pending'` and non-null `price_total`.
6. Guide can accept a pending request from guide bookings UI, creating Stripe checkout session id and setting `status='approved_pending_payment'`.
7. Guide can decline a pending request from guide bookings UI, setting `status='declined'`.
8. Traveler payment success page (`/traveler/bookings/success`) with valid `session_id` sets booking `status='confirmed'` and `confirmed_at`.
9. If `session_id` is missing on success page, traveler is redirected to `/traveler/bookings`.
10. Cancel API refuses cancellation for already cancelled/declined/completed bookings.
11. Cancel API computes traveler refund policy as 100% if >48h, else 50%; guide cancellations return 100%.
12. Messaging inbox lists only bookings where `isMessagingEnabled(status)` is true.
13. Message insert is blocked by DB policy when booking status is not one of accepted/awaiting_payment/confirmed/completed.
14. Public guide list excludes non-approved guides.
15. Admin bookings table can force status changes via booking status override control.
16. Admin can approve/reject guide applications from `/admin/guides/[id]`.
17. Admin can export bookings CSV from `/api/admin/bookings/export-csv`.
18. Traveler review action link from bookings points to a missing review route (expected current behavior: route not found).

## 11) Conflicts & decisions needed

| Conflict | Evidence | Option A: align docs to code | Option B: align code to docs | Recommended default |
|---|---|---|---|---|
| Accept path status split (`approved_pending_payment` vs `accepted`) | Guide accept UI calls `/approve`; legacy `/status` endpoint still supports `accepted` | Document primary accept status as `approved_pending_payment`; mark `accepted` as legacy/secondary | Consolidate to one canonical accepted state and remove unused branch | Option A now; Option B in next booking-state cleanup |
| Messaging gate says confirmed-only in copy, but helper/RLS allow earlier statuses | `isMessagingEnabled` + RLS allow `accepted`/`awaiting_payment`/`confirmed`/`completed`; thread copy says confirmed | Keep docs clear that code allows earlier chat | Restrict helper/RLS to confirmed+completed or update product copy | Option B (choose policy), then update docs |
| Fees are inconsistent across surfaces (8%, 10%, 5/15, 20) | Active booking card uses 8%; README/FAQ/Terms/onboarding copy differ | Document current executable fee path and flag all others as conflicting content | Implement one fee model in pricing service + shared constants + UI copy sweep | Option B (high business risk) |
| Cancellation path inconsistency | Traveler bookings page directly updates status; cancel API includes refund logic | Document both behaviors and current risk | Route all cancellations through cancel API only | Option B |
| Review flow incomplete | Reviews pages are placeholders; booking card links missing route | Document review as not complete | Build review route + submission flow + completion trigger | Option B |
| Schema drift across `types`, `supabase-schema.sql`, `schema.v2.sql`, migrations | Status enums and message columns differ across files | Document canonical runtime assumptions from app code | Reconcile schema artifacts and regenerate types from one source of truth | Option B |
| Message column mismatch (`body` vs `text`) | Chat/data layers use `body`; thread pages select `text` | Document as defect | Standardize on `body` in all queries/components | Option B |
| Admin override list omits `approved_pending_payment` | Admin action/status UI excludes this status | Document omission | Add status to admin override options and validation list | Option B |
| `is_public` preference vs public profile exposure | Settings writes `profiles.is_public`; traveler public page and guide public visibility do not enforce it | Document that `is_public` is not consistently enforced | Enforce `is_public` checks in public profile routes/listing queries | Option B |
| `supabase-schema.sql` includes auto-approve triggers conflicting with pending-review onboarding flow | Trigger function sets approved true and verification approved | Treat file as stale snapshot and rely on deployed migrations/app behavior | Remove/replace trigger definitions and align schema docs | Option B |

## 12) Appendix: Evidence index

### Product and role model
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts` (`ProfileRole`, `BookingStatus`, table row types).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/middleware.ts` (public prefixes, role route gates, email verification gate).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/auth-helpers.ts` (`requireRole`, role redirects).

### Public browsing and visibility
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/cities/page.tsx`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/cities/[slug]/page.tsx`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guides/page.tsx`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guides/[slug]/page.tsx` (non-approved visibility gate).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/data-service.ts` (`getCitiesWithMeta`, `getGuidesWithMeta` approved filtering).

### Booking APIs and lifecycle
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/create/route.ts`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/status/route.ts`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/booking-status.ts`.

### Booking UI flows
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/guide/booking-card.tsx` (active request form + 8% fee calc).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/page.tsx` (tabs, cancel behavior, review link).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/[id]/page.tsx`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/bookings/page.tsx`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/bookings/[id]/page.tsx`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/booking/CancelBookingModal.tsx`.

### Messaging gating and chat
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/messaging-rules.ts` (`isMessagingEnabled`).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/messaging/MessageInbox.tsx` (filters bookings by gate).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/messages/[threadId]/page.tsx`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/messages/[threadId]/page.tsx`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/chat-api.ts`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase-schema.sql` (`messages_participants_send` policy).

### Pricing and fees references
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/onboarding/page.tsx` (stores 4h/6h/8h rates).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/guide/booking-card.tsx` (8% service fee in active flow).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/checkout/create-session/route.ts` (legacy TODO amount logic).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/legal/terms/page.tsx` (20% commission copy).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/faq/page.tsx` (5% traveler + 15% guide copy).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guides/[slug]/README.md` (10% service fee in legacy doc).

### Notifications
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/email.ts` (all email senders + Resend guard).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/actions/notify-admin-new-guide.ts`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/create/route.ts`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/status/route.ts`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`.

### Safety, moderation, and admin
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/onboarding/page.tsx` (submit to pending review).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/actions/admin-actions.ts` (approve/reject/suspend/unsuspend + booking override).
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/admin/guides/page.tsx`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/admin/guides/[id]/page.tsx`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/admin/AdminGuideReview.tsx`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/legal/safety/page.tsx`.

### Schema and migration drift
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase-schema.sql`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/schema.v2.sql`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260213103000_add_booking_status_approved_pending_payment.sql`.

### Existing docs scanned for this AS-IS snapshot
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/README.md`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/CLAUDE.md`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/PAGE-README.md`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/PAGE-README.md`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guides/[slug]/README.md`.
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/onboarding/README.md`.

### Missing docs explicitly requested in prompt
- `Master Context`: `UNKNOWN / NOT FOUND IN REPO`.
- `PRD`: `UNKNOWN / NOT FOUND IN REPO`.
- `persona specs` (named file): `UNKNOWN / NOT FOUND IN REPO`.
- `pricing/fees spec` (named file): `UNKNOWN / NOT FOUND IN REPO`.
- `traveler journey spec` (named file): `UNKNOWN / NOT FOUND IN REPO`.
- `codebase overview` (named file): `UNKNOWN / NOT FOUND IN REPO`.
