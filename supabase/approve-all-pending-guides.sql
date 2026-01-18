-- Approve all pending guides to make them visible on public pages
-- Run this in Supabase SQL Editor

-- Update all pending guides to approved
UPDATE public.guides
SET status = 'approved'
WHERE status = 'pending';

-- Verify the results
SELECT 
  g.id,
  p.full_name as guide_name,
  c.name as city_name,
  g.status,
  g.created_at
FROM public.guides g
LEFT JOIN public.profiles p ON p.id = g.id
LEFT JOIN public.cities c ON c.id = g.city_id
ORDER BY c.name, p.full_name;

-- Count guides by status
SELECT 
  status,
  COUNT(*) as count
FROM public.guides
GROUP BY status
ORDER BY status;
