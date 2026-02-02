-- ============================================================================
-- Migration: Create profile_images table
-- Description: Adds support for multiple profile images per user with 
--              Cloudinary integration, primary image selection, and sorting
-- Date: 2026-02-03
-- ============================================================================

-- Create profile_images table
-- This table stores multiple images for user profiles (avatars, cover photos, etc.)
-- Images are stored in Cloudinary with public_id and url references
CREATE TABLE IF NOT EXISTS public.profile_images (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to profiles table (cascades on delete)
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Cloudinary identifiers
  public_id text NOT NULL,  -- Cloudinary public_id for transformations/deletions
  url text NOT NULL,         -- Full Cloudinary URL (https://res.cloudinary.com/...)
  
  -- Image metadata
  caption text NULL,         -- Optional caption/description for the image
  is_primary boolean NOT NULL DEFAULT false,  -- One primary image per user
  sort_order int NULL,       -- Manual ordering of images (optional)
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Index on user_id for fast lookups of all images for a user
CREATE INDEX IF NOT EXISTS idx_profile_images_user_id 
  ON public.profile_images(user_id);

-- Index on sort_order for efficient ordering queries
CREATE INDEX IF NOT EXISTS idx_profile_images_sort_order 
  ON public.profile_images(user_id, sort_order) 
  WHERE sort_order IS NOT NULL;

-- Partial unique index: Only one primary image per user
-- This ensures that is_primary=true can only exist once per user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_images_one_primary_per_user 
  ON public.profile_images(user_id) 
  WHERE is_primary = true;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on the table
ALTER TABLE public.profile_images ENABLE ROW LEVEL SECURITY;

-- Policy 1: Public can view all profile images
-- Use case: Display profile images on public profile pages
CREATE POLICY "profile_images_select_public"
  ON public.profile_images
  FOR SELECT
  USING (true);

-- Policy 2: Authenticated users can insert their own profile images
-- Use case: User uploading new profile images
CREATE POLICY "profile_images_insert_own"
  ON public.profile_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Authenticated users can update their own profile images
-- Use case: User updating caption, is_primary, or sort_order
CREATE POLICY "profile_images_update_own"
  ON public.profile_images
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Authenticated users can delete their own profile images
-- Use case: User removing unwanted profile images
CREATE POLICY "profile_images_delete_own"
  ON public.profile_images
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- Comments (for documentation)
-- ============================================================================

COMMENT ON TABLE public.profile_images IS 
  'Stores multiple profile images per user with Cloudinary integration. Supports primary image selection and custom sorting.';

COMMENT ON COLUMN public.profile_images.public_id IS 
  'Cloudinary public_id used for transformations and deletions';

COMMENT ON COLUMN public.profile_images.url IS 
  'Full Cloudinary URL (https://res.cloudinary.com/...)';

COMMENT ON COLUMN public.profile_images.is_primary IS 
  'Indicates the primary/default image for the user. Only one can be true per user.';

COMMENT ON COLUMN public.profile_images.sort_order IS 
  'Optional manual ordering for displaying images in a specific sequence';

-- ============================================================================
-- Verification
-- ============================================================================

-- The following queries can be used to verify the migration:
-- 
-- Check table exists:
--   SELECT * FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profile_images';
-- 
-- Check indexes:
--   SELECT * FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'profile_images';
-- 
-- Check RLS policies:
--   SELECT * FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profile_images';
-- 
-- Test primary constraint (should fail on second insert):
--   INSERT INTO profile_images (user_id, public_id, url, is_primary) 
--   VALUES ('user-id', 'test1', 'url1', true);
--   INSERT INTO profile_images (user_id, public_id, url, is_primary) 
--   VALUES ('user-id', 'test2', 'url2', true);  -- Should fail
