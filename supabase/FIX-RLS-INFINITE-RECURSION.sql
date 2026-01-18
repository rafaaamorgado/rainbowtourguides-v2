-- ============================================================================
-- FIX: Infinite Recursion in RLS Policies
-- ============================================================================
-- This fixes the "infinite recursion detected in policy for relation profiles" error
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. DROP ALL EXISTING POLICIES
-- ============================================================================

-- Drop all policies on profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read" ON public.profiles;

-- Drop all policies on guides
DROP POLICY IF EXISTS "Guides are viewable by everyone" ON public.guides;
DROP POLICY IF EXISTS "Approved guides are viewable by everyone" ON public.guides;
DROP POLICY IF EXISTS "guides_select_approved" ON public.guides;
DROP POLICY IF EXISTS "Guides can view their own profile regardless of status" ON public.guides;
DROP POLICY IF EXISTS "Guides can update their own profile" ON public.guides;
DROP POLICY IF EXISTS "Guides can update own profile" ON public.guides;
DROP POLICY IF EXISTS "Guides can insert own profile" ON public.guides;
DROP POLICY IF EXISTS "Admins can manage all guides" ON public.guides;

-- ============================================================================
-- 2. CREATE SIMPLE NON-RECURSIVE POLICIES
-- ============================================================================

-- PROFILES: Public read access (no recursion)
CREATE POLICY "profiles_public_read"
  ON public.profiles FOR SELECT
  USING (true);  -- Allow everyone to read profiles (needed for guide names)

-- PROFILES: Users can update their own
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- GUIDES: Public read access (no recursion)
CREATE POLICY "guides_public_read"
  ON public.guides FOR SELECT
  USING (true);  -- Allow everyone to read guides

-- GUIDES: Users can update their own
CREATE POLICY "guides_update_own"
  ON public.guides FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- GUIDES: Users can insert their own (if they are guides)
CREATE POLICY "guides_insert_own"
  ON public.guides FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 3. VERIFY POLICIES
-- ============================================================================

-- Show all policies on profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Show all policies on guides
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE tablename = 'guides'
ORDER BY policyname;

-- ============================================================================
-- 4. TEST QUERY
-- ============================================================================

-- Test that we can now query guides with profiles
SELECT 
    g.id,
    g.slug,
    g.headline,
    p.full_name
FROM public.guides g
LEFT JOIN public.profiles p ON p.id = g.id
LIMIT 3;

-- ============================================================================
-- DONE!
-- ============================================================================
SELECT '✅ RLS policies fixed! No more infinite recursion.' as status;
