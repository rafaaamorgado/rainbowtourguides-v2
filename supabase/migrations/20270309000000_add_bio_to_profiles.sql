-- Ensure profiles.bio exists for traveler profile editing

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio text;

-- No policy changes required; existing "Users can update their own profile" policy applies.
