-- ============================================================================
-- APPROVE GUIDE - Одобрить гида и сделать его видимым на сайте
-- ============================================================================

-- ВАРИАНТ 1: Одобрить КОНКРЕТНОГО гида по email
-- Замените 'guide@gmail.com' на email вашего гида

UPDATE public.guides g
SET 
  status = 'approved',
  approved = true,
  updated_at = NOW()
FROM public.profiles p
WHERE g.id = p.id
  AND p.full_name = 'guide@gmail.com'  -- ← ЗАМЕНИТЕ НА EMAIL ГИДА
  AND g.status != 'approved';

-- Проверить что гид одобрен
SELECT 
  p.id,
  p.full_name as email,
  g.status,
  g.approved,
  g.city_id,
  g.headline,
  g.bio
FROM public.guides g
JOIN public.profiles p ON g.id = p.id
WHERE p.full_name = 'guide@gmail.com';  -- ← ЗАМЕНИТЕ НА EMAIL ГИДА


-- ============================================================================
-- ВАРИАНТ 2: Одобрить ВСЕХ гидов в статусе 'pending' или 'draft'
-- ============================================================================

-- ОСТОРОЖНО: Это одобрит ВСЕХ гидов!
-- Раскомментируйте только если уверены:

/*
UPDATE public.guides
SET 
  status = 'approved',
  approved = true,
  updated_at = NOW()
WHERE status IN ('pending', 'draft');

SELECT COUNT(*) as approved_guides FROM public.guides WHERE status = 'approved';
*/


-- ============================================================================
-- ВАРИАНТ 3: Одобрить гида по USER ID
-- ============================================================================

-- Замените 'YOUR-USER-ID' на ID вашего гида:

/*
UPDATE public.guides
SET 
  status = 'approved',
  approved = true,
  updated_at = NOW()
WHERE id = 'YOUR-USER-ID'  -- ← ЗАМЕНИТЕ НА UUID ГИДА
  AND status != 'approved';

SELECT * FROM public.guides WHERE id = 'YOUR-USER-ID';
*/


-- ============================================================================
-- ПРОВЕРКА: Посмотреть всех одобренных гидов
-- ============================================================================

SELECT 
  p.id,
  p.full_name,
  p.role,
  g.status,
  g.approved,
  g.headline,
  c.name as city_name,
  g.base_price_4h,
  g.currency,
  array_length(g.experience_tags, 1) as tags_count,
  array_length(g.languages, 1) as languages_count
FROM public.guides g
JOIN public.profiles p ON g.id = p.id
LEFT JOIN public.cities c ON g.city_id = c.id
WHERE g.status = 'approved' OR g.approved = true
ORDER BY g.created_at DESC;


-- ============================================================================
-- ПОЛЕЗНЫЕ ЗАПРОСЫ
-- ============================================================================

-- Посмотреть ВСЕХ гидов по статусам:
SELECT 
  status,
  approved,
  COUNT(*) as count
FROM public.guides
GROUP BY status, approved
ORDER BY status;

-- Найти гида по email:
SELECT 
  p.id,
  p.full_name,
  p.role,
  g.status,
  g.approved,
  g.created_at
FROM public.profiles p
LEFT JOIN public.guides g ON p.id = g.id
WHERE p.full_name LIKE '%@%'  -- все email
  AND p.role = 'guide'
ORDER BY p.created_at DESC;
