# Rainbow Tour Guides v2 — AS-IS PRD Truth Snapshot

Snapshot date: 2026-02-14  
Repo: `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2`  
Scope rule: AS-IS only, evidence-based.  
Verification boundary: code + SQL + docs in this repo only. No live DB introspection.

---

## 1) Summary: what RTG v2 is and what it proves

Rainbow Tour Guides v2 is a role-based marketplace for LGBTQ+ travel experiences:
- Visitors browse cities and guides.
- Travelers request tours.
- Guides accept/decline requests.
- Travelers pay via Stripe Checkout.
- Admins moderate guides and can override booking statuses.

What the current build **proves** end-to-end:
- Public discovery works (`/cities`, `/guides`, guide profile pages).
- Request-first booking works (`pending` request creation).
- Guide approval can create a Stripe Checkout session and send a traveler “pay now” email.
- Payment confirmation can move bookings to `confirmed` through app-side session verification.
- Booking-scoped chat exists and is status-gated.

What it **does not prove** yet:
- Webhook-authoritative payment lifecycle (no Stripe webhook route).
- Automated payouts engine (guide payouts page is placeholder).
- Complete review lifecycle (review UI route from bookings is missing).
- A single canonical fee policy (runtime and docs conflict).

Primary evidence:
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guides/page.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/create/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/messaging-rules.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/payouts/page.tsx`

---

## 2) Personas + key jobs-to-be-done

| Persona | JTBD (AS-IS) | Current evidence |
|---|---|---|
| Visitor | Discover safe/verified guides by city; understand trust/legal info before signup | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/cities/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guides/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/legal/safety/page.tsx` |
| Traveler | Request a private tour, pay when accepted, manage bookings, message guide | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/guide/booking-card.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/create/route.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/messages/page.tsx` |
| Guide | Complete onboarding, receive and decide on booking requests, coordinate with traveler | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/onboarding/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/bookings/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/messages/page.tsx` |
| Admin | Moderate supply and operations (guide approvals, booking overrides, exports/search) | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/admin/guides/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/actions/admin-actions.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/admin/search/route.ts` |

---

## 3) Feature inventory

### Visitor

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Browse cities directory | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/cities/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/data-service.ts` | City list filters to active cities and counts approved guides in app logic. |
| Browse guides directory + filters | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guides/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guides/filtered-view.tsx` | Public guides query constrained to `status='approved'`. |
| Guide public profile + booking request card | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guides/[slug]/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/guide/booking-card.tsx` | Non-approved profile visibility blocked except owner/admin. |
| Countries pages | Partial | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/countries/[slug]/page.tsx` | Placeholder copy page. |
| Blog | Partial | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/blog/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/blog/[slug]/page.tsx` | Mock/static content, fallback placeholder, no CMS-backed implementation. |
| Safety/legal content pages | Implemented (content), Partial (enforcement) | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/legal/safety/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/legal/terms/page.tsx` | Several policy claims are not fully backed by runtime workflows (see conflicts section). |

### Traveler

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Traveler onboarding | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/onboarding/page.tsx` | Creates traveler row and updates profile. |
| Traveler profile + settings + gallery | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/profile/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/settings/actions.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/profile/ProfileGallery.tsx` | `is_public` setting is stored but not consistently enforced on public profile route. |
| Create booking request | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/guide/booking-card.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/create/route.ts` | Auth + email-verified enforced; API trusts client-submitted price. |
| Booking list + detail | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/[id]/page.tsx` | Shows status, contact masking, actions. |
| “Pay now” after guide approval (email) | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/email.ts` | Traveler gets checkout URL email on approval. |
| In-app pay button in traveler booking surfaces | Partial | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/traveler/PayButton.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/[id]/page.tsx` | PayButton exists but is not wired in traveler booking pages. |
| Cancel booking with refund policy | Implemented (API path), Partial (consistency) | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/booking/CancelBookingModal.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/page.tsx` | Direct DB cancel path in traveler bookings bypasses refund API. |
| Messaging inbox/thread | Partial | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/messages/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/messages/[threadId]/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/messaging-rules.ts` | Thread pages query `messages.text` while DB/type uses `messages.body`; copy says confirmed-only but gate allows earlier statuses. |
| Reviews (write/manage) | Not implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/reviews/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/page.tsx` | “Leave review” link points to missing route (`/traveler/bookings/[id]/review`). |

### Guide

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Guide onboarding draft autosave + submit for review | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/onboarding/page.tsx` | Saves draft then sets `status='pending'` on submit. |
| Guide verification docs upload (manual admin review path) | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/guide/onboarding/step-verification-docs.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/admin/guides/[id]/page.tsx` | Manual review is executable path. |
| Stripe Connect identity/onboarding in guide flow | Partial (UI copy only) | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/guide/onboarding/step-verification.tsx` | Component says “In a real implementation...”; no backend Connect flow found. |
| Receive booking requests + accept/decline | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/bookings/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/status/route.ts` | Accept uses `/approve`; decline uses `/status`. |
| Decline reasons taxonomy | Not implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/status/route.ts` | `reason` is parsed but not persisted/enforced. |
| Guide availability schedule + block dates | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/availability/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/availability/actions.ts` | Uses `guides.availability_pattern` and `guide_unavailable_dates`. |
| Guide time-off ranges | Partial | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/guide-time-off.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/guide-availability.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts` | Code uses `guide_time_off` table not present in typed schema/migrations found in repo. |
| Guide payouts | Not implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/payouts/page.tsx` | Placeholder state only. |
| Guide reviews management page | Not implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/reviews/page.tsx` | Placeholder state only. |
| Mark booking completed from guide flow | Not implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/bookings/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/bookings/[id]/page.tsx` | `completed` status exists but no guide UI/API path was found to set it. |

### Admin

| Feature | Status | Evidence | Notes |
|---|---|---|---|
| Admin dashboard counts | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/admin/page.tsx` | Real DB count queries for key entities. |
| Guide moderation (approve/reject/suspend/unsuspend) | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/actions/admin-actions.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/admin/AdminGuideReview.tsx` | Full moderation actions wired. |
| Booking status override | Partial | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/actions/admin-actions.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/admin/BookingStatusOverride.tsx` | Override list omits `approved_pending_payment`. |
| Admin search | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/admin/search/route.ts` | Admin role check performed in handler. |
| Booking CSV export | Implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/admin/bookings/export-csv/route.ts` | Admin-only export endpoint. |
| User actions (suspend/view details) | Partial | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/admin/UserActions.tsx` | Mostly toast-only actions, no persisted moderation side effects. |
| Reviews moderation page | Not implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/admin/reviews/page.tsx` | Placeholder state only. |
| Blog/content management page | Not implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/admin/content/blog/page.tsx` | Placeholder state only. |
| Admin payments/refunds/disputes console | Not implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/admin` | No dedicated payments/disputes admin route found. |

---

## 4) User journeys (happy path + key edge cases)

### Happy path (currently executable)

1. Visitor browses city and guide pages.
2. Traveler submits booking request from guide page.
3. Booking row is created with `status='pending'`.
4. Guide accepts request.
5. System creates Stripe Checkout session, stores session id, sets `approved_pending_payment`, and emails traveler payment link.
6. Traveler pays via Stripe Checkout.
7. Success page / verify endpoint calls `verifyCheckoutSession`; if paid, booking becomes `confirmed`.
8. Messaging becomes available based on status gate.

Evidence:
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guides/[slug]/page.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/create/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/success/page.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts`

### Key edge cases

| Edge case | AS-IS behavior | Evidence |
|---|---|---|
| Traveler never returns to success page after paying | `UNKNOWN / NOT CONFIRMED IN CODE` that booking will auto-confirm; no webhook route exists | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/checkout/verify-session/route.ts` |
| Traveler cancels from `/traveler/bookings` list | Direct DB status update to `cancelled_by_traveler`; refund API can be bypassed | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts` |
| Guide declines request with reason | Endpoint parses `reason` but does not enforce or persist taxonomy | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/status/route.ts` |
| Messaging before payment | Gate helper allows `accepted`/`awaiting_payment`; thread copy says confirmed-only | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/messaging-rules.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/messages/[threadId]/page.tsx` |
| Existing messages rendering in thread pages | Pages query `messages.text`; DB/type/chat components use `messages.body` | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/messages/[threadId]/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/messages/[threadId]/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/messaging/chat-window.tsx` |
| Traveler review from completed booking | UI links to missing route | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/reviews/page.tsx` |

---

## 5) Booking lifecycle & permissions

### Statuses found in app types

`draft`, `pending`, `approved_pending_payment`, `accepted`, `awaiting_payment`, `confirmed`, `declined`, `cancelled_by_traveler`, `cancelled_by_guide`, `completed`

Evidence:
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts`

### Transition map (AS-IS)

| From | To | Trigger | Actor / permission check | Evidence |
|---|---|---|---|---|
| new | `pending` | `POST /api/bookings/create` | Auth required; email must be verified; no traveler-role check in handler | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/create/route.ts` |
| `pending` | `approved_pending_payment` | `POST /api/bookings/[id]/approve` | Auth required; caller must be booking’s `guide_id` | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts` |
| `pending` | `declined` | `PATCH /api/bookings/[id]/status` | Auth required; caller must be booking’s `guide_id` | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/status/route.ts` |
| `pending` | `accepted` | `PATCH /api/bookings/[id]/status` | Same ownership checks; legacy path still enabled | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/status/route.ts` |
| unpaid states | `confirmed` | Checkout session verify | Payment session must be `paid`; then booking update | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts` |
| active states | `cancelled_by_traveler` / `cancelled_by_guide` | `POST /api/bookings/[id]/cancel` | Auth required; caller must be traveler or guide participant; future start required | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts` |
| various | admin-chosen status | Admin override action | `requireRole('admin')`; allowed list excludes `approved_pending_payment` | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/actions/admin-actions.ts` |

### Permission posture summary

- UI routes enforce role via middleware and `requireRole`.
- Middleware treats `/api/*` as public prefix; each API route must self-enforce auth/authorization.
- Most booking/payment/admin APIs do enforce auth checks.
- RLS should be authoritative because server client uses anon key + user cookie session.
- Actual deployed RLS state is `UNKNOWN / NOT CONFIRMED IN CODE` due policy drift between `supabase-schema.sql` and migrations.

Evidence:
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/middleware.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/auth-helpers.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/supabase-server.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase-schema.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20251210_enable_rls_policies.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260116000000_enable_rls_policies.sql`

---

## 6) Pricing & monetization

### Exact fee math as implemented

1. **Guide profile booking card (primary user flow math)**  
   `serviceFee = basePrice * 0.08`  
   `total = basePrice + serviceFee`

2. **Booking creation API**  
   Stores `price_total = clientPayload.price` (stringified).  
   Server does not recompute fee from canonical pricing constants.

3. **Guide approve API checkout amount**  
   Uses stored booking `price_total` and converts to cents with `Math.round(amount * 100)`.

4. **Legacy checkout create-session API**  
   Recomputes amount from guide 4h/6h/8h prices, falls back to booking `price_total` if needed.

5. **Cancellation refund math**  
   Traveler cancel: 100% if `>48h`, else 50%.  
   Guide cancel: 100%.  
   Stripe partial refund amount uses floor on cents: `Math.floor(amountPaid * refundPercent / 100)`.

Evidence:
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/guide/booking-card.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/create/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/checkout/create-session/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts`

### Does a price snapshot exist?

- **Yes, partial snapshot exists**: `bookings.price_total` + `bookings.currency` are stored and reused for approval checkout.
- **No component-level snapshot**: no authoritative `base/fee/commission/payout` columns found in typed schema.

Evidence:
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/create/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`

### Does traveler “pay now” email exist?

- **Yes, implemented.**

Evidence:
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/email.ts`

---

## 7) Integrations: Stripe objects + webhook events handled

### Stripe objects currently used

| Stripe object/API | AS-IS usage | Evidence |
|---|---|---|
| `checkout.sessions.create` | Create payment session on guide approval and legacy traveler pay endpoint | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/checkout/create-session/route.ts` |
| `checkout.sessions.retrieve` | Verify payment status; derive payment intent on cancel fallback | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts` |
| `paymentIntents.retrieve` | Determine paid amount for cancellation refunds | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts` |
| `refunds.create` | Issue full or partial refunds on cancellation API path | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts` |

### Webhook events handled

- **None found.**
- No Stripe webhook route under `/app/api` and no `webhooks.constructEvent(...)` usage found.

Evidence:
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/stripe.ts`

---

## 8) Data model summary

### Key tables + important columns

| Table | Important columns (AS-IS in code/types) | Notes | Evidence |
|---|---|---|---|
| `profiles` | `id`, `role`, `full_name`, `avatar_url`, `cover_url`, `is_public`, `email_notifications`, `is_suspended` | Central identity/role table | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts` |
| `travelers` | `id`, `persona`, `interests` | Traveler extended profile | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts` |
| `guides` | `id`, `city_id`, `status`, `approved`, `is_verified`, `price_4h/6h/8h`, `availability_pattern`, verification/contact fields | Guide listing + onboarding data | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts` |
| `bookings` | `traveler_id`, `guide_id`, `city_id`, `status`, `price_total`, `currency`, `start_at`, Stripe ids, timestamp fields | Core booking state machine row | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts` |
| `messages` | `booking_id`, `sender_id`, `body`, `created_at` | Chat payload column is `body` | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase-schema.sql` |
| `booking_reads` | `booking_id`, `user_id`, `last_read_message_id`, `last_read_at` | Read receipts | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/create_booking_reads.sql`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts` |
| `reviews` | `booking_id`, `traveler_id`, `guide_id`, `rating`, `comment` (typed model) | Schema drift exists: snapshot SQL also shows `author_id/subject_id` model | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase-schema.sql` |
| `guide_unavailable_dates` | `guide_id`, `start_date`, `end_date` | Availability blocking implemented | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/availability/actions.ts` |
| `profile_images` | `user_id`, `public_id`, `url`, `is_primary`, `sort_order` | Gallery images with RLS in migration | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260203000000_create_profile_images.sql`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts` |
| `admin_events` | `actor_id`, `type`, `payload` | Audit/event table exists; limited visible usage in app surfaces | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts` |

### Data model gaps / drift

- `guide_time_off` is used by app code but not present in typed schema or migrations found.
- `approved_pending_payment` exists in types + migration but is missing in `supabase-schema.sql` enum.
- Review schema differs between typed model (`traveler_id/guide_id`) and snapshot SQL (`author_id/subject_id`).
- `schema.v2.sql` is not aligned with current runtime/types; it still includes TODO RLS comments and older columns.

Evidence:
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/guide-time-off.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260213103000_add_booking_status_approved_pending_payment.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase-schema.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/schema.v2.sql`

### RLS posture summary

- RLS is expected to be active in production paths because server uses anon key and session cookies.
- Multiple RLS policy generations exist across migrations and snapshot SQL with overlapping/conflicting predicates.
- Message-send status gating exists in snapshot SQL policy (`accepted/awaiting_payment/confirmed/completed`) but not in broad migration policy variants.
- Therefore, exact deployed RLS behavior is `UNKNOWN / NOT CONFIRMED IN CODE` without live `pg_policies` inspection.

Evidence:
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/supabase-server.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase-schema.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20251210_enable_rls_policies.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260116000000_enable_rls_policies.sql`

---

## 9) Risks / gaps

### Security gaps

1. No webhook signature verification or webhook route for Stripe payment events.
2. `/api/*` paths are middleware-public by prefix; every endpoint relies on route-level checks.
3. Traveler direct cancel path bypasses refund/business controls in cancel API.
4. RLS/policy source drift means true DB enforcement is uncertain from repo alone.
5. Service-role email lookup helper bypasses table RLS by design.
6. Dev debug endpoint has no auth in development mode.

Evidence:
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/middleware.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/page.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/admin-user-email.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/debug/queries/route.ts`

### Operational gaps

1. No automated payout pipeline (Connect onboarding, payout jobs, ledger).
2. No webhook-driven idempotent payment confirmation.
3. No proven non-admin flow to set booking `completed`.
4. No unified refund/dispute operations console for admins.
5. Email sending can silently no-op when `RESEND_API_KEY` is missing.

Evidence:
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/payouts/page.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/actions/admin-actions.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/email.ts`

### Product gaps for pilot launch

1. Fee/cancellation/payout claims conflict across runtime, FAQ, terms, and legacy docs.
2. Reviews journey incomplete (missing review submission route + placeholder pages).
3. Messaging policy inconsistency (copy vs gate behavior).
4. Blog/admin content moderation and reviews moderation are placeholders.
5. Privacy setting (`is_public`) is not consistently enforced on traveler public profile route.

Evidence:
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/guide/booking-card.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/faq/page.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/legal/terms/page.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/reviews/page.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/travelers/[id]/page.tsx`

---

## 10) Conflicts & decisions needed (with recommended default)

| Conflict | AS-IS evidence | Decision needed | Recommended default |
|---|---|---|---|
| Fee policy conflict: runtime 8% vs FAQ 5%+15% vs Terms 20% vs TO-BE 10% min $15 + 20% commission | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/guide/booking-card.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/faq/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/legal/terms/page.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/to-be-prd-and-plan.md` | Choose one canonical fee model and align code+copy+legal | Adopt one policy immediately for pilot; until implemented, treat current executable charge path as source of truth in operations |
| Booking acceptance states split (`approved_pending_payment` and `accepted`) | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/status/route.ts` | Keep dual path or consolidate | Consolidate on `approved_pending_payment` pre-payment state; keep `accepted` legacy for backward compatibility window only |
| Payment confirmation depends on app verification, not webhook events | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api` | Keep sync verify as authority or move to webhook authority | Keep success-page verify as fallback, make webhook authoritative |
| Messaging copy says confirmed-only; gate helper allows earlier statuses | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/messaging-rules.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/messages/[threadId]/page.tsx` | Choose confirmed-only vs accepted+ | For pilot, pick one policy and align helper + RLS + copy together |
| Cancellation path inconsistency (API vs direct DB update) | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/page.tsx` | Allow both or force single server path | Force all cancellations through cancel API |
| Review schema mismatch and missing traveler review route | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase-schema.sql`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/page.tsx` | Canonical review schema + flow owner | Freeze one review schema, generate types from DB, then implement route |
| `is_public` preference not enforced in traveler public profile route | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/settings/actions.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/travelers/[id]/page.tsx` | Public profile always visible vs privacy-controlled | Enforce `is_public` at public route query gate |
| Schema source drift (types vs snapshot SQL vs migrations) | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase-schema.sql`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/schema.v2.sql`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations` | Define canonical schema artifact ownership | Migrations as source of truth; regenerate `types/database.ts`; deprecate stale schema snapshots |

---

## 11) Test checklist for pilot launch (“done means for pilot”)

1. Booking request creation enforces auth + verified email and writes `pending` with non-null `price_total`.
2. Guide accept from UI sets `approved_pending_payment`, stores checkout session id, and sends traveler payment-link email.
3. Guide decline path works and traveler sees `declined`.
4. Paid session verification updates booking to `confirmed` exactly once on repeated calls.
5. No cancellation path bypasses refund logic (remove/block direct DB cancel updates in traveler bookings list).
6. Traveler cancel refund math is correct for both `>48h` and `<=48h` cases.
7. Guide cancel returns 100% refund in paid case.
8. Messaging gate behavior is explicitly chosen and matches UI copy and DB policy.
9. Message queries use the actual DB column (`body`) in all thread surfaces.
10. Review flow is either shipped (route + insert path) or explicitly disabled in UI for pilot.
11. `approved_pending_payment` is supported in admin override/status tooling (or explicitly excluded with runbook guidance).
12. Public profile privacy behavior for travelers is tested against `is_public`.
13. Stripe failure cases are covered when traveler does not return from checkout (currently `UNKNOWN / NOT CONFIRMED IN CODE` without webhook path).
14. RLS smoke tests are executed for booking/message/read-receipt tables with traveler/guide/admin/anon users.

Primary test evidence surfaces:
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/create/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/page.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/messaging-rules.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20251210_enable_rls_policies.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260116000000_enable_rls_policies.sql`

---

## 12) Evidence index

### Requested docs scan results

- **New PRD doc**: interpreted as `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/to-be-prd-and-plan.md` (found and scanned).
- **Persona specs**: no single canonical “persona spec” file found; scanned these persona-oriented docs:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/01-product.md`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/PAGE-README.md`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/PAGE-README.md`
- **Master Context**: `UNKNOWN / NOT FOUND IN REPO`.
- **Pricing & Fees spec**: no single file by that exact name; scanned:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/decisions/ADR-0003-pricing-fees-and-price-lock-snapshots.md`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/to-be-prd-and-plan.md`
- **Safety & Eligibility policy**: scanned:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/legal/safety/page.tsx`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/01-product.md`
- **Codebase & Product Overview (Jan 15)**: `UNKNOWN / NOT FOUND IN REPO` as a named doc.

### Core product/runtime files

- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/middleware.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/auth-helpers.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/data-service.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/adapters.ts`

### Booking/payment/messaging APIs and pages

- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/create/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/status/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/contacts/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/checkout/create-session/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/checkout/verify-session/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/stripe.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/email.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/messaging-rules.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/messaging/chat-window.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/messages/[threadId]/page.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/messages/[threadId]/page.tsx`

### Admin/moderation surfaces

- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/actions/admin-actions.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/admin/guides/page.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/admin/guides/[id]/page.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/admin/AdminGuideReview.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/admin/bookings/page.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/admin/BookingStatusOverride.tsx`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/admin/search/route.ts`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/admin/bookings/export-csv/route.ts`

### Schema + RLS artifacts

- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase-schema.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/schema.v2.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20241204_align_v2_schema.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20251210_enable_rls_policies.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260116000000_enable_rls_policies.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260114002000_relax_booking_insert_policy.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260213103000_add_booking_status_approved_pending_payment.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/create_booking_reads.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20260203000000_create_profile_images.sql`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase/migrations/20251230150500_add_guide_onboarding_fields.sql`

### Existing AS-IS docs/ADRs used for reconciliation

- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/01-product.md`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/02-permissions.md`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/03-integrations.md`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/to-be-prd-and-plan.md`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/decisions/ADR-0001-messaging-gating-policy.md`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/decisions/ADR-0002-booking-status-model.md`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/decisions/ADR-0003-pricing-fees-and-price-lock-snapshots.md`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/decisions/ADR-0004-stripe-payment-architecture.md`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/decisions/ADR-0005-guide-verification-and-stripe-connect-identity.md`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/decisions/ADR-0006-payout-cadence-and-threshold-policy.md`
- `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/docs/decisions/ADR-0007-admin-overrides-and-refund-policy.md`

