# ADR-0001: Messaging Gating Policy (Confirmed-only vs Accepted+)

## Status
- Date: 2026-02-14
- State: Proposed
- Implemented: Partial

## Context
The current runtime gate allows messaging for `accepted`, `awaiting_payment`, `confirmed`, and `completed` bookings. The database insert policy for messages enforces the same set.

Thread pages still show copy that messaging unlocks only after confirmation/payment. This creates a policy conflict between executable behavior and user-facing messaging.

Documented but not implemented:
- "Messaging unlocks once booking is confirmed" is present in UI copy, but runtime allows earlier messaging.

## Decision
Final product policy is unresolved.

Interim AS-IS behavior remains:
- Keep runtime and RLS gating at `accepted`, `awaiting_payment`, `confirmed`, `completed` until a final policy is selected.

A follow-up implementation ADR update is required to choose one canonical policy and align copy, helpers, and RLS.

## Consequences
- Users can chat before payment confirmation.
- Current copy can mislead travelers and guides.
- Policy ambiguity increases support and QA complexity.

## Alternatives
- Option A: Confirmed-only chat.
  Update helper + RLS to `confirmed` and `completed` only.
- Option B: Accepted+ chat.
  Keep current helper + RLS and update product/UI copy.
- Option C: Hybrid pre-confirmation restrictions.
  Keep early chat but limit features before `confirmed`.

## Links
- `lib/messaging-rules.ts:11`
- `lib/messaging-rules.ts:22`
- `supabase-schema.sql:936`
- `supabase-schema.sql:938`
- `app/traveler/messages/[threadId]/page.tsx:46`
- `app/traveler/messages/[threadId]/page.tsx:68`
- `app/guide/messages/[threadId]/page.tsx:44`
- `app/guide/messages/[threadId]/page.tsx:68`
