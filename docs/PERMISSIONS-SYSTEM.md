# Система разрешений и защиты маршрутов

## Обзор

Проект использует **многоуровневую систему защиты** на основе ролей пользователей.

## Роли пользователей

1. **`traveler`** - путешественник (клиент)
2. **`guide`** - гид (хост)
3. **`admin`** - администратор

## Уровни защиты

### 1. Middleware (`middleware.ts`)

**Первый уровень защиты** - выполняется на каждом запросе.

#### Публичные маршруты (без проверки):
- `/guides` - список гидов
- `/cities` - список городов
- `/blog` - блог
- `/how-it-works` - как это работает
- `/become-a-guide` - стать гидом
- `/faq` - FAQ
- `/legal` - юридические страницы

#### Защищенные маршруты:

**`/admin/*`** - только для admin
```typescript
// Проверяет:
// 1. Авторизацию (user существует)
// 2. Роль === 'admin' в БД
// Редирект: → /auth/sign-in (если не авторизован)
//          → / (если не admin)
```

**`/guide/*`** - только для guide и admin
```typescript
// Проверяет:
// 1. Авторизацию
// 2. Роль === 'guide' ИЛИ 'admin'
// Редирект: → /auth/sign-in (если не авторизован)
//          → /traveler/dashboard (если traveler)
//          → / (если неизвестная роль)
```

**`/traveler/*`** - только для traveler и admin
```typescript
// Проверяет:
// 1. Авторизацию
// 2. Роль === 'traveler' ИЛИ 'admin'
// Редирект: → /auth/sign-in (если не авторизован)
//          → /guide/dashboard (если guide)
//          → / (если неизвестная роль)
```

### 2. Server-side Layouts

**Второй уровень защиты** - выполняется при рендере страницы.

#### `/app/traveler/layout.tsx`
```typescript
// Проверяет:
// 1. Авторизацию
// 2. Существование профиля
// 3. Роль !== 'guide'
// 4. Роль === 'traveler' ИЛИ 'admin'

// Редиректы:
// - Нет профиля → /auth/sign-in
// - Роль 'guide' → /guide/dashboard
// - Другая роль → /
```

#### `/app/guide/layout.tsx`
```typescript
// Проверяет:
// 1. Авторизацию
// 2. Существование профиля
// 3. Роль !== 'traveler'
// 4. Роль === 'guide' ИЛИ 'admin'
// 5. Загружает данные гида и bookings

// Редиректы:
// - Нет профиля → /auth/sign-in
// - Роль 'traveler' → /traveler/dashboard
// - Другая роль → /
```

#### `/app/admin/layout.tsx`
```typescript
// Client-side layout
// Защита на уровне middleware
```

### 3. Onboarding Layouts

Для onboarding-страниц используются **отдельные layouts без sidebar**:

- `/app/guide/onboarding/layout.tsx` - простой layout без проверок
- `/app/traveler/onboarding/layout.tsx` - простой layout без проверок

Защита onboarding-страниц происходит на уровне middleware и родительского layout.

### 4. Client-side компонент `RoleGate`

**Дополнительная защита** для клиентских компонентов.

```tsx
import { RoleGate } from '@/components/auth/role-gate';

<RoleGate allowedRoles={['guide', 'admin']} fallbackUrl="/traveler/dashboard">
  <SensitiveContent />
</RoleGate>
```

**Использование:**
- Защита отдельных компонентов
- Условный рендер по ролям
- Fallback URL для редиректа

## Матрица доступа

| Маршрут | traveler | guide | admin | guest |
|---------|----------|-------|-------|-------|
| `/` | ✅ | ✅ | ✅ | ✅ |
| `/guides` | ✅ | ✅ | ✅ | ✅ |
| `/cities` | ✅ | ✅ | ✅ | ✅ |
| `/auth/*` | ✅ | ✅ | ✅ | ✅ |
| `/traveler/*` | ✅ | ❌ → `/guide/dashboard` | ✅ | ❌ → `/auth/sign-in` |
| `/guide/*` | ❌ → `/traveler/dashboard` | ✅ | ✅ | ❌ → `/auth/sign-in` |
| `/admin/*` | ❌ → `/` | ❌ → `/` | ✅ | ❌ → `/auth/sign-in` |

## Логика редиректов

### После входа (Sign In)

**Файл:** `lib/auth/post-login-redirect.ts`

```typescript
// Traveler:
if (profile.full_name) → /traveler/dashboard
else → /traveler/onboarding

// Guide:
if (guide.status exists) → /guide/dashboard
else → /guide/onboarding

// Admin:
→ /admin

// Unknown:
→ /account
```

### После регистрации (Sign Up)

**Файл:** `components/auth/sign-up-form.tsx`

```typescript
// Guide → /guide/onboarding
// Traveler → /traveler/onboarding
```

### OAuth Callback

**Файл:** `app/auth/callback/route.ts`

```typescript
// Определяет роль:
// 1. Из существующего профиля
// 2. Из URL query param (?role=guide)
// 3. Из user metadata
// 4. По умолчанию 'traveler'

// Редирект:
// Admin → /admin
// Guide → /guide/dashboard
// Traveler → /traveler/dashboard
```

## Особенности реализации

### Admin может всё
Admin имеет доступ ко всем разделам:
- `/admin/*` - админ панель
- `/guide/*` - может просматривать интерфейс гида
- `/traveler/*` - может просматривать интерфейс путешественника

### Двойная проверка
Каждый защищенный маршрут проверяется дважды:
1. **Middleware** - быстрая проверка, предотвращает загрузку страницы
2. **Layout** - серверная проверка, гарантирует безопасность

### Оптимизация
- Middleware делает один запрос к БД для проверки роли
- Layout загружает полные данные профиля и связанные записи
- Client-side компоненты используют кэшированную сессию

## Тестирование

### Сценарии для проверки:

1. **Traveler пытается зайти на `/guide/dashboard`**
   - ✅ Должен редиректить на `/traveler/dashboard`

2. **Guide пытается зайти на `/traveler/dashboard`**
   - ✅ Должен редиректить на `/guide/dashboard`

3. **Guest пытается зайти на `/guide/dashboard`**
   - ✅ Должен редиректить на `/auth/sign-in`

4. **Admin заходит на `/guide/dashboard`**
   - ✅ Должен видеть интерфейс гида

5. **Admin заходит на `/traveler/dashboard`**
   - ✅ Должен видеть интерфейс путешественника

## Безопасность

### ✅ Реализовано:
- Проверка роли в middleware
- Проверка роли в server layouts
- Защита API routes (требует отдельной проверки)
- Редиректы для неавторизованных
- Редиректы для неправильной роли

### ⚠️ Рекомендации:
- Добавить rate limiting для auth endpoints
- Логировать попытки несанкционированного доступа
- Добавить CSRF защиту для форм
- Регулярно обновлять зависимости

## Отладка

### Проверка текущей роли:
```typescript
// Server-side
const supabase = await createSupabaseServerClient();
const { data: { user } } = await supabase.auth.getUser();
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();
console.log('Current role:', profile?.role);
```

### Логи middleware:
Добавьте в `middleware.ts`:
```typescript
console.log('Path:', request.nextUrl.pathname);
console.log('User:', user?.id);
console.log('Role:', profile?.role);
```

## Дальнейшие улучшения

1. **Permissions system** - детальные права внутри ролей
2. **Role hierarchy** - наследование прав
3. **Feature flags** - управление доступом к функциям
4. **Audit log** - логирование действий пользователей
5. **Two-factor auth** - дополнительная защита для admin
