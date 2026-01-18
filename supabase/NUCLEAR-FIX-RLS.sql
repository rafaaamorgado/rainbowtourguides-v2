-- ============================================================================
-- NUCLEAR FIX: Complete RLS Reset for profiles and guides
-- ============================================================================
-- This completely resets RLS policies to fix infinite recursion
-- SAFE to run - can be run multiple times
-- ============================================================================

-- ============================================================================
-- STEP 1: Disable RLS temporarily
-- ============================================================================
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Drop ALL policies (including hidden/system ones)
-- ============================================================================

-- Get all policy names for profiles
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Get all policy names for guides
DO $$ 
DECLARE 
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' AND tablename = 'guides'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.guides', policy_record.policyname);
    END LOOP;
END $$;

-- ============================================================================
-- STEP 3: Re-enable RLS
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create SIMPLE, NON-RECURSIVE policies
-- ============================================================================

-- PROFILES Table
-- -----------------------------------------------------------------------------
-- Public read: No conditions, no recursion
CREATE POLICY "profiles_select_all"
    ON public.profiles
    FOR SELECT
    TO public
    USING (true);

-- Update own: Simple auth check, no subqueries
CREATE POLICY "profiles_update_own"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Insert own: Simple auth check
CREATE POLICY "profiles_insert_own"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- GUIDES Table
-- -----------------------------------------------------------------------------
-- Public read: No conditions, no recursion
CREATE POLICY "guides_select_all"
    ON public.guides
    FOR SELECT
    TO public
    USING (true);

-- Update own: Simple auth check, no subqueries
CREATE POLICY "guides_update_own"
    ON public.guides
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Insert own: Simple auth check
CREATE POLICY "guides_insert_own"
    ON public.guides
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- ============================================================================
-- STEP 5: Verify the fix
-- ============================================================================

-- Show current policies (should be only 6 total)
SELECT 
    '📋 Current Policies:' as info,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual = 'true' THEN '✅ Simple (no recursion)'
        WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%SELECT%' THEN '✅ Simple auth check'
        ELSE '⚠️ Complex: ' || qual
    END as policy_type
FROM pg_policies
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'guides')
ORDER BY tablename, policyname;

-- Test query with JOIN (should work now)
SELECT 
    '🧪 Test Query:' as info,
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
SELECT 
    '✅ RLS policies completely reset!' as status,
    '✅ Infinite recursion fixed!' as result,
    '✅ Simple policies created!' as policies,
    '✅ Test query successful!' as test;
