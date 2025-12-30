-- Add fields to guides table for onboarding wizard data

-- Add availability fields
ALTER TABLE public.guides
ADD COLUMN IF NOT EXISTS available_days TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS typical_start_time TIME DEFAULT NULL,
ADD COLUMN IF NOT EXISTS typical_end_time TIME DEFAULT NULL;

-- Add LGBTQ+ alignment data (stored as JSONB for flexibility)
ALTER TABLE public.guides
ADD COLUMN IF NOT EXISTS lgbtq_alignment JSONB DEFAULT NULL;

-- Create table for guide verification documents
CREATE TABLE IF NOT EXISTS public.guide_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  id_document_url TEXT NOT NULL,
  id_document_type TEXT NOT NULL,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verified_at TIMESTAMPTZ DEFAULT NULL,
  verified_by UUID REFERENCES public.profiles(id) DEFAULT NULL,
  rejection_reason TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Ensure one verification per guide
  UNIQUE(guide_id)
);

-- Add RLS policies for guide_verifications table
ALTER TABLE public.guide_verifications ENABLE ROW LEVEL SECURITY;

-- Guides can read and insert their own verification
CREATE POLICY "Guides can insert their own verification"
ON public.guide_verifications
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = guide_id AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'guide'
  )
);

-- Guides can update their own verification (only if still pending)
CREATE POLICY "Guides can update their own pending verification"
ON public.guide_verifications
FOR UPDATE
TO authenticated
USING (
  auth.uid() = guide_id AND
  verification_status = 'pending'
);

-- Guides can read their own verification
CREATE POLICY "Guides can read their own verification"
ON public.guide_verifications
FOR SELECT
TO authenticated
USING (auth.uid() = guide_id);

-- Admins can read all verifications
CREATE POLICY "Admins can read all verifications"
ON public.guide_verifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Admins can update verifications (approve/reject)
CREATE POLICY "Admins can update verifications"
ON public.guide_verifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_guide_verifications_guide_id ON public.guide_verifications(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_verifications_status ON public.guide_verifications(verification_status);

-- Add comments for documentation
COMMENT ON TABLE public.guide_verifications IS 'Stores ID verification documents for guide approval process';
COMMENT ON COLUMN public.guides.available_days IS 'Array of available weekdays (monday, tuesday, etc.)';
COMMENT ON COLUMN public.guides.typical_start_time IS 'Typical daily start time for tours';
COMMENT ON COLUMN public.guides.typical_end_time IS 'Typical daily end time for tours';
COMMENT ON COLUMN public.guides.lgbtq_alignment IS 'JSONB object with LGBTQ+ community alignment data from onboarding';
