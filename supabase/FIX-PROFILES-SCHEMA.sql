-- Fix profiles table schema
-- Add missing columns for traveler profiles

-- Add bio column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
COMMENT ON COLUMN public.profiles.bio IS 'User biography/description';

-- Verify columns exist
DO $$ 
BEGIN
  RAISE NOTICE 'Checking profiles table structure...';
  
  -- Check if bio exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'bio'
  ) THEN
    RAISE NOTICE '✓ Column "bio" exists';
  ELSE
    RAISE WARNING '✗ Column "bio" is missing';
  END IF;
  
  -- Check if pronouns exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'pronouns'
  ) THEN
    RAISE NOTICE '✓ Column "pronouns" exists';
  ELSE
    RAISE WARNING '✗ Column "pronouns" is missing';
  END IF;
  
  -- Check if country_of_origin exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'country_of_origin'
  ) THEN
    RAISE NOTICE '✓ Column "country_of_origin" exists';
  ELSE
    RAISE WARNING '✗ Column "country_of_origin" is missing';
  END IF;
  
  -- Check if languages exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'languages'
  ) THEN
    RAISE NOTICE '✓ Column "languages" exists';
  ELSE
    RAISE WARNING '✗ Column "languages" is missing';
  END IF;
  
  RAISE NOTICE 'Schema check complete!';
END $$;

-- Display current profiles structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;
