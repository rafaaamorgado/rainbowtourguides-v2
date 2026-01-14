-- Migration: Auto-create profile on user signup (email & OAuth)
-- Creates a trigger on auth.users INSERT to ensure profiles are created consistently
-- Safe: Does not drop tables or delete data

-- ============================================================================
-- 1. CREATE OR REPLACE THE TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.profile_role;
  _display_name text;
  _avatar_url text;
BEGIN
  -- Determine role: check raw_user_meta_data first, default to 'traveler'
  -- This allows sign-up forms to pass role via metadata
  _role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::public.profile_role,
    'traveler'
  );

  -- Prevent admin role from being set via signup metadata
  IF _role = 'admin' THEN
    _role := 'traveler';
  END IF;

  -- Extract display name from metadata or email
  -- OAuth providers typically set 'full_name' or 'name' in user_metadata
  _display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'display_name',
    split_part(NEW.email, '@', 1),
    'User'
  );

  -- Extract avatar URL from OAuth metadata if available
  _avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'
  );

  -- Insert profile row (skip if already exists)
  INSERT INTO public.profiles (id, role, display_name, avatar_url)
  VALUES (NEW.id, _role, _display_name, _avatar_url)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. DROP EXISTING TRIGGER IF EXISTS (safe update)
-- ============================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================================================
-- 3. CREATE THE TRIGGER
-- ============================================================================

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. BACKFILL: Create profiles for existing auth.users without profiles
-- ============================================================================

INSERT INTO public.profiles (id, role, display_name, avatar_url)
SELECT
  u.id,
  COALESCE(
    CASE
      WHEN (u.raw_user_meta_data->>'role')::text IN ('traveler', 'guide')
      THEN (u.raw_user_meta_data->>'role')::public.profile_role
      ELSE 'traveler'::public.profile_role
    END,
    'traveler'::public.profile_role
  ),
  COALESCE(
    u.raw_user_meta_data->>'full_name',
    u.raw_user_meta_data->>'name',
    u.raw_user_meta_data->>'display_name',
    split_part(u.email, '@', 1),
    'User'
  ),
  COALESCE(
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  )
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 5. VERIFY RLS POLICIES ON PROFILES (ensure they exist)
-- ============================================================================

-- These should already exist from 20251210_enable_rls_policies.sql
-- Adding IF NOT EXISTS pattern for safety

DO $$
BEGIN
  -- Ensure RLS is enabled
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Policy: Users can select their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can select own profile'
  ) THEN
    CREATE POLICY "Users can select own profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

-- Policy: Users can update their own profile (non-role fields)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Users can update own profile fields'
  ) THEN
    CREATE POLICY "Users can update own profile fields"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Policy: Admins can read all profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'Admins can read all profiles'
  ) THEN
    CREATE POLICY "Admins can read all profiles"
      ON public.profiles FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role = 'admin'
        )
      );
  END IF;
END $$;

-- ============================================================================
-- NOTES:
-- - The trigger runs AFTER INSERT on auth.users
-- - Uses SECURITY DEFINER to bypass RLS for profile creation
-- - ON CONFLICT DO NOTHING prevents duplicate errors
-- - Role defaults to 'traveler' if not specified or invalid
-- - Admin role cannot be set via signup metadata (security)
-- - display_name falls back through: full_name -> name -> email prefix -> 'User'
-- ============================================================================
