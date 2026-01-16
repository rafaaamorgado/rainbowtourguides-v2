-- Add photo_urls column to travelers table for multi-photo support
ALTER TABLE public.travelers ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}';

COMMENT ON COLUMN public.travelers.photo_urls IS 'Array of photo URLs for traveler profile (up to 4 photos)';
