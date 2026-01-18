-- Migration: Add status and slug columns to guides table
-- These columns are defined in schema.v2.sql but may be missing from the deployed database

-- Create the guide_status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.guide_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add status column to guides table if it doesn't exist
ALTER TABLE public.guides
ADD COLUMN IF NOT EXISTS status public.guide_status NOT NULL DEFAULT 'pending';

-- Add slug column to guides table if it doesn't exist
ALTER TABLE public.guides
ADD COLUMN IF NOT EXISTS slug text;

-- Create unique index on slug (partial index for non-null values)
CREATE UNIQUE INDEX IF NOT EXISTS guides_slug_unique_idx
ON public.guides (slug)
WHERE slug IS NOT NULL;

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS guides_status_idx
ON public.guides (status);

-- Update existing guides to have status = 'approved' if they don't have one
-- (This assumes existing guides in production should be approved)
UPDATE public.guides
SET status = 'approved'
WHERE status IS NULL;

-- Generate slugs for existing guides that don't have one
-- Uses the profile's full_name combined with a portion of the guide's ID
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

-- Add comment for documentation
COMMENT ON COLUMN public.guides.status IS 'Guide approval status: pending, approved, or rejected';
COMMENT ON COLUMN public.guides.slug IS 'URL-friendly identifier for guide profile pages';
