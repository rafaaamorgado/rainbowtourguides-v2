-- Quick approve all pending guides
-- Copy and paste this into Supabase SQL Editor

UPDATE public.guides
SET status = 'approved'
WHERE status = 'pending';

-- Verify the result
SELECT 
  c.name as city_name,
  co.name as country_name,
  COUNT(g.id) as guides_count
FROM public.cities c
LEFT JOIN public.countries co ON co.id = c.country_id
LEFT JOIN public.guides g ON g.city_id = c.id AND g.status = 'approved'
WHERE c.is_active = true
GROUP BY c.name, co.name
ORDER BY guides_count DESC, c.name;
