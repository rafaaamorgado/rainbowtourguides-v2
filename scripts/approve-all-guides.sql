-- Approve all pending guides
-- This is a one-time script to approve existing guides in the database
-- Run this in Supabase SQL Editor

UPDATE public.guides
SET status = 'approved'
WHERE status = 'pending';

-- Verify the update
SELECT 
  g.id,
  p.full_name,
  c.name as city_name,
  g.status
FROM public.guides g
LEFT JOIN public.profiles p ON p.id = g.id
LEFT JOIN public.cities c ON c.id = g.city_id
ORDER BY c.name, p.full_name;
