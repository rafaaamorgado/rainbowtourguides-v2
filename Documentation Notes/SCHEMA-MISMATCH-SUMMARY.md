# 🔍 Schema Mismatch Summary

## Проблема
Файл `supabase/schema.v2.sql` НЕ соответствует реальной структуре базы данных.

## Реальная структура (из ваших данных)

### ✅ Поля, которые РЕАЛЬНО существуют в БД:

```json
{
  "guide_id": "uuid",
  "full_name": "text",
  "pronouns": "text",
  "languages": "text[]",
  "country_of_origin": "text",
  "city_name": "text",
  "country_name": "text",
  "headline": "text",
  "bio": "text",
  "experience_tags": "text[]",    // ⭐ НЕ themes!
  "price_4h": "text",              // ⭐ НЕ base_price_4h!
  "price_6h": "text",              // ⭐ НЕ base_price_6h!
  "price_8h": "text",              // ⭐ НЕ base_price_8h!
  "currency": "text",
  "max_group_size": "integer",
  "instant_book_enabled": "boolean",
  "approved": "boolean",
  "verification_status": "text",
  "created_at": "timestamp"
}
```

## Schema.v2.sql (устаревший)

```sql
create table if not exists public.guides (
  id uuid primary key,
  city_id uuid not null,
  tagline text,
  bio text,
  headline text,
  about text,                    -- ❌ НЕ используется
  languages text[],
  themes text[],                 -- ❌ должно быть experience_tags
  is_verified boolean,
  base_price_4h numeric(10, 2),  -- ❌ должно быть price_4h
  base_price_6h numeric(10, 2),  -- ❌ должно быть price_6h
  base_price_8h numeric(10, 2),  -- ❌ должно быть price_8h
  hourly_rate numeric(10, 2),
  currency char(3),
  status guide_status,
  slug text,
  created_at timestamptz,
  updated_at timestamptz
);
```

## Критические различия

| Schema.v2.sql | Реальная БД | Статус |
|---------------|-------------|--------|
| `themes` | `experience_tags` | ❌ РАЗНЫЕ ИМЕНА |
| `base_price_4h` | `price_4h` | ❌ РАЗНЫЕ ИМЕНА |
| `base_price_6h` | `price_6h` | ❌ РАЗНЫЕ ИМЕНА |
| `base_price_8h` | `price_8h` | ❌ РАЗНЫЕ ИМЕНА |
| `about` | - | ❌ НЕ используется |
| `is_verified` | `verification_status` | ❌ РАЗНЫЕ ТИПЫ |

## Что делать?

### Вариант 1: Использовать реальную структуру (РЕКОМЕНДУЕТСЯ)
Код уже обновлен для работы с реальной структурой:
- ✅ `experience_tags` вместо `themes`
- ✅ `price_4h/6h/8h` вместо `base_price_4h/6h/8h`
- ✅ `bio` без `about`

### Вариант 2: Обновить БД под schema.v2.sql
Не рекомендуется, так как:
- Нужно переименовывать колонки
- Нужно мигрировать данные
- Может сломать существующий код

## Исправленные файлы

1. ✅ `app/guides/[slug]/page.tsx` - использует правильные имена полей
2. ✅ `DATABASE-FIELDS-MAPPING.md` - документация с правильными полями
3. ✅ `VERIFY-GUIDES-SCHEMA.sql` - скрипт для проверки структуры

## Проверка

Запустите в Supabase SQL Editor:

```sql
-- Проверить какие поля реально существуют
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'guides'
  AND column_name IN (
    'themes', 'experience_tags',
    'base_price_4h', 'price_4h',
    'about', 'bio'
  )
ORDER BY column_name;
```

## Итог

**Используйте эти имена полей:**
- ✅ `experience_tags` (не themes)
- ✅ `price_4h`, `price_6h`, `price_8h` (без префикса base_)
- ✅ `bio` (не about)
- ✅ `verification_status` (не is_verified)

**Игнорируйте schema.v2.sql** - он не соответствует реальности!
