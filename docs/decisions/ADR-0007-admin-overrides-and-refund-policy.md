# ADR-0007: Admin Overrides and Refund Policy (AS-IS)

## Status
- Date: 2026-02-14
- State: Accepted
- Implemented: Partial

## Context
Admin override actions and UI allow force-changing booking statuses, but the allowed list omits `approved_pending_payment`.

Refund behavior is implemented in the cancel API:
- traveler cancels: 100% if >48h, else 50%
- guide cancels: 100%
- Stripe refunds are created when payment intent is present.

A separate traveler-bookings path directly updates booking status to `cancelled_by_traveler`, bypassing cancel API refund logic.

Documented but not implemented:
- A single, consistently enforced cancellation/refund path for all cancellation actions.

## Decision
Adopt current runtime behavior as AS-IS:
- Admin overrides are supported for the current allowed status list (excluding `approved_pending_payment`).
- Refund policy is enforced only when cancellation goes through `POST /api/bookings/{id}/cancel`.
- Direct DB cancellation path is treated as legacy/inconsistent behavior.

## Consequences
- Operational flexibility exists for admins, but with a status coverage gap.
- Refund outcomes may differ depending on which cancellation path is used.
- Auditability and customer experience are weaker until cancellation paths are unified.

## Alternatives
- Option A: Keep as-is and document the override/status gap.
- Option B: Route all cancellations through cancel API and remove direct status writes.
- Option C: Add strict server-side cancellation command handler and deprecate UI-side direct updates.

## Links
- `lib/actions/admin-actions.ts:188`
- `components/admin/BookingStatusOverride.tsx:12`
- `app/api/bookings/[id]/cancel/route.ts:6`
- `app/api/bookings/[id]/cancel/route.ts:90`
- `app/api/bookings/[id]/cancel/route.ts:130`
- `components/booking/CancelBookingModal.tsx:72`
- `app/traveler/bookings/page.tsx:352`
