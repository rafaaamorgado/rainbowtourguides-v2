# ADR-0002: Booking Status Model (AS-IS)

## Status
- Date: 2026-02-14
- State: Accepted
- Implemented: Partial

## Context
The typed booking status set currently includes:
`draft`, `pending`, `approved_pending_payment`, `accepted`, `awaiting_payment`, `confirmed`, `declined`, `cancelled_by_traveler`, `cancelled_by_guide`, `completed`.

Runtime transitions are split between the modern approve flow and a legacy status endpoint:
- Create request sets `pending`.
- Approve flow sets `approved_pending_payment` and creates Stripe Checkout.
- Legacy status endpoint still allows `accepted` and `declined`.
- Payment verification moves bookings to `confirmed`.
- Cancel API sets cancellation statuses.

Documented but not implemented:
- No confirmed standard UI/API transition to set `completed`.
- No primary setter path found for `awaiting_payment` in current routes.

## Decision
Adopt the current enum and transition behavior as the canonical AS-IS model for documentation and operational support.

Primary AS-IS transitions:
- `new -> pending` via booking creation.
- `pending -> approved_pending_payment` via approve endpoint.
- `pending -> declined` via status endpoint.
- `pending -> accepted` via legacy status endpoint.
- unpaid/approved states -> `confirmed` via checkout session verification.
- active states -> cancellation statuses via cancel endpoint.

## Consequences
- The system supports both modern and legacy acceptance paths.
- Operational tooling must account for both `accepted` and `approved_pending_payment`.
- Incomplete transition coverage (`completed`, `awaiting_payment`) remains a cleanup item.

## Alternatives
- Option A: Keep current dual-path model.
- Option B: Consolidate on a single pre-payment accepted state and remove legacy `accepted` transition path.
- Option C: Introduce explicit state machine enforcement in API and DB constraints.

## Links
- `types/database.ts:3`
- `types/database.ts:13`
- `supabase/migrations/20260213103000_add_booking_status_approved_pending_payment.sql:1`
- `app/api/bookings/create/route.ts:70`
- `app/api/bookings/[id]/approve/route.ts:124`
- `app/api/bookings/[id]/status/route.ts:18`
- `app/api/bookings/[id]/status/route.ts:82`
- `lib/checkout-verification.ts:92`
- `app/api/bookings/[id]/cancel/route.ts:150`
- `lib/booking-status.ts:8`
