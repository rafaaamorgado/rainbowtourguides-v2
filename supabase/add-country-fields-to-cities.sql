-- Add denormalized country fields to cities table
-- This allows faster queries without JOINs to countries table
-- Run this in Supabase SQL Editor if you get "country_name does not exist" errors

-- Add columns if they don't exist
ALTER TABLE public.cities
  ADD COLUMN IF NOT EXISTS country_code text,
  ADD COLUMN IF NOT EXISTS country_name text;

-- Backfill data from countries table
UPDATE public.cities c
SET 
  country_code = co.iso_code,
  country_name = co.name
FROM public.countries co
WHERE c.country_id = co.id
  AND (c.country_code IS NULL OR c.country_name IS NULL);

-- Verify the update
SELECT 
  id,
  name as city_name,
  country_name,
  country_code,
  is_active
FROM public.cities
ORDER BY name
LIMIT 10;

-- Count cities with country data
SELECT 
  COUNT(*) as total_cities,
  COUNT(country_name) as cities_with_country_name,
  COUNT(country_code) as cities_with_country_code
FROM public.cities;
