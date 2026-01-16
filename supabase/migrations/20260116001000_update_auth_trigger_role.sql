-- Migration: Update auth trigger to respect role from metadata
-- This ensures that if a user signs up as 'guide', the profile is created correctly.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _full_name text;
  _avatar_url text;
  _role public.profile_role;
BEGIN
  _full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.email,
    ''
  );

  _avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture', -- Google
    NEW.raw_user_meta_data->>'photo_url',
    NULL
  );

  -- Determine role safe casting, default to traveler
  BEGIN
    _role := (NEW.raw_user_meta_data->>'role')::public.profile_role;
  EXCEPTION WHEN OTHERS THEN
    _role := 'traveler'::public.profile_role;
  END;
  
  -- Fallback if null
  IF _role IS NULL THEN
    _role := 'traveler'::public.profile_role;
  END IF;

  -- Insert profile row (skip if already exists)
  INSERT INTO public.profiles (id, role, full_name, avatar_url)
  VALUES (
    NEW.id,
    _role,
    _full_name,
    _avatar_url
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role, -- Allow updating role if it was a placeholder
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url);

  RETURN NEW;
END;
$$;
