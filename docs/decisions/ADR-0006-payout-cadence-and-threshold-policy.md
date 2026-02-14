# ADR-0006: Payout Cadence and Threshold Policy

## Status
- Date: 2026-02-14
- State: Proposed
- Implemented: No

## Context
The guide payouts page is currently a placeholder with no payout ledger, schedule, threshold, or execution logic.

No payout API calls (`payouts.create`, transfer orchestration) were found in runtime payment routes.

Content surfaces describe payout timing and rails (e.g., "2-3 business days", bank transfer/PayPal), but these rules are not enforced in application code.

Documented but not implemented:
- A concrete payout cadence (2-3 business days).
- A payout method policy in runtime.
- Any payout minimum threshold policy.

## Decision
No executable payout cadence/threshold policy exists in AS-IS runtime.

This ADR remains proposed until one operational policy is selected and implemented.

## Consequences
- Guides cannot rely on system-enforced payout timing.
- Finance operations require manual/off-platform handling.
- Public documentation can overpromise compared to actual product behavior.

## Alternatives
- Option A: Explicitly document payouts as manual until automation is implemented.
- Option B: Implement automated weekly payouts with minimum threshold and reserve rules.
- Option C: Implement on-demand payouts with fraud/risk holds and configurable minimums.

## Links
- `app/guide/payouts/page.tsx:15`
- `app/faq/page.tsx:235`
- `app/faq/page.tsx:237`
- `app/api/bookings/[id]/approve/route.ts:95`
- `app/api/checkout/create-session/route.ts:109`
- `docs/03-integrations.md:76`
- `docs/03-integrations.md:78`
