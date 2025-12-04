# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Rainbow Tour Guides v2 is an LGBTQ+ travel marketplace built with Next.js 16 App Router, connecting travelers with local guides. The application uses Supabase for backend services (Postgres, Auth, Storage) and Resend for transactional email.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production server
npm start

# Lint code
npm run lint
```

## Environment Setup

The project requires environment variables to be configured in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (elevated privileges)
- `RESEND_API_KEY` - Resend API key for emails

**Critical**: Never commit `.env.local` or any file containing real credentials. If a secret is exposed, rotate it immediately in the provider dashboard.

## Architecture

### Database Schema

The application uses a multi-table schema defined in `types/database.ts`:

- **profiles** - Base user table with roles: `traveler`, `guide`, or `admin`
- **travelers** - Extended profile for travelers with interests and persona
- **guides** - Extended profile for guides with pricing, status (`pending`, `approved`, `rejected`), and city association
- **bookings** - Tour bookings with status flow: `pending` → `confirmed` → `completed` (or `cancelled`)
- **cities** - Cities where guides operate, with slugs and featured flags
- **countries** - Country reference data
- **messages** - Booking-related chat messages

### Supabase Client Architecture

The project uses two distinct Supabase client patterns:

**Server-side** (`lib/supabase-server.ts`):
- Use `createSupabaseServerClient()` in Server Components, Route Handlers, and Server Actions
- Automatically handles cookie-based auth via Next.js `cookies()` API
- Uses anon key by default to enforce Row Level Security (RLS)
- Switch to `SUPABASE_SERVICE_ROLE_KEY` only when elevated privileges are required

**Client-side** (`lib/supabase-browser.ts`):
- Use `createSupabaseBrowserClient()` in Client Components
- Returns singleton browser client or `null` if not configured
- Check `isSupabaseConfiguredOnClient()` before rendering client forms

### Authentication & Authorization

The `lib/auth-helpers.ts` module provides role-based auth helpers:

- `requireUser()` - Returns `{ supabase, user, profile }` or redirects to `/auth/sign-in`
- `requireRole(role)` - Ensures user has specific role, redirects to `/` otherwise
- `requireAnyRole(roles)` - Ensures user has one of the allowed roles
- `getRedirectPathForRole(role)` - Returns dashboard path based on role:
  - `admin` → `/admin`
  - `guide` → `/guide/dashboard`
  - `traveler` → `/traveler/bookings`

Use these helpers at the top of Server Components and Server Actions to enforce auth requirements.

### Route Structure

The app follows Next.js 16 App Router conventions:

- `app/(marketing)/page.tsx` - Public homepage (route group, no URL segment)
- `app/auth/sign-in/page.tsx` - Sign in page
- `app/auth/sign-up/page.tsx` - Sign up with `?role=guide|traveler` query param
- `app/guide/onboarding/page.tsx` - Guide profile creation/editing
- `app/guide/dashboard/page.tsx` - Guide dashboard
- `app/admin/page.tsx` - Admin panel
- `app/traveler/bookings/page.tsx` - Traveler bookings
- `app/cities/[slug]/page.tsx` - City detail page
- `app/guides/[slug]/page.tsx` - Guide profile page
- `app/countries/[slug]/page.tsx` - Country page

All pages share a common layout (`app/layout.tsx`) with header and footer navigation.

### Server Actions Pattern

Server Actions are colocated with pages (see `app/guide/onboarding/page.tsx` for example):

```typescript
async function submitGuideProfile(formData: FormData): Promise<{ success: boolean; error?: string }> {
  "use server";

  const { supabase, profile } = await requireRole("guide");
  // ... validation and database operations
  revalidatePath("/guide/dashboard");
  return { success: true };
}
```

Key patterns:
- Always use `"use server"` directive
- Validate auth with `requireUser()` or `requireRole()` at the start
- Return structured result objects `{ success, error? }`
- Use `revalidatePath()` to refresh data after mutations
- Cast Supabase operations with `as any` when TypeScript types are too strict (the database.ts types are comprehensive but may need casting for complex queries)

### Component Organization

- `components/ui/*` - shadcn/ui primitives (Button, Card, Input, Badge, etc.)
- `components/auth/*` - Authentication forms (SignUpForm, SignInForm)
- `components/guide/*` - Guide-specific components (GuideOnboardingForm, GuideStatusBadge)

Client Components use the `'use client'` directive and typically handle form state and interactivity.

## Security Practices

From `SECURITY.md`:

1. **Secrets Hygiene**:
   - Use environment variables for all credentials
   - Never hard-code tokens or JWTs in source files
   - Review PRs for stray credentials before merging
   - Rotate any exposed credentials immediately

2. **Environment Variables**:
   - `.env.example` documents required variables with placeholders
   - Copy to `.env.local` and fill with real values locally
   - Never commit `.env.*.local` files

## Styling

The project uses Tailwind CSS with shadcn/ui components:
- Utility-first CSS classes
- CSS variables defined in `app/globals.css` for theming
- Component variants use `class-variance-authority` (CVA)
- Merge utilities with `tailwind-merge` via `lib/utils.ts` `cn()` helper

## Type Safety

- Database types are generated in `types/database.ts`
- Use the `Database` type to reference table schemas: `Database["public"]["Tables"]["profiles"]["Row"]`
- ProfileRole: `"traveler" | "guide" | "admin"`
- GuideStatus: `"pending" | "approved" | "rejected"`
- BookingStatus: `"pending" | "confirmed" | "completed" | "cancelled" | "accepted" | "declined" | "paid"`

## Common Patterns

**Fetching data in Server Components**:
```typescript
const { supabase, profile } = await requireUser();
const { data } = await supabase.from("cities").select("*").eq("is_active", true);
```

**Creating protected routes**:
```typescript
export default async function ProtectedPage() {
  const { supabase, profile } = await requireRole("guide");
  // ... page implementation
}
```

**Client-side auth checks**:
```typescript
const supabase = createSupabaseBrowserClient();
if (!supabase) {
  return <p>Supabase not configured</p>;
}
```
