-- ============================================================================
-- COMPLETE GUIDES TABLE FIX
-- Добавляет ВСЕ недостающие поля для онбординга
-- ============================================================================

-- 1. Создать enum для статуса (если не существует)
DO $$ BEGIN
    CREATE TYPE public.guide_status AS ENUM ('draft', 'pending', 'approved', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN 
        -- Если enum уже существует, попробуем добавить 'draft'
        ALTER TYPE public.guide_status ADD VALUE IF NOT EXISTS 'draft';
END $$;

-- 2. Добавить ВСЕ поля которые могут отсутствовать
ALTER TABLE public.guides
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS about TEXT,
  ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS themes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS experience_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS base_price_4h NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS base_price_6h NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS base_price_8h NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS currency CHAR(3) DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS available_days TEXT[],
  ADD COLUMN IF NOT EXISTS typical_start_time TIME,
  ADD COLUMN IF NOT EXISTS typical_end_time TIME,
  ADD COLUMN IF NOT EXISTS lgbtq_alignment JSONB;

-- 3. Добавить status колонку с правильным типом (если не существует)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'guides' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.guides ADD COLUMN status public.guide_status NOT NULL DEFAULT 'pending';
  END IF;
END $$;

-- 4. Создать индексы (если не существуют)
CREATE INDEX IF NOT EXISTS guides_city_id_idx ON public.guides(city_id);
CREATE INDEX IF NOT EXISTS guides_is_verified_idx ON public.guides(is_verified);
CREATE INDEX IF NOT EXISTS guides_approved_idx ON public.guides(approved);
CREATE INDEX IF NOT EXISTS guides_status_idx ON public.guides(status);
CREATE UNIQUE INDEX IF NOT EXISTS guides_slug_unique_idx ON public.guides(slug) WHERE slug IS NOT NULL;

-- 5. Комментарии к колонкам
COMMENT ON COLUMN public.guides.tagline IS 'Short headline (deprecated, use headline)';
COMMENT ON COLUMN public.guides.bio IS 'Short bio about the guide';
COMMENT ON COLUMN public.guides.headline IS 'Tour headline';
COMMENT ON COLUMN public.guides.about IS 'Detailed tour description';
COMMENT ON COLUMN public.guides.experience_tags IS 'Guide specialties/experience tags';
COMMENT ON COLUMN public.guides.themes IS 'Tour themes (legacy)';
COMMENT ON COLUMN public.guides.available_days IS 'Days of week guide is available';
COMMENT ON COLUMN public.guides.typical_start_time IS 'Typical tour start time';
COMMENT ON COLUMN public.guides.typical_end_time IS 'Typical tour end time';
COMMENT ON COLUMN public.guides.lgbtq_alignment IS 'LGBTQ+ alignment responses (JSON)';
COMMENT ON COLUMN public.guides.approved IS 'Admin approval status (boolean)';
COMMENT ON COLUMN public.guides.status IS 'Guide status (enum: draft, pending, approved, rejected)';

-- 6. Вывести структуру таблицы
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'guides'
ORDER BY ordinal_position;

-- 7. Проверка всех важных полей
DO $$ 
DECLARE
  missing_fields TEXT[] := '{}';
  field TEXT;
BEGIN
  -- Проверяем каждое поле
  FOR field IN 
    SELECT unnest(ARRAY['tagline', 'bio', 'headline', 'about', 'languages', 'themes', 
                        'experience_tags', 'base_price_4h', 'base_price_6h', 'base_price_8h',
                        'currency', 'available_days', 'typical_start_time', 'typical_end_time',
                        'lgbtq_alignment', 'approved', 'status'])
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'guides' 
      AND column_name = field
    ) THEN
      missing_fields := array_append(missing_fields, field);
    END IF;
  END LOOP;
  
  IF array_length(missing_fields, 1) > 0 THEN
    RAISE WARNING 'Missing fields: %', array_to_string(missing_fields, ', ');
  ELSE
    RAISE NOTICE '✅ All required fields exist in guides table!';
  END IF;
END $$;
