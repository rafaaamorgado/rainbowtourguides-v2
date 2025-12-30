-- Create storage buckets for guide onboarding
-- guide-photos: Public bucket for guide profile photos
-- guide-documents: Private bucket for ID verification documents

-- Create guide-photos bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guide-photos',
  'guide-photos',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create guide-documents bucket (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guide-documents',
  'guide-documents',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for guide-photos bucket

-- Allow authenticated users to upload their own photo
CREATE POLICY "Users can upload their own guide photo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'guide-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own photo
CREATE POLICY "Users can update their own guide photo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'guide-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own photo
CREATE POLICY "Users can delete their own guide photo"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'guide-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to guide photos
CREATE POLICY "Guide photos are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'guide-photos');

-- RLS Policies for guide-documents bucket

-- Allow authenticated users to upload their own ID documents
CREATE POLICY "Users can upload their own ID documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'guide-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own ID documents
CREATE POLICY "Users can update their own ID documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'guide-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own ID documents
CREATE POLICY "Users can delete their own ID documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'guide-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read only their own ID documents
CREATE POLICY "Users can read their own ID documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'guide-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to read all ID documents for verification
CREATE POLICY "Admins can read all ID documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'guide-documents' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
