-- Migration: Create city-images storage bucket
-- Used by the backfill cron job to store Pixabay-sourced city hero images

-- Create city-images bucket (public read, service role write)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'city-images',
  'city-images',
  true,
  10485760, -- 10MB max for city hero images
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Public read access for city images
CREATE POLICY "City images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'city-images');

-- Service role (cron job) handles writes via admin client
-- No explicit policies needed - service role bypasses RLS

-- Note: Write access is via service role key in the cron route
-- app/api/cron/backfill-city-images/route.ts

COMMENT ON TABLE storage.buckets IS 'city-images bucket stores hero images for city pages, managed by cron job';
