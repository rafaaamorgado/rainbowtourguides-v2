# Инструкция: Одобрение гидов

## Проблема
Все гиды в базе данных имеют статус `pending`, поэтому они не отображаются на странице городов (требуется статус `approved`).

## Решение
Выполните следующий SQL запрос в **Supabase SQL Editor**:

### Шаг 1: Откройте Supabase Dashboard
1. Перейдите на https://supabase.com/dashboard
2. Выберите ваш проект
3. Откройте **SQL Editor** в левом меню

### Шаг 2: Выполните SQL запрос

```sql
-- Одобрить все pending гиды
UPDATE public.guides
SET status = 'approved'
WHERE status = 'pending';

-- Проверить результат
SELECT 
  g.id,
  p.full_name as guide_name,
  c.name as city_name,
  g.status
FROM public.guides g
LEFT JOIN public.profiles p ON p.id = g.id
LEFT JOIN public.cities c ON c.id = g.city_id
ORDER BY c.name, p.full_name;
```

### Шаг 3: Проверьте результат
После выполнения запроса вы должны увидеть список всех гидов со статусом `approved`.

### Шаг 4: Обновите страницу
Перейдите на страницу `/cities` и обновите её - теперь должно отображаться количество гидов в каждом городе.

## Альтернатива: Использовать Admin панель
Вы также можете одобрить гидов через админ панель:
1. Перейдите на `/admin/guides`
2. Одобрите каждого гида вручную

## Ожидаемый результат
После одобрения гидов, на странице `/cities` должно отображаться:
- Berlin: 2 guides
- London: 2 guides  
- Paris: 2 guides
- Amsterdam: 1 guide
- Barcelona: 1 guide
- Madrid: 1 guide
- Prague: 1 guide
- Rome: 1 guide
- Vienna: 1 guide
