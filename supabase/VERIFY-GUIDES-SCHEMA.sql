-- ============================================================================
-- VERIFY GUIDES TABLE SCHEMA
-- ============================================================================
-- Run this to see what columns actually exist in your guides table
-- Compare with your actual data structure

-- Show all columns in guides table
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'guides'
ORDER BY ordinal_position;

-- Count guides by status
SELECT 
    status,
    COUNT(*) as count
FROM public.guides
GROUP BY status
ORDER BY status;

-- Show sample guide data with all price fields
SELECT 
    id,
    slug,
    headline,
    bio,
    
    -- Check which price fields exist
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guides' AND column_name = 'price_4h'
    ) THEN 'price_4h exists' ELSE 'price_4h MISSING' END as price_4h_check,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guides' AND column_name = 'base_price_4h'
    ) THEN 'base_price_4h exists' ELSE 'base_price_4h MISSING' END as base_price_4h_check,
    
    currency,
    status,
    created_at
FROM public.guides
LIMIT 1;

-- Check for experience_tags vs themes
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guides' AND column_name = 'experience_tags'
    ) THEN '✅ experience_tags exists' ELSE '❌ experience_tags MISSING' END as tags_check,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guides' AND column_name = 'themes'
    ) THEN 'themes exists (schema field)' ELSE 'themes MISSING' END as themes_check;
