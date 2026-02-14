-- Add contact columns for request-only booking communication.
ALTER TABLE public.guides
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS messaging_apps TEXT[];

-- Backfill phone from the legacy phone_number column.
UPDATE public.guides
SET phone = phone_number
WHERE phone IS NULL
  AND phone_number IS NOT NULL;

-- Backfill messaging app preferences from legacy social fields.
UPDATE public.guides
SET messaging_apps = ARRAY_REMOVE(
  ARRAY[
    CASE
      WHEN COALESCE(TRIM(social_whatsapp), '') <> '' THEN 'WhatsApp'
      ELSE NULL
    END,
    CASE
      WHEN COALESCE(TRIM(social_zalo), '') <> '' THEN 'Zalo'
      ELSE NULL
    END,
    CASE
      WHEN COALESCE(TRIM(social_telegram), '') <> '' THEN 'Telegram'
      ELSE NULL
    END
  ],
  NULL
)
WHERE messaging_apps IS NULL;

-- Keep empty arrays as NULL to match existing nullable semantics.
UPDATE public.guides
SET messaging_apps = NULL
WHERE messaging_apps = '{}';

COMMENT ON COLUMN public.guides.phone
  IS 'Guide phone number for private booking coordination.';
COMMENT ON COLUMN public.guides.messaging_apps
  IS 'Preferred messaging apps for private booking coordination (e.g. WhatsApp, Zalo).';
