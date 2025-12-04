-- Rainbow Tour Guides – Development seed: Countries & Cities
-- Run with: supabase db execute --file supabase/seeds/dev_countries_cities.sql

-- ============================================================================
-- COUNTRIES
-- ============================================================================
-- Insert countries first; skip if iso_code already exists.

INSERT INTO public.countries (name, iso_code)
VALUES
  ('Portugal', 'PT'),
  ('Spain', 'ES'),
  ('Brazil', 'BR'),
  ('Thailand', 'TH'),
  ('Vietnam', 'VN')
ON CONFLICT (iso_code) DO NOTHING;

-- ============================================================================
-- CITIES
-- ============================================================================
-- Insert LGBTQ+-friendly destinations with subquery lookups for country_id.
-- Conflict on slug to allow re-running safely.

INSERT INTO public.cities (country_id, name, slug, is_active, is_featured, hero_image_url)
VALUES
  (
    (SELECT id FROM public.countries WHERE iso_code = 'PT'),
    'Lisbon',
    'lisbon',
    true,
    true,  -- Featured: historic LGBTQ+ scene, Príncipe Real neighborhood
    null
  ),
  (
    (SELECT id FROM public.countries WHERE iso_code = 'ES'),
    'Barcelona',
    'barcelona',
    true,
    true,  -- Featured: Eixample "Gaixample" district, Pride events
    null
  ),
  (
    (SELECT id FROM public.countries WHERE iso_code = 'BR'),
    'Rio de Janeiro',
    'rio-de-janeiro',
    true,
    true,  -- Featured: largest Pride parade in the world
    null
  ),
  (
    (SELECT id FROM public.countries WHERE iso_code = 'TH'),
    'Bangkok',
    'bangkok',
    true,
    false, -- Active but not featured yet
    null
  ),
  (
    (SELECT id FROM public.countries WHERE iso_code = 'VN'),
    'Da Nang',
    'da-nang',
    true,
    false, -- Active but not featured yet
    null
  )
ON CONFLICT (slug) DO NOTHING;

