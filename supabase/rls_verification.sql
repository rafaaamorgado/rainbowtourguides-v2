-- Helper to create a test user interaction
-- This script is descriptive for manual verification in Supabase SQL editor

-- 1. Create a test traveler and guide
-- (Requires creating auth users first, which is hard in plain SQL script without extension support)

-- Verification Steps for User:
-- 1. Run the migration.
-- 2. As an anon user:
--    SELECT * FROM profiles; (Should see all)
--    SELECT * FROM bookings; (Should see 0 rows)
--    SELECT * FROM messages; (Should see 0 rows)
-- 3. As a logged in user (id='...'):
--    SELECT * FROM profiles WHERE id = '...'; (Should see own)
--    UPDATE profiles SET display_name = 'Test' WHERE id = '...'; (Should work)
--    UPDATE profiles SET display_name = 'Hacker' WHERE id = 'other_id'; (Should fail/affect 0 rows)
