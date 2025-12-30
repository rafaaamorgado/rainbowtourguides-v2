-- Update city images
UPDATE public.cities SET hero_image_url = 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?q=80&w=2340&auto=format&fit=crop' WHERE slug = 'lisbon';
UPDATE public.cities SET hero_image_url = 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2340&auto=format&fit=crop' WHERE slug = 'barcelona';
UPDATE public.cities SET hero_image_url = 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?q=80&w=2340&auto=format&fit=crop' WHERE slug = 'rio-de-janeiro';
UPDATE public.cities SET hero_image_url = 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?q=80&w=2340&auto=format&fit=crop' WHERE slug = 'bangkok';
UPDATE public.cities SET hero_image_url = 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2340&auto=format&fit=crop' WHERE slug = 'da-nang';

-- Update guide profile avatars
UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1000&auto=format&fit=crop' WHERE id = '10000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop' WHERE id = '10000000-0000-0000-0000-000000000002';
UPDATE public.profiles SET avatar_url = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=1000&auto=format&fit=crop' WHERE id = '10000000-0000-0000-0000-000000000003';
