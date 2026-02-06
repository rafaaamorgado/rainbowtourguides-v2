# Guide Onboarding - Исправления

## ✅ Что исправлено:

### 1. **Онбординг теперь корректно сохраняет данные в БД**
- ✅ Все поля правильно маппятся
- ✅ Добавлено детальное логирование
- ✅ Обновляется `profile.full_name` если задано display_name
- ✅ Создается запись в таблице `guides`
- ✅ После сабмита редирект на `/guide/dashboard`

### 2. **UI для фотографий**
- ✅ Показывается плейсхолдер с инициалами
- ✅ Есть пометка "Photo upload coming soon"
- ✅ Не ломает процесс онбординга

### 3. **Обновлены типы БД**
Добавлены поля в `types/database.ts`:
- `experience_tags: string[]`
- `available_days: string[]`
- `typical_start_time: string`
- `typical_end_time: string`
- `lgbtq_alignment: Record<string, any>`
- `approved: boolean`

---

## 🔧 Что нужно сделать перед тестированием:

### **Шаг 1: Обновить схему БД**

Выполните SQL скрипт в **Supabase Dashboard** → **SQL Editor**:

```bash
supabase/FIX-GUIDES-ONBOARDING-SCHEMA.sql
```

Или скопируйте команды:

```sql
-- Добавить недостающие колонки
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS experience_tags TEXT[];
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS available_days TEXT[];
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS typical_start_time TIME;
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS typical_end_time TIME;
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS lgbtq_alignment JSONB;
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
```

---

## 🧪 Как протестировать:

### **1. Создайте нового гида**

```sql
-- В Supabase SQL Editor
INSERT INTO public.profiles (id, email, role, full_name)
VALUES (
  gen_random_uuid(),
  'test-guide@example.com',
  'guide',
  'test-guide@example.com'
);
```

Или зарегистрируйтесь через `/auth/sign-up?role=guide`

### **2. Пройдите онбординг**

1. Откройте `/guide/onboarding`
2. Заполните все 6 шагов

### **3. Проверьте логи в консоли**

Должны появиться:

```
🟢 [Onboarding] Starting submission with data: {...}
🟢 [Onboarding] User ID: xxx-xxx-xxx
🟢 [Onboarding] Inserting guide data: {...}
✅ [Onboarding] Guide created successfully: {...}
🟢 [Onboarding] Updating profile full_name to: Alex
✅ [Onboarding] All done! Redirecting to dashboard...
```

### **4. Проверьте БД**

```sql
-- Проверить что запись создалась
SELECT * FROM public.guides WHERE id = 'your-user-id';

-- Должны увидеть:
-- - city_id заполнен
-- - tagline, bio, about заполнены
-- - experience_tags: ["Culture & History", ...]
-- - languages: ["English", "Spanish"]
-- - base_price_4h, base_price_6h, base_price_8h
-- - available_days: ["monday", "tuesday", ...]
-- - lgbtq_alignment: {...}
-- - status: "pending"
-- - approved: false
```

---

## 📋 Структура данных после онбординга:

```json
{
  "profile": {
    "id": "xxx",
    "role": "guide",
    "full_name": "Alex", // ← Обновится если указано в onboarding
    "bio": null,
    "avatar_url": null
  },
  "guide": {
    "id": "xxx",
    "city_id": "city-uuid",
    "tagline": "Explore hidden Saigon...",
    "bio": "I'm a local guide...",
    "about": "We'll explore...",
    "experience_tags": ["Culture & History", "Food & Drink"],
    "languages": ["English", "Vietnamese"],
    "base_price_4h": "100",
    "base_price_6h": "150",
    "base_price_8h": "200",
    "currency": "USD",
    "available_days": ["monday", "tuesday", "wednesday"],
    "typical_start_time": "09:00:00",
    "typical_end_time": "18:00:00",
    "lgbtq_alignment": {
      "affirms_identity": true,
      "agrees_conduct": true,
      "no_sexual_services": true,
      "why_guiding": "I love...",
      "expectations": "Relaxed and friendly..."
    },
    "status": "pending",
    "approved": false
  }
}
```

---

## 🎯 Следующие шаги (TODO):

- [ ] Добавить загрузку фотографий
- [ ] Добавить preview профиля на последнем шаге
- [ ] Добавить возможность сохранить драфт
- [ ] Добавить email уведомление админу о новом гиде
- [ ] Stripe Connect для выплат

---

## 🐛 Troubleshooting:

### **Ошибка: "Could not find the 'experience_tags' column"**
→ Выполните SQL скрипт `FIX-GUIDES-ONBOARDING-SCHEMA.sql`

### **Ошибка: "permission denied for table guides"**
→ Проверьте RLS политики для таблицы `guides`:
```sql
-- Разрешить гидам создавать свои записи
CREATE POLICY "Guides can insert own record"
ON public.guides
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);
```

### **После онбординга редирект на sign-in**
→ Проверьте что `profile.role = 'guide'` установлена корректно

---

## 📝 Changelog:

### v1.0 - 2026-01-18
- ✅ Исправлен маппинг полей онбординга
- ✅ Добавлено логирование
- ✅ Обновлены типы БД
- ✅ Добавлен UI для фотографий (placeholder)
- ✅ Создан SQL скрипт для обновления схемы
