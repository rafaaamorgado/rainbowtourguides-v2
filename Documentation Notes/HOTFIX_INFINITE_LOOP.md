# Hotfix: Infinite Loop in MessageInbox

## Issue

**Error**: "Maximum update depth exceeded" in `MessageInbox.tsx`

**Location**: Line 180, `setLastMessages` in `useEffect`

**Root Cause**: The `messages` array was being recreated on every render via `.map()`, causing the `useEffect` that depends on `messages` to run infinitely.

---

## The Problem

```typescript
// ❌ WRONG - Creates new array reference on EVERY render
const messages: Message[] = realtimeMessages.map((msg) => ({
  id: msg.id,
  // ... transform
}));

useEffect(() => {
  // This runs every time messages changes
  setLastMessages(...); // ← Updates state
  // Which triggers re-render
  // Which creates new messages array
  // Which triggers this effect again
  // INFINITE LOOP!
}, [messages, selectedBooking, currentUserId]);
```

**Flow**:

```
1. Render → messages = realtimeMessages.map(...)  (new array reference)
2. useEffect sees messages changed → runs
3. setLastMessages(...) → triggers re-render
4. Go to step 1 → INFINITE LOOP
```

---

## The Fix

```typescript
// ✅ CORRECT - Memoize to only change when realtimeMessages changes
const messages: Message[] = useMemo(() => {
  return realtimeMessages.map((msg) => ({
    id: msg.id,
    booking_id: msg.booking_id,
    sender_id: msg.sender_id,
    sender_name: msg.sender?.full_name || 'Unknown',
    content: msg.body,
    timestamp: msg.created_at,
  }));
}, [realtimeMessages]); // ← Only recreate when realtimeMessages changes

useEffect(() => {
  // Now only runs when messages ACTUALLY change
  setLastMessages(...);
}, [messages, selectedBooking, currentUserId]);
```

**Flow**:

```
1. Render → messages = useMemo(..., [realtimeMessages])  (stable reference)
2. useEffect sees messages unchanged → doesn't run
3. New message arrives → realtimeMessages changes
4. messages recalculated → useEffect runs once
5. setLastMessages(...) → re-render
6. messages still has same reference → stable ✅
```

---

## Files Changed

- **`components/messaging/MessageInbox.tsx`**:
  - Added `useMemo` import
  - Wrapped `messages` transformation in `useMemo`
  - Added comment explaining why

---

## Testing

1. Open traveler messages page: `/traveler/messages?booking=<id>`
2. Check browser console
3. **Expected**: No errors, page loads normally
4. Send a message
5. **Expected**: Message appears, no console errors

**Before fix**: Console fills with "Maximum update depth exceeded"  
**After fix**: Clean console, no errors ✅

---

## Why This Matters

Without `useMemo`, every render creates a new array reference, even if the content is identical. React's `useEffect` does shallow comparison on dependencies, so:

- `[1, 2, 3] !== [1, 2, 3]` (different references)
- `useMemo([1, 2, 3]) === useMemo([1, 2, 3])` (same reference if deps unchanged)

---

## Lesson Learned

**Rule**: Always memoize derived arrays/objects that are used as `useEffect` dependencies.

**Pattern**:

```typescript
// ❌ BAD - Creates new reference every render
const derived = source.map(...)

// ✅ GOOD - Stable reference
const derived = useMemo(() => source.map(...), [source])
```

---

## Summary

**Issue**: Infinite loop due to non-memoized array transformation  
**Fix**: Wrap transformation in `useMemo`  
**Result**: Stable array reference, effect runs only when data actually changes  
**Status**: ✅ Fixed
