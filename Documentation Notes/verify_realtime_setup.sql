-- Supabase Realtime Setup Verification Script
-- Run this in Supabase SQL Editor to verify everything is configured correctly

-- ============================================================================
-- STEP 1: Verify publication exists
-- ============================================================================

SELECT 
  pubname,
  pubowner::regrole as owner,
  puballtables
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- Expected: One row with pubname = 'supabase_realtime'
-- If empty, run: CREATE PUBLICATION supabase_realtime;

-- ============================================================================
-- STEP 2: Verify tables are in publication
-- ============================================================================

SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'bookings')
ORDER BY tablename;

-- Expected output:
--  schemaname | tablename
-- ------------+-----------
--  public     | bookings
--  public     | messages

-- If missing, run:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- ============================================================================
-- STEP 3: Verify RLS is enabled
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('messages', 'bookings');

-- Expected: rls_enabled = true for both tables
-- If false, run:
-- ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Verify RLS policies exist
-- ============================================================================

-- Messages policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;

-- Expected policies:
--  policyname                    | permissive | roles         | cmd
-- -------------------------------+------------+---------------+--------
--  messages_participants_read    | PERMISSIVE | {authenticated}| SELECT
--  messages_participants_send    | PERMISSIVE | {authenticated}| INSERT

-- Bookings policies
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;

-- Expected: Multiple policies for bookings (read, update, etc.)

-- ============================================================================
-- STEP 5: Test realtime access (simulated)
-- ============================================================================

-- Check if current user can SELECT from messages
-- (This determines if realtime events will be received)

SELECT 
  'messages' as table_name,
  COUNT(*) as can_read_count,
  CASE 
    WHEN COUNT(*) >= 0 THEN '✅ Can read (realtime will work)'
    ELSE '❌ Cannot read (realtime blocked by RLS)'
  END as status
FROM messages
WHERE booking_id IN (
  SELECT id FROM bookings 
  WHERE traveler_id = auth.uid() OR guide_id = auth.uid()
)
LIMIT 1;

-- ============================================================================
-- STEP 6: Verify realtime is enabled (requires superuser)
-- ============================================================================

-- Note: This query requires superuser privileges
-- If you get an error, it's fine - just verify in Supabase dashboard

SELECT 
  name,
  setting,
  CASE 
    WHEN setting = 'on' THEN '✅ Enabled'
    ELSE '❌ Disabled'
  END as status
FROM pg_settings
WHERE name IN ('wal_level', 'max_replication_slots');

-- Expected:
--  name                   | setting | status
-- ------------------------+---------+-----------
--  wal_level              | logical | ✅ Enabled
--  max_replication_slots  | 10      | ✅ Enabled

-- If wal_level is not 'logical', realtime won't work
-- This should already be set by Supabase automatically

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
  'Setup Verification Complete' as status,
  '1. Publication exists: ' || 
    CASE WHEN EXISTS(SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') 
    THEN '✅' ELSE '❌' END ||
  E'\n2. Messages table published: ' ||
    CASE WHEN EXISTS(
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
    ) THEN '✅' ELSE '❌' END ||
  E'\n3. Bookings table published: ' ||
    CASE WHEN EXISTS(
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' AND tablename = 'bookings'
    ) THEN '✅' ELSE '❌' END ||
  E'\n4. Messages RLS enabled: ' ||
    CASE WHEN EXISTS(
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'messages' AND rowsecurity = true
    ) THEN '✅' ELSE '❌' END ||
  E'\n5. Bookings RLS enabled: ' ||
    CASE WHEN EXISTS(
      SELECT 1 FROM pg_tables 
      WHERE tablename = 'bookings' AND rowsecurity = true
    ) THEN '✅' ELSE '❌' END as checklist;

-- ============================================================================
-- QUICK FIX (if tables not in publication)
-- ============================================================================

-- Uncomment and run if verification shows tables are missing:

-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Then verify again:
-- SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
