# 03) Integrations (AS-IS)

Last reviewed: 2026-02-14

## 1) Integrations inventory (AS-IS)

| Service | Purpose | Where configured | Env vars (as used by code) | Key files |
|---|---|---|---|---|
| Stripe Checkout | Collect traveler payment for bookings | Server-side Stripe client + booking approval/checkout APIs | `STRIPE_SECRET_KEY` | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/stripe.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/checkout/create-session/route.ts` |
| Stripe Connect (guide payouts) | Guide onboarding to connected accounts + marketplace payout routing | **NOT IMPLEMENTED** in backend/runtime logic | None found (`STRIPE_WEBHOOK_SECRET`, Connect account envs, etc. not used) | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/guide/onboarding/step-verification.tsx` (placeholder copy only), `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/payouts/page.tsx` (placeholder page) |
| Stripe Webhooks | Async payment confirmation and reconciliation | **NOT IMPLEMENTED** (no Stripe webhook route/handler) | None found for webhook endpoint secret | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api` (no Stripe webhook route), `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts` (redirect/session verification path used instead) |
| Resend | Transactional emails (booking request/status/payment, admin notifications) | Email utility module | `RESEND_API_KEY`, `EMAIL_FROM`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/email.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/.env.example` |
| Supabase | Primary backend: Postgres, Auth, Realtime, Storage | Supabase SSR/browser clients, many routes/pages | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/supabase-server.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/supabase-browser.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts` |
| Cloudinary | Signed image/document upload + deletion | API routes for signing/deleting + client upload helpers | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/cloudinary/sign/route.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/cloudinary/delete/route.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/cloudinary/uploadImage.ts` |
| Google Analytics | Client analytics (consent-gated) | Analytics provider mounted in root layout | `NEXT_PUBLIC_GA_ID` | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/marketing/analytics-provider.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/layout.tsx` |
| Google OAuth (via Supabase Auth) | Social login/signup | Supabase OAuth calls in auth forms | Supabase auth envs (no direct Google key in app code) | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/auth/sign-in-form.tsx`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/auth/sign-up-form.tsx` |
| Unsplash (script-only) | City image seeding script (non-runtime) | Seed script | `UNSPLASH_ACCESS_KEY` | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/scripts/seed-city-images.ts`, `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/.env.example` |
| PayPal | Alternative payment/payout rail | **NOT IMPLEMENTED** in payment code | None | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/faq/page.tsx` (copy mention only) |
| Maps provider (Mapbox/Google Maps/etc.) | Mapping/geocoding | **NOT IMPLEMENTED** | None | `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/package.json` (no map SDK dependency) |

## 2) Stripe payment model (AS-IS)

### Stripe env var findings
- Runtime Stripe code reads only `STRIPE_SECRET_KEY` (`lib/stripe.ts`).
- Local env currently contains `STRIPE_PUBLUSHABLE_KEY` (typo), and no runtime code reads a Stripe publishable key.
- No webhook-secret env var is referenced by runtime code (for example `STRIPE_WEBHOOK_SECRET`).

### Current model
- **Not using "separate charges and transfers."**
- Current implementation is **platform-side Checkout payment capture** (`mode: "payment"`) with booking status updates in app logic.

### Why this is the model (code evidence)
- Checkout sessions are created in:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/checkout/create-session/route.ts`
- Stripe IDs are persisted on `bookings`:
  - `stripe_checkout_session_id`
  - `stripe_payment_intent_id`
- No `transfer_data`, `destination`, `application_fee_amount`, `transfers.create`, or `payouts.create` calls were found in runtime payment handlers.
- No connected-account ID is stored on `guides` in typed schema (`types/database.ts` has no Stripe account field on `GuidesTable`).

## 3) Webhook event contract (AS-IS)

### Handled Stripe webhook events (exact names)
- **None.** No Stripe webhook route/handler is implemented.

### What webhook events trigger in DB
- **None (no webhook event ingestion path exists).**

### What actually updates payment state today (non-webhook path)
- `verifyCheckoutSession(sessionId)` retrieves Checkout Session, requires `session.payment_status === "paid"`, then updates booking:
  - sets `status = "confirmed"` (if not already confirmed/completed)
  - sets `confirmed_at`
  - writes `stripe_checkout_session_id`

### Idempotency strategy
- Webhook-level idempotency: **missing** (no webhook/event store).
- Session verification path has a basic guard (`alreadyConfirmed`) to avoid repeated status transition on re-check.
- **Risk:** confirmation depends on application-side verification call, not asynchronous Stripe event delivery.

## 4) Payment confirmation rule

- Recommended rule target: booking confirmed on `payment_intent.succeeded` (authoritative Stripe async signal).
- **AS-IS rule:** booking is confirmed when app code verifies Checkout Session and sees `payment_status === "paid"` inside `verifyCheckoutSession`.
- **Result:** this differs from the recommended event-driven rule.
- **Risk:** if traveler does not return to success flow (or verify endpoint is not executed), booking may remain unconfirmed despite successful payment.

## 5) Stripe webhook security

- Stripe webhook signature verification (`Stripe-Signature` + endpoint secret) is **NOT IMPLEMENTED**.
- No `webhooks.constructEvent(...)` usage was found.
- **SEV1 risk:** no authenticated webhook contract exists for authoritative async payment state changes.

## 6) Payouts (guides)

- Automated guide payouts via Stripe Connect/Transfers/Payout API are **NOT IMPLEMENTED**.
- `/guide/payouts` is currently a placeholder UI ("No payouts yet").
- No payout thresholds/delays are enforced in code.
- Marketing/FAQ copy mentions payout timing and rails, but no payout engine is present in backend logic.

## 7) Refunds/disputes

### Refunds (AS-IS)
- Implemented in `POST /api/bookings/[id]/cancel`:
  - traveler cancel: `100%` refund if >48h before start, else `50%`
  - guide cancel: `100%`
  - uses Stripe Refund API with `payment_intent`
- Refund metadata includes `booking_id`, `cancelled_by`, `refund_percent`.

### Known flow inconsistency
- `app/traveler/bookings/page.tsx` has a direct DB cancel path (status update) that does not call the cancel API.
- Where that path is used, refund logic can be bypassed.

### Disputes (AS-IS)
- **NOT IMPLEMENTED** (no dispute handlers/events found).

### To-Do (still AS-IS documentation)
- Add dispute lifecycle handling (`charge.dispute.*`) and admin resolution flow.
- Unify all cancellation entry points to always call `/api/bookings/[id]/cancel`.
- Add persistent payment/refund ledger records for auditability.

## 8) Evidence index

- Stripe client + env usage:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/stripe.ts:17`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/stripe.ts:33`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/.env.local:13`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/.env.local:14`
- Checkout session creation:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts:95`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/checkout/create-session/route.ts:109`
- Booking status moves to `approved_pending_payment` on guide approval:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts:124`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/approve/route.ts:126`
- Stripe ID columns on bookings:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts:252`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts:253`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase-schema.sql:245`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/supabase-schema.sql:246`
- Payment confirmation behavior:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts:40`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts:41`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts:92`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/checkout-verification.ts:93`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/success/page.tsx:48`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/checkout/verify-session/route.ts:16`
- No Stripe webhook route in API tree:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api` (route set contains checkout/bookings/cloudinary/admin/debug routes only)
- No Stripe Connect account field on guide records:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/types/database.ts:139`
- Refund logic:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts:6`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts:130`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/bookings/[id]/cancel/route.ts:150`
- Cancellation API is used in modal:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/booking/CancelBookingModal.tsx:72`
- Direct DB cancellation path exists (bypasses cancel API):
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/traveler/bookings/page.tsx:352`
- Payouts placeholder:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/guide/payouts/page.tsx:15`
- Stripe Connect in UI copy only (placeholder component):
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/guide/onboarding/step-verification.tsx:48`
- Email provider (Resend):
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/email.ts:1`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/email.ts:49`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/email.ts:93`
- Supabase backend:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/supabase-server.ts:3`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/lib/supabase-browser.ts:1`
- Cloudinary integration:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/cloudinary/sign/route.ts:82`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/api/cloudinary/delete/route.ts:48`
- Analytics integration:
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/marketing/analytics-provider.tsx:3`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/components/marketing/analytics-provider.tsx:26`
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/layout.tsx:123`
- PayPal mention is content-only (no implementation):
  - `/Users/rafaaa.morgado/Projects/rainbowtourguides-v2/app/faq/page.tsx:238`
