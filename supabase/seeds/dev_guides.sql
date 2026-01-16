-- Rainbow Tour Guides – Development seed: Test Guides
-- Run with: supabase db execute --file supabase/seeds/dev_guides.sql

-- First, create test profiles for guides (using fixed UUIDs for dev)
-- Note: In production, these would come from real Supabase Auth users

-- Create a test traveler profile (for testing bookings)
INSERT INTO public.profiles (id, role, full_name, avatar_url)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'traveler', 'Test Traveler', null)
ON CONFLICT (id) DO NOTHING;

-- Create test guide profiles
INSERT INTO public.profiles (id, role, full_name, avatar_url)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'guide', 'Maria Silva', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop'),
  ('10000000-0000-0000-0000-000000000002', 'guide', 'João Santos', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop'),
  ('10000000-0000-0000-0000-000000000003', 'guide', 'Alex Chen', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Create guide profiles with detailed information
INSERT INTO public.guides (
  id,
  city_id,
  slug,
  headline,
  about,
  languages,
  themes,
  hourly_rate,
  currency,
  status
)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    (SELECT id FROM public.cities WHERE slug = 'lisbon'),
    'lisbon-maria-silva',
    'Your friendly local guide to Lisbon''s LGBTQ+ scene',
    'Hi! I''m Maria, a proud lesbian and lifelong Lisbon resident. I''ve been part of the LGBTQ+ community here for over 10 years and love showing visitors the best queer-friendly spots in the city. From historic Príncipe Real to the vibrant nightlife of Bairro Alto, I''ll help you discover the authentic side of Lisbon while ensuring you feel safe and welcomed.',
    ARRAY['English', 'Portuguese', 'Spanish'],
    ARRAY['nightlife', 'culture', 'food-and-drink', 'history'],
    '45.00',
    'EUR',
    'approved'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    (SELECT id FROM public.cities WHERE slug = 'barcelona'),
    'barcelona-joao-santos',
    'Exploring Barcelona''s queer culture and history',
    'Olá! I''m João, originally from Porto but living in Barcelona for the past 5 years. As a gay man deeply involved in the local LGBTQ+ community, I can show you the best of Gaixample (Barcelona''s gay district), introduce you to amazing queer artists, and share the rich history of LGBTQ+ activism in Catalonia. Let''s explore this beautiful city together!',
    ARRAY['English', 'Portuguese', 'Spanish', 'Catalan'],
    ARRAY['culture', 'history', 'nightlife', 'art'],
    '50.00',
    'EUR',
    'approved'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    (SELECT id FROM public.cities WHERE slug = 'bangkok'),
    'bangkok-alex-chen',
    'Your guide to Bangkok''s vibrant LGBTQ+ community',
    'Sawasdee! I''m Alex, a non-binary guide who has called Bangkok home for 8 years. I''m passionate about showing visitors the incredible diversity of Bangkok''s queer scene, from the famous Silom area to hidden gems only locals know about. I''ll also share insights into Thai LGBTQ+ culture and make sure you have an unforgettable, authentic experience.',
    ARRAY['English', 'Thai', 'Mandarin'],
    ARRAY['nightlife', 'food-and-drink', 'shopping', 'culture'],
    '35.00',
    'USD',
    'approved'
  )
ON CONFLICT (id) DO NOTHING;
