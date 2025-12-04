-- Migration: Align schema with v2 data model
-- Non-destructive: only ADD columns/tables, extend enums
-- Run: psql -f supabase/migrations/20241204_align_v2_schema.sql

-- ============================================================================
-- CITIES: Add denormalized country fields
-- ============================================================================

ALTER TABLE public.cities
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS country_name text;

-- Backfill from countries table
UPDATE public.cities c
SET 
  country_code = co.iso_code,
  country_name = co.name
FROM public.countries co
WHERE c.country_id = co.id
  AND (c.country_code IS NULL OR c.country_name IS NULL);

-- ============================================================================
-- GUIDES: Add new v2 fields
-- ============================================================================

-- Create guide status type
DO $$ BEGIN
  CREATE TYPE public.guide_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.guides
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS about text,
  ADD COLUMN IF NOT EXISTS themes text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hourly_rate numeric(10, 2),
  ADD COLUMN IF NOT EXISTS status public.guide_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug (allows NULLs, enforces uniqueness on non-null)
CREATE UNIQUE INDEX IF NOT EXISTS guides_slug_unique_idx ON public.guides (slug) WHERE slug IS NOT NULL;

-- ============================================================================
-- BOOKINGS: Extend enum and add new fields
-- ============================================================================

-- Add new values to booking_status enum (idempotent)
DO $$ BEGIN
  ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'accepted';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'declined';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'paid';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS duration_hours integer,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text;

-- ============================================================================
-- ADMIN_EVENTS: New audit table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.admin_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  type text NOT NULL,
  payload jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_events_actor_id_idx ON public.admin_events(actor_id);
CREATE INDEX IF NOT EXISTS admin_events_type_idx ON public.admin_events(type);
CREATE INDEX IF NOT EXISTS admin_events_created_at_idx ON public.admin_events(created_at DESC);

-- ============================================================================
-- RLS POLICIES (commented out - enable when ready)
-- ============================================================================

/*
-- Profiles: users can read all, update own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Guides: public read for approved, owners can update own
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guides_select_approved" ON public.guides FOR SELECT USING (status = 'approved');
CREATE POLICY "guides_update_own" ON public.guides FOR UPDATE USING (auth.uid() = id);

-- Bookings: travelers see own, guides see bookings for them
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bookings_select_own" ON public.bookings FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT p.id FROM public.profiles p 
      JOIN public.travelers t ON t.id = p.id 
      WHERE t.id = traveler_id
    )
    OR auth.uid() = guide_id
  );

-- Admin events: only admins can read/write
ALTER TABLE public.admin_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_events_admin_only" ON public.admin_events 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
*/

