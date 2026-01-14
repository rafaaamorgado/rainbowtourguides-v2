-- Migration: Fix handle_new_user to write photo_url with safe idempotency

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_text text;
  role_enum public.profile_role;
  _full_name text;
BEGIN
  role_text := COALESCE(NEW.raw_user_meta_data->>'role', 'traveler');

  role_enum := CASE
    WHEN role_text IN ('traveler', 'guide', 'admin') THEN role_text::public.profile_role
    ELSE 'traveler'::public.profile_role
  END;

  _full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  INSERT INTO public.profiles (id, role, full_name, photo_url)
  VALUES (
    NEW.id,
    role_enum,
    _full_name,
    NULL
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    photo_url = COALESCE(public.profiles.photo_url, EXCLUDED.photo_url);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
