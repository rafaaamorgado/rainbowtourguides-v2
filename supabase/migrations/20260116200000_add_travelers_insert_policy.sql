-- Add INSERT policy for travelers table
-- Required for UPSERT operations when a traveler record doesn't exist yet

CREATE POLICY "Users can insert their own traveler record"
  ON public.travelers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
