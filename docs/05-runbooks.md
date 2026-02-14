---
doc_id: 05-runbooks
owner: Engineering (TBD)
reviewers:
  - Cofounders (TBD)
status: Draft (AS-IS)
last_updated: 2026-02-14
as_is_snapshot_date: 2026-02-14
---

# Rainbow Tour Guides v2 Runbooks (AS-IS)

## 1) Environments Overview (local / preview / prod)

| Environment | What exists now | Deployment surface | Data/services |
|---|---|---|---|
| Local | Next.js app run from repo (`npm run dev`) with local env file | Local Node process on developer machine | Supabase project (remote), Stripe API, Resend API, Cloudinary API |
| Preview | Vercel preview deployments (inferred from linked Vercel project and `VERCEL_URL` runtime usage) | Vercel project `rainbowtourguides-v2` | Same external providers; env values come from Vercel preview env |
| Production | Vercel production deployment | Vercel production alias/domain (`NEXT_PUBLIC_SITE_URL` defaults to `https://rainbowtourguides.com`) | Same external providers; env values come from Vercel production env |

Notes:
1. No CI pipeline is committed in this repo (`.github/workflows` is absent).
2. No `vercel.json` is committed.
3. Supabase local project config (`supabase/config.toml`) and Supabase Edge Functions (`supabase/functions`) are not present in this repo.
4. A linked Supabase project ref is present in local CLI metadata: `supabase/.temp/project-ref`.

## 2) Deploy Procedure (step-by-step, AS-IS)

### 2.1 Pre-deploy checks
1. Install dependencies:
```bash
npm install
```
2. Run lint:
```bash
npm run lint
```
3. Run production build:
```bash
npm run build
```
4. Confirm required env vars are set in the target Vercel environment (Preview or Production).

### 2.2 Deploy
1. Preferred project path: push commits to the branch connected to the Vercel project `rainbowtourguides-v2`.
2. Manual path (if using Vercel CLI from this linked directory): deploy preview with `vercel`, deploy production with `vercel --prod`.
3. Wait for Vercel deployment completion.

### 2.3 Post-deploy smoke checks
1. Open public pages: `/`, `/cities`, `/guides`.
2. Validate auth-protected pages load for each role (`/traveler/*`, `/guide/*`, `/admin/*` as applicable).
3. Validate booking flow critical path:
   - traveler creates request (`POST /api/bookings/create`)
   - guide approves request (`POST /api/bookings/{id}/approve`)
   - payment completion lands on `/traveler/bookings/success`
   - booking transitions to `confirmed` via checkout verification.
4. Check Vercel runtime logs for API errors.

## 3) Rollback Procedure (step-by-step)

### 3.1 Instant rollback (Vercel)
1. Open Vercel project deployments for `rainbowtourguides-v2`.
2. Select the last known-good deployment.
3. Use Vercel rollback/promote action to move production traffic back immediately.
4. Re-run smoke checks from section 2.3.

### 3.2 Commit-level rollback
1. Revert the bad commit(s) on the deployed branch.
2. Push the revert commit.
3. Wait for Vercel redeploy and verify.

### 3.3 Database and policy rollback
1. There is no automated DB rollback pipeline in repo CI.
2. Use Supabase SQL Editor for manual rollback/fix scripts.
3. For RLS incidents, use existing SQL runbooks in `supabase/` (see incident playbooks below).

## 4) Secrets and Env Var Inventory

### 4.1 Public/client-exposed vars

| Variable | Purpose | Where used | Where set (AS-IS) |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | Browser + server Supabase clients, middleware | `.env.local` (local), Vercel env (preview/prod) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Browser + server Supabase clients, middleware | `.env.local`, Vercel env |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for links/redirects | URL helper, email templates | `.env.local`, Vercel env |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary upload target | Cloudinary server/client helpers | `.env.local`, Vercel env |
| `NEXT_PUBLIC_CLOUDINARY_API_KEY` | Cloudinary public API key | Cloudinary server/client helpers | `.env.local`, Vercel env |
| `NEXT_PUBLIC_ENABLE_QUERY_LOGGING` | Optional query debug toggle | Query logger utility | `.env.local` (mostly dev) |
| `VERCEL_URL` | Vercel runtime deployment host | Base URL fallback in prod | Provided by Vercel runtime |

### 4.2 Server-only vars

| Variable | Purpose | Where used | Where set (AS-IS) |
|---|---|---|---|
| `STRIPE_SECRET_KEY` | Stripe API auth | `lib/stripe.ts`, checkout APIs | `.env.local`, Vercel env |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Admin API calls | email lookup helpers | `.env.local`, Vercel env |
| `RESEND_API_KEY` | Transactional email sending | `lib/email.ts` | `.env.local`, Vercel env |
| `CLOUDINARY_API_SECRET` | Cloudinary signing/deletion | Cloudinary API routes + server helpers | `.env.local`, Vercel env |
| `EMAIL_FROM` | Sender identity override | `lib/email.ts` | `.env.local`, Vercel env |
| `ADMIN_NOTIFICATION_EMAIL` | Admin notification target | `lib/email.ts` | `.env.local`, Vercel env |
| `UNSPLASH_ACCESS_KEY` | City image seed script | `scripts/seed-city-images.ts` | local only for scripts |
| `NODE_ENV` | Runtime mode | multiple files | Node/Vercel runtime |

### 4.3 Where secrets live
1. App runtime secrets: Vercel Environment Variables (Preview + Production).
2. Local development secrets: `.env.local` (never commit).
3. Supabase secrets store for Edge Functions: not used by this repo (no `supabase/functions` committed).
4. Supabase project/API key source: Supabase dashboard/project settings (values copied into local/Vercel envs).

## 5) Webhooks Troubleshooting (AS-IS)

### 5.1 Current webhook surface
1. No webhook route is committed under `app/api/*webhook*`.
2. Stripe payment confirmation is redirect/session-verification based, not webhook-based:
   - checkout success URL goes to `/traveler/bookings/success?session_id=...`
   - server verification in `verifyCheckoutSession(...)` updates booking to `confirmed`.

### 5.2 If provider shows webhook failures
1. Check provider dashboard for failing endpoint URL.
2. Confirm whether it points to a legacy/non-existent route (for example, `/api/stripe/webhook` is not present in this repo).
3. Review Vercel logs for attempted hits to missing routes (`404`) or signature errors from old handlers.
4. If endpoint is legacy and unused by current app flow, disable or remove it at provider side to stop alert noise.

### 5.3 Signature-like failures that are not webhooks
1. Cloudinary “signature” failures refer to signed upload generation (`/api/cloudinary/sign`), not webhook verification.
2. Inspect Vercel logs for `[Cloudinary Sign] Error` and validate `NEXT_PUBLIC_CLOUDINARY_*` + `CLOUDINARY_API_SECRET`.

## 6) Incident Playbooks

### 6.1 Stripe payment succeeded but booking not confirmed

Symptom:
1. Stripe shows `paid`, but booking remains `approved_pending_payment`/`accepted`/other non-confirmed status.

Primary checks:
1. Confirm Stripe Checkout Session ID and payment status in Stripe dashboard.
2. Check Vercel logs for errors in:
   - `/traveler/bookings/success`
   - `/api/checkout/verify-session`
   - `lib/checkout-verification.ts` flow.
3. Query booking in Supabase SQL Editor:
```sql
SELECT id, status, stripe_checkout_session_id, confirmed_at, updated_at
FROM public.bookings
WHERE id = '<booking_id>'
   OR stripe_checkout_session_id = '<checkout_session_id>';
```

Recovery:
1. Ask traveler to revisit success URL with valid `session_id` so verification runs again.
2. If needed, trigger verification via authenticated app flow hitting `/api/checkout/verify-session?session=<id>`.
3. If still not updated, use admin bookings override to set `confirmed`.
4. If admin UI is blocked, apply SQL as emergency fix:
```sql
UPDATE public.bookings
SET status = 'confirmed',
    confirmed_at = COALESCE(confirmed_at, NOW()),
    updated_at = NOW()
WHERE id = '<booking_id>'
  AND status IN ('approved_pending_payment', 'accepted', 'awaiting_payment');
```

### 6.2 Webhook signature verification failing

Symptom:
1. Provider reports signature verification failures for webhook deliveries.

AS-IS diagnosis:
1. There is no webhook verification handler committed in `app/api`.
2. Failures usually indicate provider is targeting legacy endpoint(s) that current code no longer uses.

Recovery:
1. Identify failing URL in provider dashboard.
2. If endpoint is not part of current codebase, disable/remove it.
3. If endpoint should exist but is missing, treat as deployment/config drift and roll back to known-good deployment or restore endpoint in a controlled release.

### 6.3 Booking stuck in `accepted`

Symptom:
1. Booking status is `accepted` and does not progress to payment/confirmed path.

Likely cause in current code:
1. Legacy status update endpoint (`PATCH /api/bookings/{id}/status`) can set `accepted`.
2. Main accept flow uses `POST /api/bookings/{id}/approve`, which sets `approved_pending_payment` and creates Stripe session.

Checks:
1. Inspect booking row for `status`, `stripe_checkout_session_id`, `confirmed_at`.
2. If `status='accepted'` and `stripe_checkout_session_id IS NULL`, booking likely bypassed the current approve flow.

Recovery options:
1. Admin override booking back to `pending`, then have guide re-accept via `/api/bookings/{id}/approve`.
2. If payment already succeeded externally, set status to `confirmed` via admin override/SQL.
3. Re-check traveler UI and booking timeline after status correction.

### 6.4 Guide cannot see bookings (RLS)

Symptom:
1. Guide bookings page is empty or realtime channel reports errors (`CHANNEL_ERROR` in browser console).

Checks:
1. Verify guide is authenticated and has `profiles.role='guide'`.
2. Verify target booking rows have matching `guide_id`.
3. Inspect active RLS policies:
```sql
SELECT schemaname, tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'guides', 'bookings', 'messages')
ORDER BY tablename, policyname;
```

Recovery:
1. For recursion/policy corruption symptoms, run `supabase/FIX-RLS-INFINITE-RECURSION.sql`.
2. If still broken, run `supabase/NUCLEAR-FIX-RLS.sql` (emergency reset for `profiles`/`guides` policies).
3. For public guide listing visibility issues, run `supabase/fix-guides-public-access.sql`.
4. Re-test with guide account on `/guide/bookings`.

### 6.5 Public data exposure (SEV1)

Trigger examples:
1. Unauthorized user can read private booking/profile/contact data.
2. Accidental broad policy/public API exposure is detected.

Immediate actions:
1. Declare SEV1 and assign incident roles (section 8).
2. Contain quickly:
   - use Vercel instant rollback to last known-good deployment
   - tighten offending Supabase RLS policy via SQL Editor.
3. Scope impact:
   - inspect Vercel logs for endpoint access patterns
   - inspect Supabase logs and query history for unusual reads.
4. Rotate exposed server secrets if needed:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `RESEND_API_KEY`
   - `CLOUDINARY_API_SECRET`.
5. Preserve evidence and timeline for postmortem.

Verification before close:
1. Re-test exposed endpoint with unauthorized user.
2. Confirm policy and deployment state are restored.
3. Confirm no further abnormal reads in logs.

## 7) Logging and Monitoring (where to look)

1. Vercel runtime logs:
   - API route handler errors (`console.error` in `app/api/**`).
   - Missing route/webhook calls (`404` patterns).
2. Supabase logs:
   - Postgres/API/Auth/Realtime logs in Supabase dashboard.
   - SQL Editor for direct policy and data verification.
3. Stripe dashboard:
   - Checkout Session payment status.
   - Event delivery history (if webhooks configured externally).
4. App/browser logs:
   - Realtime subscription diagnostics in booking pages.
   - `CHANNEL_ERROR` logs point to likely RLS/policy issues.
5. Dev-only query logger:
   - in-memory logs via `lib/query-logger.ts`
   - endpoint `GET /api/debug/queries` (development only).
6. No dedicated APM/error tracker is committed (no Sentry/Datadog config found in repo).

## 8) On-Call Basics

### 8.1 Severity levels

| Severity | Definition | Examples in RTG |
|---|---|---|
| SEV1 | Data exposure, critical security, or complete booking/payment outage | Public data exposure, mass unauthorized access |
| SEV2 | Core flow broken for many users, no safe workaround | Payment confirm flow failing broadly, guides cannot access bookings |
| SEV3 | Partial degradation with workaround | Email notifications failing, isolated status sync issues |
| SEV4 | Minor issue, low user impact | Cosmetic/admin-only non-blocking defects |

### 8.2 Incident roles
1. Incident Commander: owns timeline, decisions, severity, and closure.
2. Ops Lead: executes deploy/rollback and runtime checks.
3. DB Lead: executes Supabase SQL diagnostics/fixes.
4. Communications Lead: user/stakeholder updates.
5. Recorder: keeps timestamped incident notes.

If team size is small, one person may temporarily hold multiple roles.

### 8.3 Postmortem notes template

```md
# Incident Postmortem

## Summary
- Incident ID:
- Severity:
- Start time (UTC):
- End time (UTC):
- Duration:
- Incident commander:

## Impact
- User impact:
- Systems/routes affected:
- Data/security impact:

## Timeline (UTC)
- HH:MM - Detection
- HH:MM - Triage started
- HH:MM - Containment action
- HH:MM - Recovery action
- HH:MM - Validation complete
- HH:MM - Incident closed

## Root Cause
- Technical root cause:
- Why it was not caught earlier:

## What Worked
- 

## What Didn’t
- 

## Corrective Actions
1. Action:
   Owner:
   Due date:
2. Action:
   Owner:
   Due date:
```

## 9) Evidence Index (scripts/config paths)

### Deployment and environments
1. `package.json` (scripts: `dev`, `build`, `start`, `lint`).
2. `.vercel/project.json` (linked Vercel project metadata in local workspace).
3. `.vercel/README.txt` (Vercel link semantics).
4. `.gitignore` (ignores `.vercel` and env files).
5. `README.md` (local setup and env handling).
6. `.env.example` (documented env variable placeholders).
7. `lib/url-helpers.ts` (`NEXT_PUBLIC_SITE_URL` and `VERCEL_URL` fallback).

### API and payment operations
1. `app/api/checkout/create-session/route.ts`.
2. `app/api/checkout/verify-session/route.ts`.
3. `lib/checkout-verification.ts`.
4. `app/traveler/bookings/success/page.tsx`.
5. `app/api/bookings/create/route.ts`.
6. `app/api/bookings/[id]/approve/route.ts`.
7. `app/api/bookings/[id]/status/route.ts`.
8. `app/api/bookings/[id]/cancel/route.ts`.
9. `lib/stripe.ts`.
10. `components/traveler/PayButton.tsx`.
11. `components/traveler/VerifySession.tsx`.

### Env/secrets and integrations
1. `lib/supabase-browser.ts`.
2. `lib/supabase-server.ts`.
3. `lib/email.ts`.
4. `lib/admin-user-email.ts`.
5. `app/api/cloudinary/sign/route.ts`.
6. `app/api/cloudinary/delete/route.ts`.
7. `scripts/seed-city-images.ts`.

### RLS, data access, and emergency SQL
1. `supabase/migrations/20251210_enable_rls_policies.sql`.
2. `supabase/migrations/20260116000000_enable_rls_policies.sql`.
3. `supabase/migrations/20260114002000_relax_booking_insert_policy.sql`.
4. `supabase/migrations/20260213103000_add_booking_status_approved_pending_payment.sql`.
5. `supabase-schema.sql` (policy snapshot including bookings/messages policies).
6. `supabase/FIX-RLS-INFINITE-RECURSION.sql`.
7. `supabase/NUCLEAR-FIX-RLS.sql`.
8. `supabase/fix-guides-public-access.sql`.
9. `supabase/rls_verification.sql`.

### Admin operations and troubleshooting helpers
1. `lib/actions/admin-actions.ts`.
2. `components/admin/BookingStatusOverride.tsx`.
3. `app/api/admin/bookings/export-csv/route.ts`.
4. `app/api/admin/approve-all-guides/route.ts`.
5. `scripts/APPROVE_GUIDES_INSTRUCTIONS.md`.
6. `scripts/approve-guides.ts`.
7. `scripts/quick-approve-sql.sql`.
8. `scripts/approve-all-guides.sql`.

### Logging and diagnostics
1. `lib/query-logger.ts`.
2. `app/api/debug/queries/route.ts`.
3. `app/guide/bookings/page.tsx` (realtime/channel error logging).
4. `app/guide/bookings/[id]/page.tsx` (realtime/channel error logging).
5. `app/traveler/bookings/page.tsx` (realtime/channel error logging).

