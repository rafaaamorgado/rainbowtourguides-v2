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
    'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?q=80&w=2340&auto=format&fit=crop'
  ),
  (
    (SELECT id FROM public.countries WHERE iso_code = 'ES'),
    'Barcelona',
    'barcelona',
    true,
    true,  -- Featured: Eixample "Gaixample" district, Pride events
    'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2340&auto=format&fit=crop'
  ),
  (
    (SELECT id FROM public.countries WHERE iso_code = 'BR'),
    'Rio de Janeiro',
    'rio-de-janeiro',
    true,
    true,  -- Featured: largest Pride parade in the world
    'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=2340&auto=format&fit=crop'
  ),
  (
    (SELECT id FROM public.countries WHERE iso_code = 'TH'),
    'Bangkok',
    'bangkok',
    true,
    false, -- Active but not featured yet
    'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=2340&auto=format&fit=crop'
  ),
  (
    (SELECT id FROM public.countries WHERE iso_code = 'VN'),
    'Da Nang',
    'da-nang',
    true,
    false, -- Active but not featured yet
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2340&auto=format&fit=crop'
  )
ON CONFLICT (slug) DO NOTHING;

