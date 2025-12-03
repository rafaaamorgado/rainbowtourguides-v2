# Security Guidelines

Rainbow Tour Guides handles sensitive traveler + guide data, so every contributor must follow these guardrails.

## Environment Variables

- `.env.example` documents every required variable with safe placeholders.
- Copy it to `.env.local` (or `.env.*.local`) and fill real values locally.
- Never commit `.env.local` or any file that contains production/staging secrets.

## Secrets Hygiene

- Use environment variables for Supabase, Resend, Stripe, and any other credentials—never hard-code tokens in source files or docs.
- If a secret is ever exposed or accidentally pushed, rotate it immediately in the provider dashboard and update your local `.env.local`.
- Review PRs for stray credentials before merging.

## Reporting

- If you spot a security issue or leaked secret, notify the team immediately and open a fix PR.
- Document any remediations in the PR/issue tracker so we keep an audit trail.

