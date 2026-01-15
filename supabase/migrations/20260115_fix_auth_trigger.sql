-- Trigger to handle new user creation robustly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  role_text text;
  role_enum public.profile_role;
  _full_name text;
  _avatar_url text;
BEGIN
  -- Determine role
  role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'traveler');
  
  -- Validation for enum
  IF role_text NOT IN ('traveler', 'guide', 'admin') THEN
    role_text := 'traveler';
  END IF;
  
  role_enum := role_text::public.profile_role;

  -- Determine full name
  _full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Determine avatar/photo url
  _avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NEW.raw_user_meta_data->>'photo_url',
    NULL
  );

  -- Insert/Update profile
  INSERT INTO public.profiles (id, role, full_name, avatar_url)
  VALUES (
    NEW.id,
    role_enum,
    _full_name,
    _avatar_url
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = CASE 
             WHEN public.profiles.role IS NULL OR public.profiles.role = 'traveler'::profile_role 
             THEN EXCLUDED.role 
             ELSE public.profiles.role 
           END, -- Only update role if it wasn't set or was default, usually keep existing
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    avatar_url = COALESCE(public.profiles.avatar_url, EXCLUDED.avatar_url),
    updated_at = now();

  RETURN NEW;
END;
$$;

-- Ensure the trigger is attached
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they might conflict (optional, but safer to recreate)
DROP POLICY IF EXISTS "Users can select their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can select their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

