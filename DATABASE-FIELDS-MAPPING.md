# 📊 Database Fields Mapping

## Guides Table - Actual vs Schema

### ✅ Fields that EXIST in database:
- `id` - UUID (primary key)
- `city_id` - UUID (foreign key)
- `slug` - text (unique)
- `headline` - text (заголовок)
- `bio` - text (описание гида)
- `tagline` - text (слоган)
- `experience_tags` - text[] (теги опыта) ⭐
- `languages` - text[] (языки)
- `price_4h` - text/numeric (цена за 4 часа) ⭐
- `price_6h` - text/numeric (цена за 6 часов) ⭐
- `price_8h` - text/numeric (цена за 8 часов) ⭐
- `currency` - text (валюта)
- `status` - enum ('pending', 'approved', 'rejected')
- `approved` - boolean (legacy)
- `verification_status` - text
- `max_group_size` - integer
- `instant_book_enabled` - boolean
- `created_at` - timestamp
- `updated_at` - timestamp

### ❌ Fields that DO NOT EXIST (but are in schema.v2.sql):
- `about` - text (описание тура) - НЕ ИСПОЛЬЗУЕТСЯ
- `themes` - text[] - ЗАМЕНЕНО на `experience_tags`
- `is_verified` - boolean - ЗАМЕНЕНО на `verification_status`

### 🔄 Field Mappings:
| Schema Name | Actual DB Field | Notes |
|-------------|----------------|-------|
| `themes` | `experience_tags` | Tags для опыта гида |
| `about` | - | НЕ используется, используем только `bio` |
| `is_verified` | `verification_status` | Изменилось с boolean на enum |
| `base_price_4h` | `price_4h` | Без префикса "base_" ⭐ |
| `base_price_6h` | `price_6h` | Без префикса "base_" ⭐ |
| `base_price_8h` | `price_8h` | Без префикса "base_" ⭐ |

## Cities Table

### ✅ Fields that EXIST:
- `id` - UUID
- `name` - text
- `slug` - text
- `country_id` - UUID (foreign key to countries)
- `is_active` - boolean
- `is_featured` - boolean
- `hero_image_url` - text

### ⚠️ Optional denormalized fields (may not exist):
- `country_name` - text (заполняется из countries.name)
- `country_code` - text (заполняется из countries.iso_code)

**Решение:** Всегда делать JOIN с таблицей `countries` вместо использования денормализованных полей.

## Profiles Table

### ✅ Fields that EXIST:
- `id` - UUID (primary key, FK to auth.users)
- `full_name` - text
- `avatar_url` - text
- `role` - enum ('traveler', 'guide', 'admin')
- `home_city_id` - UUID
- `bio` - text
- `languages` - text[]
- `created_at` - timestamp
- `updated_at` - timestamp

## Summary

### Когда делать запросы:

**✅ ПРАВИЛЬНО:**
```sql
SELECT 
  id,
  slug,
  headline,
  bio,                  -- ✅ используем
  experience_tags,      -- ✅ используем
  price_4h,             -- ✅ без префикса "base_"
  price_6h,             -- ✅ без префикса "base_"
  price_8h,             -- ✅ без префикса "base_"
  currency,
  status,
  city:cities(
    name,
    slug,
    country:countries(  -- ✅ JOIN для получения страны
      name
    )
  )
FROM guides
```

**❌ НЕПРАВИЛЬНО:**
```sql
SELECT 
  id,
  about,              -- ❌ не существует
  themes,             -- ❌ используйте experience_tags
  base_price_4h,      -- ❌ используйте price_4h
  base_price_6h,      -- ❌ используйте price_6h
  base_price_8h,      -- ❌ используйте price_8h
  city:cities(
    country_name      -- ❌ может не существовать, используйте JOIN
  )
FROM guides
```

## Migration Status

Файл `supabase/FIX-ALL-SCHEMA-ISSUES.sql` содержит все необходимые исправления:
- ✅ Добавляет отсутствующие колонки
- ✅ Генерирует slug для всех гидов
- ✅ Исправляет RLS политики
- ✅ Использует правильные имена полей (`experience_tags` вместо `themes`)

**Запустить:** В Supabase SQL Editor скопировать и выполнить весь файл.
