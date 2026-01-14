-- Migration: Add photo_url column to profiles and backfill from avatar_url when present

-- 1) Add photo_url column if missing
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS photo_url text;

-- 2) Backfill photo_url from avatar_url when the avatar_url column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'avatar_url'
  ) THEN
    UPDATE public.profiles
    SET photo_url = avatar_url
    WHERE photo_url IS NULL
      AND avatar_url IS NOT NULL;
  END IF;
END $$;
