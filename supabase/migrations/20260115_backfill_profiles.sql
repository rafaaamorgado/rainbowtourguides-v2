-- Backfill profiles for existing users who might be missing them
DO $$
DECLARE
  user_record record;
BEGIN
  FOR user_record IN SELECT * FROM auth.users LOOP
    INSERT INTO public.profiles (id, role, full_name, avatar_url)
    VALUES (
      user_record.id,
      COALESCE((user_record.raw_user_meta_data->>'role')::profile_role, 'traveler'::profile_role),
      COALESCE(
        user_record.raw_user_meta_data->>'full_name', 
        user_record.raw_user_meta_data->>'name', 
        split_part(user_record.email, '@', 1)
      ),
      COALESCE(
        user_record.raw_user_meta_data->>'avatar_url', 
        user_record.raw_user_meta_data->>'picture', 
        NULL
      )
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
END;
$$;
