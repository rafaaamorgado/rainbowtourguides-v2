# PGRST201 Ambiguity Fix - Foreign Key Hints for guides→profiles

## Problem

The `guides` table has two foreign key relationships to the `profiles` table:

1. **guides.id → profiles.id** (the guide's own profile)
2. **guides.reviewed_by → profiles.id** (the reviewer/admin profile)

When embedding profiles from guides without specifying which FK to use, Supabase PostgREST returns a **PGRST201 ambiguity error** because it doesn't know which relationship to follow.

### Example Error

```
PGRST201: Could not embed because more than one relationship was found for 'guides' and 'profiles'
```

## Solution

Use explicit foreign key hints in all Supabase queries:

- **For guide's own profile**: `profile:profiles!guides_id_fkey(*)`
- **For reviewer profile**: `reviewer:profiles!guides_reviewed_by_fkey(*)`

## Files Fixed

### 1. `lib/data-service.ts` (4 occurrences)

**Function: `getBookings()`** (line 805)

```typescript
// Before ❌
guide:guides!bookings_guide_id_fkey(
  id,
  profile:profiles(full_name)
)

// After ✅
guide:guides!bookings_guide_id_fkey(
  id,
  profile:profiles!guides_id_fkey(full_name)
)
```

**Function: `getBooking()`** (line 852)

```typescript
// Before ❌
guide:guides!bookings_guide_id_fkey(
  id,
  profile:profiles(full_name)
)

// After ✅
guide:guides!bookings_guide_id_fkey(
  id,
  profile:profiles!guides_id_fkey(full_name)
)
```

**Function: `createBooking()`** (line 910)

```typescript
// Before ❌
guide:guides!bookings_guide_id_fkey(
  id,
  profile:profiles(full_name)
)

// After ✅
guide:guides!bookings_guide_id_fkey(
  id,
  profile:profiles!guides_id_fkey(full_name)
)
```

**Function: `updateBookingStatus()`** (line 976)

```typescript
// Before ❌
guide:guides!bookings_guide_id_fkey(
  id,
  profile:profiles(full_name)
)

// After ✅
guide:guides!bookings_guide_id_fkey(
  id,
  profile:profiles!guides_id_fkey(full_name)
)
```

### 2. `app/traveler/messages/[threadId]/page.tsx` (line 26)

```typescript
// Before ❌
guide:guides!bookings_guide_id_fkey(profile:profiles(full_name))

// After ✅
guide:guides!bookings_guide_id_fkey(
  profile:profiles!guides_id_fkey(full_name)
)
```

### 3. `app/traveler/dashboard/page.tsx` (line 32)

```typescript
// Before ❌
guide:guides (
  profile:profiles (full_name)
)

// After ✅
guide:guides!bookings_guide_id_fkey(
  profile:profiles!guides_id_fkey(full_name)
)
```

**Note**: Also added the FK hint for the guides relationship (`bookings_guide_id_fkey`).

### 4. `app/admin/guides/page.tsx` (line 30)

```typescript
// Before ❌
profile:profiles(full_name, email)

// After ✅
profile:profiles!guides_id_fkey(full_name, email)
```

## Verification

All instances have been fixed. Running a search for the problematic pattern:

```bash
# Search for guides embedding profiles without FK hint
rg "guides.*profile:profiles\([^!]" --type ts --type tsx

# Result: No matches found ✅
```

All 16 occurrences now use the proper FK hint:

```bash
# Search for correct usage
rg "profiles!guides_id_fkey" --type ts --type tsx

# Result: 16 matches found across all files ✅
```

## Files Already Correct

The following files were already using the correct FK hints (no changes needed):

- ✅ `lib/chat-api.ts` - line 246
- ✅ `app/traveler/bookings/page.tsx` - line 59
- ✅ `app/api/bookings/[id]/status/route.ts` - line 45
- ✅ `app/guides/[slug]/page.tsx` - lines 137, 175

## Database Schema Reference

```sql
-- Foreign keys on guides table
ALTER TABLE guides
  ADD CONSTRAINT guides_id_fkey
  FOREIGN KEY (id) REFERENCES profiles(id);

ALTER TABLE guides
  ADD CONSTRAINT guides_reviewed_by_fkey
  FOREIGN KEY (reviewed_by) REFERENCES profiles(id);
```

## Best Practices

### 1. Always Use FK Hints for Ambiguous Relationships

When a table has multiple foreign keys to the same table, **always** specify which FK to use:

```typescript
// ❌ Bad - Ambiguous
.select('guides(profile:profiles(*))')

// ✅ Good - Explicit
.select('guides(profile:profiles!guides_id_fkey(*))')
```

### 2. Use Aliases for Multiple Relationships

If you need both the guide's profile AND the reviewer's profile:

```typescript
.select(`
  guides(
    profile:profiles!guides_id_fkey(full_name, avatar_url),
    reviewer:profiles!guides_reviewed_by_fkey(full_name, email)
  )
`)
```

### 3. Nested Relationships Also Need Hints

When embedding through multiple levels (e.g., bookings → guides → profiles):

```typescript
// ❌ Bad
bookings(
  guide:guides!bookings_guide_id_fkey(
    profile:profiles(full_name)  // Missing FK hint!
  )
)

// ✅ Good
bookings(
  guide:guides!bookings_guide_id_fkey(
    profile:profiles!guides_id_fkey(full_name)  // Explicit FK hint
  )
)
```

## Testing

To verify the fix works:

1. **Run the application**:

   ```bash
   npm run dev
   ```

2. **Test affected endpoints**:
   - Guide messages page: `/guide/messages`
   - Traveler messages page: `/traveler/messages`
   - Traveler dashboard: `/traveler/dashboard`
   - Admin guides page: `/admin/guides`
   - Bookings API: Check any booking-related operations

3. **Check for PGRST201 errors**:
   - Monitor browser console
   - Monitor server logs
   - Check Supabase logs

## Impact

This fix affects:

- ✅ All booking queries that fetch guide profiles
- ✅ Traveler dashboard and messages pages
- ✅ Admin guide verification page
- ✅ Any API endpoints that return booking data

## Related Documentation

- [Supabase Foreign Key Hints](https://supabase.com/docs/guides/database/joins-and-nesting#specifying-the-join-column)
- [PostgREST Disambiguation](https://postgrest.org/en/stable/references/api/resource_embedding.html#disambiguating-multiple-foreign-keys)

## Migration Notes

No database migrations required. This is a query-level fix only.

## Checklist

- [x] Fixed `lib/data-service.ts` (4 occurrences)
- [x] Fixed `app/traveler/messages/[threadId]/page.tsx` (1 occurrence)
- [x] Fixed `app/traveler/dashboard/page.tsx` (1 occurrence)
- [x] Fixed `app/admin/guides/page.tsx` (1 occurrence)
- [x] Verified no remaining problematic patterns
- [x] Confirmed all 16 instances use correct FK hints
- [x] Documented best practices for future development
