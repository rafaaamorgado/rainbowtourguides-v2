# ADR-0004: Stripe Payment Architecture (Platform Checkout + App Verification)

## Status
- Date: 2026-02-14
- State: Accepted
- Implemented: Yes

## Context
Current payment flow creates Stripe Checkout Sessions in `mode: payment` and stores session IDs on bookings.

Booking confirmation occurs via application-side Checkout Session verification, not via Stripe webhooks. No webhook route is present under `app/api`.

No runtime usage was found for Connect transfer primitives (`transfer_data`, `application_fee_amount`, `transfers.create`, `payouts.create`) in checkout handlers.

Documented but not implemented:
- Webhook-driven payment state transitions.
- Destination charges or separate charges/transfers payout architecture.

## Decision
Use platform-side Checkout payment capture with app-side verification as the canonical AS-IS model.

Specifically:
- Charge creation happens through Checkout Session APIs.
- Booking status changes to `confirmed` only after session verification shows `payment_status = paid`.
- Destination charges/separate transfers are not part of the current runtime.

## Consequences
- Simpler implementation today.
- Confirmation reliability depends on app verification execution.
- Payout/distribution logic must be added separately in future work.

## Alternatives
- Option A: Destination charges + `application_fee_amount` with connected accounts.
- Option B: Separate charges and transfers with explicit transfer orchestration.
- Option C: Keep current charging model but move confirmation authority to webhook events.

## Links
- `lib/stripe.ts:12`
- `app/api/bookings/[id]/approve/route.ts:95`
- `app/api/bookings/[id]/approve/route.ts:124`
- `app/api/checkout/create-session/route.ts:109`
- `app/api/checkout/verify-session/route.ts:16`
- `lib/checkout-verification.ts:92`
- `app/api` (no Stripe webhook route)
