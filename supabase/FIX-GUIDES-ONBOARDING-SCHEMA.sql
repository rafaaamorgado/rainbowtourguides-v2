-- Fix guides table schema for onboarding
-- Add missing columns needed for guide onboarding flow

-- Add experience_tags column (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'guides' 
    AND column_name = 'experience_tags'
  ) THEN
    ALTER TABLE public.guides ADD COLUMN experience_tags TEXT[];
    COMMENT ON COLUMN public.guides.experience_tags IS 'Guide specialties/experience tags';
  END IF;
END $$;

-- Add available_days column (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'guides' 
    AND column_name = 'available_days'
  ) THEN
    ALTER TABLE public.guides ADD COLUMN available_days TEXT[];
    COMMENT ON COLUMN public.guides.available_days IS 'Days of week guide is typically available';
  END IF;
END $$;

-- Add typical_start_time column (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'guides' 
    AND column_name = 'typical_start_time'
  ) THEN
    ALTER TABLE public.guides ADD COLUMN typical_start_time TIME;
    COMMENT ON COLUMN public.guides.typical_start_time IS 'Typical tour start time';
  END IF;
END $$;

-- Add typical_end_time column (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'guides' 
    AND column_name = 'typical_end_time'
  ) THEN
    ALTER TABLE public.guides ADD COLUMN typical_end_time TIME;
    COMMENT ON COLUMN public.guides.typical_end_time IS 'Typical tour end time';
  END IF;
END $$;

-- Add lgbtq_alignment column (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'guides' 
    AND column_name = 'lgbtq_alignment'
  ) THEN
    ALTER TABLE public.guides ADD COLUMN lgbtq_alignment JSONB;
    COMMENT ON COLUMN public.guides.lgbtq_alignment IS 'LGBTQ+ alignment and standards responses';
  END IF;
END $$;

-- Add approved column (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'guides' 
    AND column_name = 'approved'
  ) THEN
    ALTER TABLE public.guides ADD COLUMN approved BOOLEAN DEFAULT false;
    COMMENT ON COLUMN public.guides.approved IS 'Admin approval status';
  END IF;
END $$;

-- Make sure status column has 'draft' option
DO $$
BEGIN
  -- Check if status is enum type and if 'draft' value exists
  IF EXISTS (
    SELECT 1 FROM pg_type 
    WHERE typname = 'guide_status'
  ) THEN
    -- Add 'draft' to enum if not exists (this requires careful handling)
    RAISE NOTICE 'Status enum exists. Make sure it includes: draft, pending, approved, rejected';
  END IF;
END $$;

-- Verify columns exist
DO $$ 
BEGIN
  RAISE NOTICE '✅ Checking guides table structure...';
  
  -- Check experience_tags
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'guides' 
    AND column_name = 'experience_tags'
  ) THEN
    RAISE NOTICE '  ✓ Column "experience_tags" exists';
  ELSE
    RAISE WARNING '  ✗ Column "experience_tags" is missing';
  END IF;
  
  -- Check available_days
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'guides' 
    AND column_name = 'available_days'
  ) THEN
    RAISE NOTICE '  ✓ Column "available_days" exists';
  ELSE
    RAISE WARNING '  ✗ Column "available_days" is missing';
  END IF;
  
  -- Check typical_start_time
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'guides' 
    AND column_name = 'typical_start_time'
  ) THEN
    RAISE NOTICE '  ✓ Column "typical_start_time" exists';
  ELSE
    RAISE WARNING '  ✗ Column "typical_start_time" is missing';
  END IF;
  
  -- Check typical_end_time
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'guides' 
    AND column_name = 'typical_end_time'
  ) THEN
    RAISE NOTICE '  ✓ Column "typical_end_time" exists';
  ELSE
    RAISE WARNING '  ✗ Column "typical_end_time" is missing';
  END IF;
  
  -- Check lgbtq_alignment
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'guides' 
    AND column_name = 'lgbtq_alignment'
  ) THEN
    RAISE NOTICE '  ✓ Column "lgbtq_alignment" exists';
  ELSE
    RAISE WARNING '  ✗ Column "lgbtq_alignment" is missing';
  END IF;
  
  -- Check approved
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'guides' 
    AND column_name = 'approved'
  ) THEN
    RAISE NOTICE '  ✓ Column "approved" exists';
  ELSE
    RAISE WARNING '  ✗ Column "approved" is missing';
  END IF;
  
  RAISE NOTICE '✅ Schema check complete!';
END $$;

-- Display current guides structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'guides'
ORDER BY ordinal_position;
