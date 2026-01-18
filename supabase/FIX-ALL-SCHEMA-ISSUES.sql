-- ============================================================================
-- COMPREHENSIVE SCHEMA FIX FOR RAINBOW TOUR GUIDES
-- ============================================================================
-- This script fixes all missing columns and schema issues
-- Run this ONCE in Supabase SQL Editor
-- ============================================================================

-- 1. FIX CITIES TABLE - Add denormalized country fields
-- ============================================================================
ALTER TABLE public.cities
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS country_name text;

-- Backfill country data from countries table
UPDATE public.cities c
SET 
  country_code = co.iso_code,
  country_name = co.name
FROM public.countries co
WHERE c.country_id = co.id
  AND (c.country_code IS NULL OR c.country_name IS NULL);

-- 2. FIX GUIDES TABLE - Add all missing columns
-- ============================================================================

-- Create guide_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.guide_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add all missing columns
ALTER TABLE public.guides
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS tagline text,
  ADD COLUMN IF NOT EXISTS experience_tags text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS hourly_rate numeric(10, 2),
  ADD COLUMN IF NOT EXISTS status public.guide_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS available_days text[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS typical_start_time time DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS typical_end_time time DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lgbtq_alignment jsonb DEFAULT NULL;

-- Note: 'about' and 'themes' fields are in schema.v2.sql but not used in practice. 
-- All guide descriptions use 'bio' field, and tags use 'experience_tags' field.

-- Create unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS guides_slug_unique_idx 
ON public.guides (slug) 
WHERE slug IS NOT NULL;

-- Create index on status
CREATE INDEX IF NOT EXISTS guides_status_idx 
ON public.guides (status);

-- 3. GENERATE SLUGS FOR GUIDES WITHOUT THEM
-- ============================================================================
UPDATE public.guides g
SET slug = LOWER(
    REGEXP_REPLACE(
        COALESCE(p.full_name, 'guide'),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
    )
) || '-' || SUBSTRING(g.id::text, 1, 8)
FROM public.profiles p
WHERE g.id = p.id
AND g.slug IS NULL;

-- 4. APPROVE ALL PENDING GUIDES (OPTIONAL - COMMENT OUT IF NOT NEEDED)
-- ============================================================================
-- UPDATE public.guides
-- SET status = 'approved'
-- WHERE status = 'pending';

-- 5. FIX RLS POLICIES - Allow public read access to guides
-- ============================================================================

-- Drop old restrictive policy if it exists
DROP POLICY IF EXISTS "Approved guides are viewable by everyone" ON public.guides;
DROP POLICY IF EXISTS "guides_select_approved" ON public.guides;

-- Create new public read policy
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'guides' 
        AND policyname = 'Guides are viewable by everyone'
    ) THEN
        CREATE POLICY "Guides are viewable by everyone"
            ON public.guides FOR SELECT
            USING (true);
    END IF;
END $$;

-- Ensure guides can update their own profile
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'guides' 
        AND policyname = 'Guides can update their own profile'
    ) THEN
        CREATE POLICY "Guides can update their own profile"
            ON public.guides FOR UPDATE
            USING (auth.uid() = id);
    END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check cities columns
SELECT 
    'Cities columns' as check_type,
    COUNT(*) FILTER (WHERE country_name IS NOT NULL) as cities_with_country_name,
    COUNT(*) FILTER (WHERE country_code IS NOT NULL) as cities_with_country_code,
    COUNT(*) as total_cities
FROM public.cities;

-- Check guides columns
SELECT 
    column_name, 
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'guides'
  AND column_name IN ('headline', 'tagline', 'bio', 'slug', 'status', 'experience_tags')
ORDER BY column_name;

-- Check guides with slugs
SELECT 
    'Guides status' as check_type,
    COUNT(*) FILTER (WHERE slug IS NOT NULL) as guides_with_slug,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_guides,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_guides,
    COUNT(*) as total_guides
FROM public.guides;

-- Show sample guides
SELECT 
    g.id,
    p.full_name,
    g.slug,
    g.headline,
    g.status,
    c.name as city_name
FROM public.guides g
LEFT JOIN public.profiles p ON p.id = g.id
LEFT JOIN public.cities c ON c.id = g.city_id
ORDER BY g.created_at DESC
LIMIT 5;

-- ============================================================================
-- DONE!
-- ============================================================================
SELECT '✅ Schema fixes applied successfully!' as status;
