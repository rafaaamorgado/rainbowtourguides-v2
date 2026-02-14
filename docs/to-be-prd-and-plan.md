# Rainbow Tour Guides v2: TO-BE PRD + Implementation Plan

## 1) Executive Summary

### A) Current reality (AS-IS)
- The booking request flow works end-to-end, but pricing, fee, messaging, and payout rules are inconsistent across code and content.
- Current executable booking fee is `8%` in `components/guide/booking-card.tsx`, while legal/FAQ/docs mention different models (`20%`, `5%/15%`, and unresolved `10% min $15`).
- Stripe payment confirmation relies on success-page/session verification (`lib/checkout-verification.ts`), not webhook-driven state.
- Payout engine is not implemented (`app/guide/payouts/page.tsx` is placeholder; no Connect transfer/payout job).
- Messaging gating is inconsistent: helper/RLS allow earlier statuses, but thread copy says confirmed-only.
- Cancellation behavior is inconsistent across surfaces (API path vs direct DB update path).

### B) Target behavior (TO-BE)
- Introduce one canonical pricing policy for pilot:
  - Traveler booking fee: `10%` of base, minimum `$15`, non-refundable on traveler-initiated cancellation.
  - Platform commission: `20%` of base price (booking fee excluded from commission base).
- Enforce booking price lock with immutable booking-level snapshot used for checkout, refunds, and payouts.
- Send traveler payment email immediately when guide accepts.
- Implement webhook-driven payment state + idempotency.
- Implement payouts with Stripe Connect onboarding (no Stripe Identity product), with release at `48h` after completion and `$100` threshold.
- Set messaging gating to confirmed-only for pilot (recommended default), then validate with pilot feedback.

### Authoritative conflicts called out
- `docs/01-product.md`, `docs/03-integrations.md`, and runtime code confirm fee/cancellation/payout inconsistencies.
- `app/legal/terms/page.tsx` and `app/faq/page.tsx` currently conflict with executable fee/cancellation behavior.
- This TO-BE plan intentionally supersedes those conflicting copies for pilot; docs and UI copy must be updated in rollout.

## 2) Product Scope

### A) Current reality (AS-IS)
- Core booking request, guide accept/decline, checkout, and messaging exist.
- Missing or partial for pilot-readiness: unified pricing rules, locked price snapshot, webhook reliability, payout engine, decline reasons, and admin refund/dispute tooling.

### B) Pilot release scope (must ship)
- Canonical pricing calculator and booking snapshot.
- Checkout sourced only from locked snapshot.
- Webhook-based payment confirmation with idempotency.
- Email triggers including immediate accepted->pay-now email.
- Decline reason taxonomy (required code + optional note).
- Refund policy enforced through one cancellation API path.
- Stripe Connect onboarding for guides and payout batching (`48h` delay, `$100` threshold, monthly sweep fallback).
- Messaging gate set to `confirmed`/`completed` only.

### Post-pilot scope (deferred)
- Advanced payout controls (instant payout options, dynamic thresholds per guide).
- Automated dispute evidence workflows.
- Multi-currency settlement and FX handling.
- Coupons/promotions and fee experiments.
- Rich guide payout analytics dashboard.

## 3) TO-BE Flows

### 3.1 Traveler booking + payment flow

### A) Current reality (AS-IS)
- Traveler submits request with price from client-side calculation.
- Guide acceptance creates Stripe Checkout and sends payment link email.
- Confirmation depends on success-page/session verify path.

### B) Target behavior (TO-BE)
1. Traveler submits booking request.
2. Server computes pricing from guide base rate and policy constants (ignore client price payload).
3. Server writes booking snapshot (`base`, `booking_fee`, `commission`, `guide_payout`, `policy_version`) on booking row.
4. Guide accepts booking.
5. System sets `status='approved_pending_payment'`, stamps `price_locked_at`, creates Stripe Checkout from snapshot totals.
6. **Immediate email trigger:** send `booking.accepted.pay_now` to traveler with checkout URL and amount breakdown.
7. Stripe webhook `checkout.session.completed` / `payment_intent.succeeded` confirms booking.
8. System sets `status='confirmed'`, sends confirmation emails to traveler and guide.

### Exact email triggers
- `booking.requested.notify_guide`: on booking creation.
- `booking.accepted.pay_now`: immediately on guide acceptance (non-negotiable).
- `booking.declined.notify_traveler`: on decline, include reason category.
- `booking.payment.confirmed.traveler` + `booking.payment.confirmed.guide`: on webhook-confirmed payment.
- `booking.payment.failed.retry`: on payment failure signal with retry link.

### 3.2 Guide accept/decline with reason taxonomy

### A) Current reality (AS-IS)
- Decline path exists but reason is not captured in UI or enforced in API.

### B) Target behavior (TO-BE)
- Accept remains one action (`pending -> approved_pending_payment`).
- Decline requires one reason code plus optional free-text note.
- Reason taxonomy (pilot):
  - `UNAVAILABLE_DATE_TIME`
  - `OUT_OF_SERVICE_AREA`
  - `REQUEST_NOT_A_MATCH`
  - `INSUFFICIENT_NOTICE`
  - `SAFETY_CONCERN`
  - `PRICING_DISAGREEMENT`
  - `OTHER`
- Validation rules:
  - `reason_code` required for all declines.
  - `reason_note` required when `reason_code='OTHER'`.

### 3.3 Refund/cancellation policy

### A) Current reality (AS-IS)
- API implements one policy, while FAQ/Terms and UI copy describe other policies.
- Direct cancellation path can bypass refund logic.

### B) Target behavior (TO-BE, pilot default)
- All cancellations must go through `POST /api/bookings/[id]/cancel`.
- Traveler-initiated cancellation:
  - `>48h` before start: refund `100%` of base amount.
  - `<=48h` before start: refund `50%` of base amount.
  - Booking fee is non-refundable.
- Guide-initiated cancellation: full traveler refund including booking fee.
- Platform/admin cancellation (safety or operational fault): full traveler refund including booking fee.
- Explicitly update legal + FAQ copy to avoid policy conflicts at launch.

### 3.4 Payout process (threshold + cadence)

### A) Current reality (AS-IS)
- Payouts are not implemented.

### B) Target behavior (TO-BE)
- No Stripe Identity product usage.
- Use Stripe Connect onboarding/account links for payout eligibility and KYC requirements.
- Payout eligibility rule:
  - Booking must be `completed`.
  - `completed_at + 48h <= now`.
  - Booking not refunded/charged back and not already paid out.
- Batch payout job runs hourly:
  - Aggregate eligible `guide_payout_cents` per guide.
  - If balance `>= $100`, create transfer/payout batch.
  - If below threshold, hold until threshold reached.
  - Monthly sweep fallback: force payout of stale eligible balances older than 30 days.

## 4) TO-BE Pricing & Accounting

### A) Current reality (AS-IS)
- Price is partially snapshotted in `bookings.price_total`, but fee/commission components are not persisted as authoritative fields.

### B) Target behavior (TO-BE)

### 4.1 Formulas (all amounts in integer cents)
- `base_cents = selected_guide_duration_price_cents`
- `booking_fee_cents = max(round(base_cents * 0.10), 1500)`
- `traveler_total_cents = base_cents + booking_fee_cents`
- `platform_commission_cents = round(base_cents * 0.20)`
- `guide_payout_cents = base_cents - platform_commission_cents`

### 4.2 Rounding rules
- Persist and calculate money in integer cents only.
- Use half-up rounding for percentage-derived amounts.
- Never recompute historical booking totals from current guide prices.

### 4.3 Examples
- Example 1 (`base=$120.00`):
  - `booking_fee=$15.00` (10% is $12.00, minimum applies)
  - `traveler_total=$135.00`
  - `platform_commission=$24.00`
  - `guide_payout=$96.00`
- Example 2 (`base=$425.00`):
  - `booking_fee=$42.50`
  - `traveler_total=$467.50`
  - `platform_commission=$85.00`
  - `guide_payout=$340.00`

### 4.4 Price lock invariants
- Invariant 1: A booking snapshot is created at request creation and includes policy version.
- Invariant 2: At guide acceptance, snapshot is locked (`price_locked_at` set).
- Invariant 3: Checkout amount must equal `traveler_total_cents` from locked snapshot.
- Invariant 4: Guide profile price edits after acceptance do not affect existing bookings.
- Invariant 5: Refund and payout calculations use snapshot values only.

### 4.5 Snapshot location and rationale
- Snapshot lives on `public.bookings` row in Supabase (`*_cents` columns + `price_snapshot` JSON).
- Why:
  - Single source of truth per booking.
  - Strong auditability for support/disputes.
  - Safe against guide price drift.
  - Enables deterministic refunds, payout batch math, and reconciliation.

## 5) Implementation Plan (Sequenced)

## Epic 1: Pricing snapshot + fee calculator

### Tasks
- Add shared pricing constants and calculator utilities.
- Move pricing computation to server in booking create API.
- Stop trusting client-submitted total price.
- Persist full booking snapshot fields in booking row.
- Update booking card UI to show pilot fee math and totals.

### Affected files/modules
- `app/api/bookings/create/route.ts`
- `components/guide/booking-card.tsx`
- `lib/pricing/constants.ts` (new)
- `lib/pricing/fee-calculator.ts` (new)
- `types/database.ts`
- `lib/db-types.ts`

### Data migrations
- Add to `bookings`:
  - `price_base_cents`, `booking_fee_cents`, `traveler_total_cents`
  - `platform_commission_cents`, `guide_payout_cents`
  - `fee_policy_version`, `price_snapshot`, `price_locked_at`
- Backfill existing bookings from `price_total` where possible; mark uncertain legacy rows with `fee_policy_version='legacy_unknown'`.

### Acceptance criteria
1. Booking creation stores all snapshot fields for new bookings.
2. Client payload `price` is ignored and cannot override server pricing.
3. UI totals match server-calculated totals for all durations.
4. Unit tests cover minimum-fee and percentage-fee branches.

### Risks
- Legacy bookings without component-level fee history.
- UI/content drift if copy updates are not shipped together.

## Epic 2: Checkout session uses snapshots

### Tasks
- Use `traveler_total_cents` from booking snapshot when creating Checkout sessions.
- Add checkout line-item breakdown (base + booking fee).
- Lock snapshot at acceptance (`price_locked_at`).
- Add guards to reject checkout creation when snapshot is missing/invalid.

### Affected files/modules
- `app/api/bookings/[id]/approve/route.ts`
- `app/api/checkout/create-session/route.ts`
- `lib/checkout-verification.ts`
- `app/traveler/bookings/success/page.tsx`

### Data migrations
- Add DB constraint/trigger to prevent editing snapshot money fields after `price_locked_at` is set.

### Acceptance criteria
1. Checkout amount always equals locked `traveler_total_cents`.
2. Guide price edits after acceptance do not change traveler checkout amount.
3. Attempted snapshot mutation after lock is rejected at DB layer.
4. Existing acceptance flow still sets `approved_pending_payment` and returns checkout URL.

### Risks
- Backward compatibility for pending legacy bookings.
- Existing clients using legacy checkout endpoint behavior.

## Epic 3: Webhooks + idempotency + booking status transitions

### Tasks
- Implement Stripe webhook endpoint with signature verification.
- Handle `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`, and refund-related events used by pilot.
- Add idempotency store for processed Stripe events.
- Drive `confirmed` transition from webhook events (success page becomes non-authoritative fallback).

### Affected files/modules
- `app/api/stripe/webhook/route.ts` (new)
- `lib/stripe.ts`
- `lib/checkout-verification.ts`
- `app/api/checkout/verify-session/route.ts`
- `docs/05-runbooks.md`

### Data migrations
- Create `stripe_webhook_events` table with unique `event_id`.
- Add optional booking fields for payment event tracing (`last_payment_event_id`, `payment_failed_at`, `payment_failure_code`).

### Acceptance criteria
1. Replayed webhook events do not duplicate status updates, emails, or ledger entries.
2. Booking becomes `confirmed` from webhook success signal even if traveler never returns to success page.
3. Invalid webhook signatures are rejected.
4. Failed payments keep booking unpaid and trigger retry communication.

### Risks
- Missing/incorrect webhook secret config in environments.
- Race conditions between webhook and synchronous verify endpoint if idempotency is incomplete.

## Epic 4: Email notifications (accepted -> pay now)

### Tasks
- Define transactional email map and template contract.
- Ensure immediate `accepted -> pay now` traveler email dispatch in acceptance path.
- Include decline reason label in decline email.
- Send payment confirmation emails from webhook-confirmed events.
- Add retry-safe send guards and send-audit fields.

### Affected files/modules
- `lib/email.ts`
- `app/api/bookings/[id]/approve/route.ts`
- `app/api/bookings/[id]/status/route.ts`
- `app/api/stripe/webhook/route.ts`
- `lib/url-helpers.ts`

### Data migrations
- Add email audit columns on `bookings` (for example `accepted_email_sent_at`, `accepted_email_attempts`, `last_email_error`).

### Acceptance criteria
1. Traveler receives accepted->pay-now email within one minute of guide acceptance.
2. Decline emails include standardized reason label.
3. Payment confirmation emails are sent once per successful payment.
4. Email failures do not corrupt booking status transitions.

### Risks
- Silent no-op when `RESEND_API_KEY` missing; needs operational alerting.
- Duplicate send risk if retry and idempotency keys are not aligned.

## Epic 5: Payout batching job (48h delay + threshold)

### Tasks
- Add Stripe Connect account onboarding flow for guides (Account Links).
- Persist guide connect account metadata and payout readiness.
- Create payout eligibility evaluator (`completed_at + 48h`, refund/dispute checks).
- Implement hourly payout batch job with `$100` threshold and monthly sweep fallback.
- Record payout batches/items and expose minimal guide payout status page.

### Affected files/modules
- `app/guide/payouts/page.tsx`
- `app/api/guide/connect/onboarding-link/route.ts` (new)
- `app/api/cron/payout-batch/route.ts` (new)
- `lib/payouts/eligibility.ts` (new)
- `lib/payouts/batch.ts` (new)
- `types/database.ts`

### Data migrations
- Add guide fields: `stripe_connect_account_id`, `connect_onboarding_completed_at`, `payouts_enabled`.
- Add booking payout tracking fields: `payout_status`, `payout_eligible_at`, `payout_batch_id`.
- Create `payout_batches` and `payout_items` tables.

### Acceptance criteria
1. No payout is created before `completed_at + 48h`.
2. Balances below `$100` remain pending unless monthly sweep criteria are met.
3. Batch rerun is idempotent and cannot double-pay a booking.
4. Guides without completed Connect onboarding are skipped and flagged.
5. No Stripe Identity integration is required in code path.

### Risks
- Platform Stripe balance insufficiency for transfers.
- Completion signal quality if `completed` status is not reliably set.

## Epic 6: Admin refunds/disputes tooling (minimum viable)

### Tasks
- Build admin payments view for charges, refunds, payout links, and dispute status.
- Add admin refund action (full/partial) with policy guardrails.
- Ingest dispute webhooks and show actionable queue.
- Persist payment/refund/dispute ledger records for audit.

### Affected files/modules
- `app/admin/payments/page.tsx` (new)
- `app/api/admin/refunds/route.ts` (new)
- `app/api/stripe/webhook/route.ts`
- `lib/actions/admin-actions.ts`
- `components/admin/*payments*` (new)

### Data migrations
- Create `payment_ledger` table (charge/refund/dispute events).
- Create `admin_refund_actions` table (actor, reason, amount, timestamp).

### Acceptance criteria
1. Admin can issue allowed refunds with audit trail.
2. Policy blocks traveler-fee refunds for traveler-initiated cancellations.
3. Dispute events are visible in admin queue within minutes of webhook receipt.
4. Ledger entries reconcile against Stripe event IDs and booking IDs.

### Risks
- Incorrect refund calculations can create financial leakage.
- Dispute event handling gaps can delay response SLAs.

## 6) QA Plan

### A) Current reality (AS-IS)
- No comprehensive regression matrix for pricing locks, webhook replays, payout batching, and policy conflicts.

### B) TO-BE QA scenarios (minimum set)
1. Create booking with base `$120` -> fee `$15` minimum applies.
2. Create booking with base `$425` -> fee `$42.50` (10%) applies.
3. Server ignores tampered client price payload.
4. Guide changes listed price after request; checkout still uses original snapshot.
5. Guide accepts pending booking; immediate pay-now email is sent.
6. Guide declines without reason code; API rejects.
7. Guide declines with `OTHER` but no note; API rejects.
8. Checkout line items and total match snapshot cents exactly.
9. Payment succeeds via webhook; booking becomes `confirmed` without success-page revisit.
10. Webhook replay for same event ID causes no duplicate update.
11. Payment fails event keeps booking unpaid and sends retry email.
12. Traveler cancels `>48h`; refund equals base only, booking fee retained.
13. Traveler cancels `<=48h`; refund equals 50% base only.
14. Guide cancels; traveler gets full refund including booking fee.
15. Direct DB cancellation path is removed/blocked; all cancellations go through API.
16. Messaging blocked for `pending` and `approved_pending_payment`.
17. Messaging allowed for `confirmed` and `completed` only.
18. Payout job excludes bookings completed less than 48h ago.
19. Payout job holds guide balance at `$99.99` pending threshold.
20. Payout job pays out once threshold met and marks items paid.
21. Payout batch job rerun is idempotent (no double transfer).
22. Guide without completed Connect onboarding is skipped and notified.
23. Dispute webhook creates admin queue item and ledger entry.
24. Legacy booking with `fee_policy_version='legacy_unknown'` is blocked from auto-payout until reviewed.

## 7) Launch Checklist for Pilot

### Security
- Stripe webhook signature verification enabled in all environments.
- Webhook secret and cron secrets configured and rotated.
- RLS reviewed for new payout/ledger/event tables.
- Price-lock immutability enforced at DB level.
- Sensitive payment fields are not exposed in client payloads/logs.

### Ops
- Vercel cron schedules configured for payout batch and reminders.
- Alerting for webhook failures, email failures, payout failures, and stuck statuses.
- Runbook updated for payment confirmation, payout retry, and dispute handling.
- Backfill and data validation script executed for existing bookings.

### Product
- Legal terms and FAQ updated to match pilot pricing/cancellation rules.
- Guide onboarding copy updated to Connect onboarding (no Stripe Identity references).
- Support macros prepared for accepted/pay-now, refund outcomes, payout pending threshold, and disputes.
- Pilot guide cohort preflight complete: onboarding done, bank linked, payouts enabled.

## 8) Open Questions for Founders

1. Confirm cancellation rule for pilot: keep 2-tier (`>48h = 100% base`, `<=48h = 50% base`) or move to 3-tier (with `<24h = 0%`) before launch?
2. Should non-refundable booking fee apply only to traveler-initiated cancellations, with full fee refund on guide/platform cancellations? (recommended: yes)
3. Confirm payout threshold policy: `$100` with monthly forced sweep after 30 days (recommended) vs lower threshold.
4. Confirm messaging policy for pilot: `confirmed-only` (recommended) vs allowing chat at `approved_pending_payment`.
5. Who can mark tours as `completed` for payout eligibility in pilot: guide only, traveler+guide confirmation, or admin fallback?
6. What is the target dispute response SLA and owner (founder, ops, or support lead) for pilot period?
