## Rainbow Tour Guides v2

Next.js 16 App Router workspace for the Rainbow Tour Guides marketplace.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file with real credentials:

   ```bash
   cp .env.example .env.local
   # then edit .env.local and paste the Supabase + Resend keys from their dashboards
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

## Environment & Secrets

- `.env.example` lists every required variable with **placeholders only**.
- Never commit `.env.local` or any real keys. Git ignores `.env.local`, `.env.development.local`, `.env.production.local`, and `.env.test.local`.
- If a secret is ever exposed, rotate it immediately in Supabase/Resend and update your local `.env.local`.
- Client/server helpers read from the `NEXT_PUBLIC_SUPABASE_*` keys, so missing env values will crash early.

## Security Guidelines

- Real Supabase/Resend keys must live only in `.env.local`.
- Rotate any credential that is accidentally pushed to Git history.
- Do not hard-code tokens or JWTs inside TS/TSX/MD files—reference env variables instead.
- See `SECURITY.md` for the full checklist before shipping changes.

## Tooling

- Next.js 16 App Router, React 19.
- Tailwind CSS 3 with shadcn/ui primitives.
- Supabase for Postgres/Auth/Storage and Resend for transactional email.

## Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Resend Docs](https://resend.com/docs)
