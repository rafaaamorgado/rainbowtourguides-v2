# ADR-0003: Pricing, Fee Math, and Price-Lock Snapshots

## Status
- Date: 2026-02-14
- State: Proposed
- Implemented: Partial

## Context
Executable pricing in the active booking flow computes:
- `serviceFee = basePrice * 0.08`
- `total = basePrice + serviceFee`

Booking creation persists `price_total` and `currency` on the booking row. Approval and checkout reuse booking amount for Stripe.

Docs/content are inconsistent across surfaces:
- FAQ shows `5%` traveler fee and `15%` guide commission.
- Terms page shows `20%` commission.
- Requested rule `10% minimum $15 + 20% commission` is not implemented in runtime pricing code.

Documented but not implemented:
- Traveler fee `10%` with minimum `$15`.
- Enforced `20%` guide commission in runtime payout logic.
- Explicit fee-component snapshot columns beyond `bookings.price_total`.

## Decision
A single canonical fee policy is not yet selected.

Interim AS-IS decisions:
- Treat runtime fee math as 8% service fee in booking UI.
- Treat `bookings.price_total` as the effective price-lock snapshot used for checkout.

A follow-up decision must choose one canonical fee policy and align code + copy.

## Consequences
- Fee behavior is executable but business-policy ambiguous.
- Copy and legal/FAQ surfaces can diverge from charged amounts.
- Reporting and payouts cannot reliably derive intended fee split from current schema.

## Alternatives
- Option A: Ratify current 8% runtime model and update all copy/legal pages to match.
- Option B: Implement target `10% min $15` traveler fee + `20%` commission with shared pricing service/constants and snapshot fields.
- Option C: Adopt FAQ model (`5%` + `15%`) and remove conflicting references.

## Links
- `components/guide/booking-card.tsx:61`
- `components/guide/booking-card.tsx:62`
- `app/api/bookings/create/route.ts:71`
- `app/api/bookings/[id]/approve/route.ts:104`
- `app/api/checkout/create-session/route.ts:118`
- `app/faq/page.tsx:422`
- `app/faq/page.tsx:423`
- `app/legal/terms/page.tsx:128`
- `app/legal/terms/page.tsx:136`
- `docs/01-product.md:131`
