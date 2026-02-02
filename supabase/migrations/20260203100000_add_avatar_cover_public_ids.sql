-- ============================================================================
-- Migration: Add avatar and cover image fields with Cloudinary public_id
-- Description: Adds columns for storing Cloudinary public_ids and cover images
-- Date: 2026-02-03
-- ============================================================================

-- Add avatar_public_id column to store Cloudinary public_id for avatars
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_public_id text NULL;

-- Add cover_url column to store cover/banner image URL
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cover_url text NULL;

-- Add cover_public_id column to store Cloudinary public_id for cover images
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cover_public_id text NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.avatar_public_id IS 
  'Cloudinary public_id for the avatar image (e.g., users/avatars/user-123/avatar)';

COMMENT ON COLUMN public.profiles.cover_url IS 
  'URL for the cover/banner image (Cloudinary or other CDN)';

COMMENT ON COLUMN public.profiles.cover_public_id IS 
  'Cloudinary public_id for the cover image (e.g., users/covers/user-123/cover)';
