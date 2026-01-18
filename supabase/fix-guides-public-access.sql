-- Fix guides RLS policies for public access
-- This allows unauthenticated users to view approved guides

-- Drop old restrictive policy if it exists
DROP POLICY IF EXISTS "Approved guides are viewable by everyone" ON public.guides;

-- Ensure the new public read policy exists
DO $$ 
BEGIN
    -- Check if policy already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'guides' 
        AND policyname = 'Guides are viewable by everyone'
    ) THEN
        CREATE POLICY "Guides are viewable by everyone"
            ON public.guides FOR SELECT
            USING (true);
    END IF;
END $$;

-- Verify the change
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'guides'
ORDER BY policyname;
