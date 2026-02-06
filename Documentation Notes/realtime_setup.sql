-- =====================================================
-- Supabase Realtime Setup & Verification
-- =====================================================
-- This script verifies and configures realtime for the chat system
-- Run these queries in the Supabase SQL Editor

-- =====================================================
-- STEP 1: Verify Publication Exists
-- =====================================================

-- Check if supabase_realtime publication exists
SELECT 
  pubname,
  pubowner::regrole AS owner,
  puballtables,
  pubinsert,
  pubupdate,
  pubdelete
FROM pg_publication
WHERE pubname = 'supabase_realtime';

-- Expected output: One row with pubname = 'supabase_realtime'
-- If no rows returned, the publication doesn't exist (should be created by default)

-- =====================================================
-- STEP 2: Verify Tables in Publication
-- =====================================================

-- Check which tables are currently in the publication
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
ORDER BY schemaname, tablename;

-- Expected output: Should include 'messages' and 'bookings'

-- =====================================================
-- STEP 3: Add Tables to Publication (if missing)
-- =====================================================

-- Add messages table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Add bookings table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Note: If you get "relation already added" error, that's fine - it means
-- the table was already in the publication

-- =====================================================
-- STEP 4: Verify Tables Were Added
-- =====================================================

-- Verify both tables are now in publication
SELECT 
  schemaname,
  tablename,
  'in_publication' AS status
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('messages', 'bookings')
ORDER BY tablename;

-- Expected output:
--  schemaname | tablename |     status      
-- ------------+-----------+-----------------
--  public     | bookings  | in_publication
--  public     | messages  | in_publication

-- =====================================================
-- STEP 5: Verify RLS Policies
-- =====================================================

-- Check RLS is enabled on messages table
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'messages'
  AND schemaname = 'public';

-- Expected: rls_enabled = true

-- Check RLS is enabled on bookings table
SELECT 
  schemaname,
  tablename,
  rowsecurity AS rls_enabled
FROM pg_tables
WHERE tablename = 'bookings'
  AND schemaname = 'public';

-- Expected: rls_enabled = true

-- List all RLS policies on messages
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS command,
  qual AS using_expression,
  with_check AS check_expression
FROM pg_policies
WHERE tablename = 'messages'
ORDER BY policyname;

-- Expected policies:
-- - messages_participants_read (SELECT)
-- - messages_participants_send (INSERT)

-- List all RLS policies on bookings
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd AS command
FROM pg_policies
WHERE tablename = 'bookings'
ORDER BY policyname;

-- Expected policies:
-- - bookings_participants_read (SELECT)
-- - bookings_traveler_update_own (UPDATE)
-- - bookings_guide_update_assigned (UPDATE)
-- - etc.

-- =====================================================
-- STEP 6: Test Realtime Configuration
-- =====================================================

-- Check if tables have proper permissions
SELECT 
  grantee,
  table_schema,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_name IN ('messages', 'bookings')
  AND table_schema = 'public'
ORDER BY table_name, grantee, privilege_type;

-- =====================================================
-- STEP 7: Monitor Realtime Connections (Optional)
-- =====================================================

-- Check active Supabase Realtime connections
-- Note: This requires pg_stat_statements extension
-- SELECT
--   datname,
--   usename,
--   application_name,
--   state,
--   query
-- FROM pg_stat_activity
-- WHERE application_name LIKE '%realtime%';

-- =====================================================
-- VERIFICATION CHECKLIST
-- =====================================================

-- Run this query to get a complete status report
WITH publication_check AS (
  SELECT 
    EXISTS(
      SELECT 1 FROM pg_publication 
      WHERE pubname = 'supabase_realtime'
    ) AS publication_exists
),
messages_check AS (
  SELECT 
    EXISTS(
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
        AND tablename = 'messages'
    ) AS messages_in_publication
),
bookings_check AS (
  SELECT 
    EXISTS(
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
        AND tablename = 'bookings'
    ) AS bookings_in_publication
),
messages_rls AS (
  SELECT rowsecurity AS messages_rls_enabled
  FROM pg_tables
  WHERE tablename = 'messages' AND schemaname = 'public'
),
bookings_rls AS (
  SELECT rowsecurity AS bookings_rls_enabled
  FROM pg_tables
  WHERE tablename = 'bookings' AND schemaname = 'public'
)
SELECT 
  p.publication_exists AS "✓ Publication Exists",
  m.messages_in_publication AS "✓ Messages Published",
  b.bookings_in_publication AS "✓ Bookings Published",
  mr.messages_rls_enabled AS "✓ Messages RLS",
  br.bookings_rls_enabled AS "✓ Bookings RLS"
FROM publication_check p
CROSS JOIN messages_check m
CROSS JOIN bookings_check b
CROSS JOIN messages_rls mr
CROSS JOIN bookings_rls br;

-- Expected output: All columns should show 'true'
-- ✓ Publication Exists | ✓ Messages Published | ✓ Bookings Published | ✓ Messages RLS | ✓ Bookings RLS
-- ---------------------+----------------------+----------------------+----------------+----------------
-- true                 | true                 | true                 | true           | true

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

-- If tables are not in publication, you can remove and re-add them:
-- ALTER PUBLICATION supabase_realtime DROP TABLE public.messages;
-- ALTER PUBLICATION supabase_realtime DROP TABLE public.bookings;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- If RLS is not enabled, enable it:
-- ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- NOTES
-- =====================================================

-- 1. Realtime only broadcasts changes that the authenticated user
--    has permission to see (via RLS policies)

-- 2. Changes are broadcast for:
--    - INSERT events on messages
--    - UPDATE events on bookings

-- 3. Users will only receive events for:
--    - Messages in bookings where they are traveler or guide
--    - Bookings where they are traveler or guide

-- 4. No service role required on client - RLS handles all security

-- 5. Realtime subscriptions automatically reconnect on disconnect

-- =====================================================
-- END OF SCRIPT
-- =====================================================
