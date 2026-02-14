# ADR-0005: Guide Verification Approach (Manual Review vs Stripe Connect/Identity)

## Status
- Date: 2026-02-14
- State: Proposed
- Implemented: Partial

## Context
The implemented onboarding flow collects identity documents and submits guide applications for manual admin review (`status: pending`). Admin actions approve/reject/suspend guides.

A separate onboarding UI component contains Stripe Connect/identity copy and explicitly notes "In a real implementation...", indicating placeholder intent rather than active runtime integration.

No runtime Connect onboarding/account-creation flow is present in current payment or onboarding handlers.

Documented but not implemented:
- Redirecting guides to Stripe to verify identity and link bank account during onboarding.

## Decision
Current executable behavior remains manual verification + admin approval.

Final verification architecture is unresolved and requires a follow-up decision:
- whether to keep manual verification as primary, or
- move to Stripe Connect onboarding without Stripe Identity product, or
- add Stripe Identity as a separate KYC layer.

## Consequences
- Verification can operate without Connect dependencies today.
- Payout readiness is decoupled from onboarding completion.
- Placeholder Stripe copy can create operator/guide expectations not met by runtime.

## Alternatives
- Option A: Keep manual doc review and admin approval (current runtime).
- Option B: Implement Stripe Connect onboarding for payout/KYC, without Stripe Identity product.
- Option C: Add Stripe Identity + Connect with stronger automated verification.

## Links
- `components/guide/onboarding/step-verification-docs.tsx:16`
- `components/guide/onboarding/step-verification-docs.tsx:28`
- `app/guide/onboarding/page.tsx:383`
- `lib/actions/admin-actions.ts:188`
- `components/guide/onboarding/step-verification.tsx:29`
- `components/guide/onboarding/step-verification.tsx:42`
- `components/guide/onboarding/step-verification.tsx:48`
