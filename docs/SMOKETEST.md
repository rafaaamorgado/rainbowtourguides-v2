# Smoke Test Checklist

Run this checklist before deploying to production to verify end-to-end functionality.

## Prerequisites

- [ ] Supabase project is set up and linked
- [ ] Environment variables configured in `.env.local`:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (for admin operations)
  - `STRIPE_SECRET_KEY` (test key)
  - `STRIPE_PUBLISHABLE_KEY` (test key)
  - `RESEND_API_KEY`
  - `EMAIL_FROM`
- [ ] Stripe test mode enabled
- [ ] Resend account configured

## Authentication & User Setup

- [ ] **Sign up as traveler**
  - [ ] Navigate to `/auth/sign-up`
  - [ ] Create account with email/password
  - [ ] Verify redirect to `/traveler/bookings`
  - [ ] Verify profile created in Supabase

- [ ] **Sign up as guide**
  - [ ] Navigate to `/auth/sign-up?role=guide`
  - [ ] Create account with email/password
  - [ ] Verify redirect to `/guide/onboarding`
  - [ ] Complete onboarding form:
    - [ ] Select city
    - [ ] Add headline, about, languages, themes
    - [ ] Set hourly rate
  - [ ] Verify guide profile created with status `pending`

- [ ] **Promote user to admin**
  - [ ] In Supabase dashboard, go to Authentication > Users
  - [ ] Find a test user and note their UUID
  - [ ] In SQL Editor, run:
    ```sql
    UPDATE public.profiles SET role = 'admin' WHERE id = '<user-uuid>';
    ```
  - [ ] Verify user can access `/admin` page

- [ ] **Approve guide**
  - [ ] As admin, or via Supabase SQL Editor:
    ```sql
    UPDATE public.guides SET status = 'approved' WHERE id = '<guide-uuid>';
    ```
  - [ ] Verify guide appears on `/cities/[slug]` page
  - [ ] Verify guide profile is accessible at `/guides/[slug]`

## Booking Flow

- [ ] **Create booking request**
  - [ ] As traveler, navigate to `/guides/[slug]` for an approved guide
  - [ ] Fill out booking form:
    - [ ] Select date and time
    - [ ] Set duration (hours)
    - [ ] Add optional notes
  - [ ] Submit booking
  - [ ] Verify success message appears
  - [ ] Verify booking appears in `/traveler/bookings` with status `pending`
  - [ ] Check Resend dashboard for email to guide

- [ ] **Accept booking as guide**
  - [ ] As guide, navigate to `/guide/dashboard`
  - [ ] Verify booking appears in bookings list
  - [ ] Click "Accept" button
  - [ ] Verify booking status changes to `accepted`
  - [ ] Check Resend dashboard for email to traveler

- [ ] **Pay for booking**
  - [ ] As traveler, navigate to `/traveler/bookings`
  - [ ] Verify "Pay Now" button appears for accepted booking
  - [ ] Click "Pay Now"
  - [ ] Verify redirect to Stripe Checkout
  - [ ] Use Stripe test card: `4242 4242 4242 4242`
  - [ ] Complete payment
  - [ ] Verify redirect back to `/traveler/bookings?session=...`
  - [ ] Verify booking status updates to `paid`
  - [ ] Check Resend dashboard for emails to both traveler and guide

## Page Navigation

- [ ] **Public pages**
  - [ ] `/` - Landing page loads
  - [ ] `/cities` - City index page loads, shows cities with guide counts
  - [ ] `/cities/[slug]` - City detail page loads, shows approved guides
  - [ ] `/guides/[slug]` - Guide profile page loads for approved guide
  - [ ] `/legal/terms` - Terms page loads
  - [ ] `/legal/privacy` - Privacy page loads
  - [ ] `/legal/safety` - Safety page loads

- [ ] **Authenticated pages**
  - [ ] `/traveler/bookings` - Requires auth, shows user bookings
  - [ ] `/guide/dashboard` - Requires guide role, shows guide bookings
  - [ ] `/guide/onboarding` - Requires guide role, shows onboarding form
  - [ ] `/admin` - Requires admin role, loads admin page

## Email Verification

- [ ] **Check Resend dashboard**
  - [ ] Booking request email sent to guide
  - [ ] Booking status email sent to traveler (accepted/declined)
  - [ ] Payment confirmation emails sent to both traveler and guide
  - [ ] All emails have correct content and links

## Edge Cases

- [ ] **Unauthorized access**
  - [ ] Try accessing `/guide/dashboard` as traveler → should redirect
  - [ ] Try accessing `/admin` as non-admin → should redirect
  - [ ] Try accessing `/traveler/bookings` while logged out → should redirect to sign-in

- [ ] **Data validation**
  - [ ] Try creating booking with invalid date → should show error
  - [ ] Try submitting guide onboarding without required fields → should show error
  - [ ] Try accepting booking that doesn't belong to guide → should fail silently

## Final Checks

- [ ] All pages render without console errors
- [ ] No TypeScript errors (`npm run build` succeeds)
- [ ] No linting errors (`npm run lint` passes)
- [ ] Database queries return expected data
- [ ] Stripe test payments complete successfully
- [ ] Email delivery works for all booking events

## Notes

- Use Stripe test mode for all payment testing
- Check Resend dashboard for email delivery (not inbox, unless configured)
- Use Supabase dashboard to verify data changes
- Keep test data separate from production data

