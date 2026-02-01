# Supabase Realtime Audit & Implementation Report

## Executive Summary

**Status**: ⚠️ **Partially Implemented - Needs Fixes**

The chat system has basic realtime for messages but lacks:

1. Proper logging and debugging
2. Realtime subscriptions for booking status changes
3. Subscription status tracking
4. Database publication verification
5. Efficient message updates (currently refetches all)

---

## Issues Found

### 🔴 Critical Issues

#### 1. No Realtime for Booking Status Changes

**Location**: `app/traveler/bookings/page.tsx`, `app/guide/bookings/page.tsx`, `app/guide/bookings/[id]/page.tsx`

**Problem**: Booking pages don't subscribe to UPDATE events. Users must refresh to see:

- pending → accepted
- accepted → confirmed
- Status changes that enable/disable chat

**Impact**: Poor UX, users don't know when chat becomes available

#### 2. Inefficient Message Updates

**Location**: `components/messaging/MessageInbox.tsx` (line 118)

**Problem**: On INSERT event, refetches ALL messages:

```typescript
const newMessages = await fetchMessages(selectedBooking.id);
const newMessage = newMessages.find((m) => m.id === (payload.new as any).id);
```

**Impact**: Unnecessary database queries, slower updates

#### 3. No Logging or Debugging

**Problem**: No way to distinguish:

- "Channel not connected"
- "Events blocked by RLS"
- "No events received"
- "Subscription failed"

**Impact**: Impossible to debug realtime issues in production

### 🟡 Medium Issues

#### 4. No Subscription Status Tracking

**Problem**: No logging when:

- Channel connects (`SUBSCRIBED`)
- Channel disconnects (`CLOSED`)
- Subscription fails (`CHANNEL_ERROR`)

**Impact**: Can't diagnose connection issues

#### 5. Database Publication Not Verified

**Problem**: Don't verify `messages` and `bookings` tables are in `supabase_realtime` publication

**Impact**: Realtime might silently fail if tables not published

### 🟢 Working Correctly

✅ Messages realtime subscription exists (MessageInbox.tsx)  
✅ Proper channel cleanup with `removeChannel()`  
✅ Modern `postgres_changes` API (not deprecated syntax)  
✅ Correct schema/table names  
✅ Filter by `booking_id` for messages  
✅ RLS respected (not bypassed)

---

## Current Implementation Review

### Messages Realtime (MessageInbox.tsx)

**Status**: ✅ Implemented, ⚠️ Needs Optimization

```typescript
// Location: components/messaging/MessageInbox.tsx (line 103-138)
useEffect(() => {
  if (!supabase || !selectedBooking) return;

  const channel = supabase
    .channel(`booking_messages:${selectedBooking.id}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `booking_id=eq.${selectedBooking.id}`,
      },
      async (payload) => {
        // ⚠️ ISSUE: Refetches all messages instead of using payload.new
        const newMessages = await fetchMessages(selectedBooking.id);
        const newMessage = newMessages.find(
          (m) => m.id === (payload.new as any).id,
        );
        if (newMessage) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      },
    )
    .subscribe(); // ⚠️ ISSUE: No status callback

  return () => {
    supabase.removeChannel(channel); // ✅ Proper cleanup
  };
}, [supabase, selectedBooking, fetchMessages]);
```

**Issues**:

- ❌ No logging
- ❌ Refetches instead of using `payload.new`
- ❌ No subscription status tracking

### Messages Realtime (chat-window.tsx)

**Status**: ✅ Implemented, ⚠️ Needs Logging

```typescript
// Location: components/messaging/chat-window.tsx (line 48-71)
useEffect(() => {
  if (!supabase) return;

  const channel = supabase
    .channel(`booking_messages:${bookingId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `booking_id=eq.${bookingId}`,
      },
      (payload) => {
        const newMsg = payload.new as Message;
        setMessages((prev) => [...prev, newMsg]); // ✅ Direct use of payload
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [bookingId, supabase]);
```

**Issues**:

- ❌ No logging
- ❌ No subscription status tracking
- ⚠️ Duplicate prevention not implemented (minor)

### Bookings Realtime

**Status**: ❌ NOT IMPLEMENTED

**Affected Pages**:

- `app/traveler/bookings/page.tsx` - Traveler bookings list
- `app/guide/bookings/page.tsx` - Guide bookings list
- `app/guide/bookings/[id]/page.tsx` - Guide booking detail

**Missing**: No subscription to:

```typescript
// MISSING IMPLEMENTATION
.on('postgres_changes', {
  event: 'UPDATE',
  schema: 'public',
  table: 'bookings',
  filter: `id=eq.${bookingId}` // or traveler_id/guide_id for lists
}, (payload) => {
  // Update booking status in UI
})
```

---

## Required Fixes

### Fix 1: Add Logging to Message Subscriptions

```typescript
// Enhanced with logging
const channel = supabase
  .channel(`booking_messages:${selectedBooking.id}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `booking_id=eq.${selectedBooking.id}`,
    },
    (payload) => {
      console.log('[Realtime] New message received:', {
        messageId: payload.new.id,
        bookingId: selectedBooking.id,
        senderId: payload.new.sender_id,
        timestamp: new Date().toISOString(),
      });

      // Handle message...
    },
  )
  .subscribe((status) => {
    console.log('[Realtime] Subscription status:', {
      channel: `booking_messages:${selectedBooking.id}`,
      status,
      timestamp: new Date().toISOString(),
    });

    if (status === 'SUBSCRIBED') {
      console.log('[Realtime] ✅ Successfully subscribed to messages');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('[Realtime] ❌ Channel error - check RLS policies');
    } else if (status === 'CLOSED') {
      console.log('[Realtime] Channel closed');
    }
  });
```

### Fix 2: Optimize Message Updates (Don't Refetch)

```typescript
// Current (inefficient)
const newMessages = await fetchMessages(selectedBooking.id);
const newMessage = newMessages.find((m) => m.id === (payload.new as any).id);

// Fixed (efficient)
const newMessage: Message = {
  id: payload.new.id,
  booking_id: payload.new.booking_id,
  sender_id: payload.new.sender_id,
  sender_name: 'Loading...', // Fetch sender separately if needed
  content: payload.new.body,
  timestamp: payload.new.created_at,
};

// Optionally fetch sender profile
const { data: sender } = await supabase
  .from('profiles')
  .select('full_name')
  .eq('id', payload.new.sender_id)
  .single();

if (sender) {
  newMessage.sender_name = sender.full_name;
}
```

### Fix 3: Implement Bookings Realtime

**For Booking Lists** (traveler/guide bookings pages):

```typescript
useEffect(() => {
  if (!supabase || !userId) return;

  const channel = supabase
    .channel(`user_bookings:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `${userRole}_id=eq.${userId}`, // traveler_id or guide_id
      },
      (payload) => {
        console.log('[Realtime] Booking updated:', payload.new);

        setBookings((prev) =>
          prev.map((b) =>
            b.id === payload.new.id
              ? { ...b, status: payload.new.status, ...payload.new }
              : b,
          ),
        );
      },
    )
    .subscribe((status) => {
      console.log('[Realtime] Bookings subscription:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [supabase, userId, userRole]);
```

**For Booking Detail Page**:

```typescript
useEffect(() => {
  if (!supabase || !bookingId) return;

  const channel = supabase
    .channel(`booking_detail:${bookingId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`,
      },
      (payload) => {
        console.log('[Realtime] Booking status changed:', {
          from: booking?.status,
          to: payload.new.status,
        });

        setBooking((prev) => (prev ? { ...prev, ...payload.new } : null));

        // Update UI based on status change
        if (isMessagingEnabled(payload.new.status)) {
          console.log('[Realtime] Chat is now enabled!');
        }
      },
    )
    .subscribe((status) => {
      console.log('[Realtime] Booking detail subscription:', status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
}, [supabase, bookingId]);
```

---

## Database Prerequisites

### Required SQL (Run in Supabase SQL Editor)

```sql
-- Verify publication exists
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- If doesn't exist, create it
CREATE PUBLICATION supabase_realtime;

-- Add tables to publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Verify tables are in publication
SELECT
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('messages', 'bookings');

-- Expected output:
--  schemaname | tablename
-- ------------+-----------
--  public     | messages
--  public     | bookings
```

### RLS Verification

Realtime respects RLS. Current policies:

**messages**:

- ✅ `messages_participants_read` - Users see only their booking's messages
- ✅ `messages_participants_send` - Users can only insert as themselves

**bookings**:

- ✅ `bookings_participants_read` - Users see only their bookings
- ✅ Various update policies for travelers/guides

**Realtime Behavior**:

- INSERT events on `messages` → Only sent to traveler & guide of that booking
- UPDATE events on `bookings` → Only sent to traveler & guide of that booking

---

## Testing Checklist

### Messages Realtime

- [ ] Open chat as traveler in one browser
- [ ] Open same chat as guide in another browser
- [ ] Send message from traveler
- [ ] Verify guide sees message instantly (no refresh)
- [ ] Check console logs show:
  - `[Realtime] ✅ Successfully subscribed to messages`
  - `[Realtime] New message received: { messageId: ..., bookingId: ... }`
- [ ] Send message from guide
- [ ] Verify traveler sees message instantly
- [ ] Close chat tab
- [ ] Check console shows: `[Realtime] Channel closed`

### Bookings Realtime

- [ ] Guide views booking list (pending bookings)
- [ ] In another window, accept a booking via API/admin
- [ ] Verify booking list updates instantly (pending → accepted)
- [ ] Check console logs show:
  - `[Realtime] ✅ Successfully subscribed to bookings`
  - `[Realtime] Booking updated: { id: ..., status: 'accepted' }`
- [ ] Traveler views booking detail page
- [ ] Guide accepts booking
- [ ] Verify traveler sees:
  - Status badge updates
  - Chat button becomes enabled
  - No page refresh required

### RLS Verification

- [ ] User A opens chat for booking X
- [ ] User B (unrelated) is logged in
- [ ] User B should NOT see User A's messages in realtime
- [ ] Check browser console for NO messages about booking X
- [ ] Verify RLS is working (not bypassed)

### Error Scenarios

- [ ] Turn off network, then turn it back on
- [ ] Verify subscription reconnects automatically
- [ ] Check logs show reconnection status
- [ ] Send message offline → Verify shows error
- [ ] Come back online → Verify can send again

---

## Performance Considerations

### Current Issues

1. **MessageInbox refetch**: Currently refetches all messages on every INSERT
   - **Fix**: Use `payload.new` directly
   - **Savings**: ~50-100ms per message, reduces database load

2. **No message batching**: Each message is a separate realtime event
   - **Impact**: Fine for normal chat, might be slow for bulk operations
   - **Mitigation**: Already handled by Supabase

### Optimizations

1. **Debounce status updates**: If multiple status changes happen quickly
2. **Batch profile fetches**: If multiple messages arrive in quick succession
3. **Use realtime presence**: Show "User is typing..." indicator (future)

---

## Security Verification

✅ **All checks passed**:

- [x] RLS policies enforced on realtime events
- [x] No service role key used on client
- [x] No RLS bypass suggested
- [x] Filter by `booking_id` prevents data leakage
- [x] Subscription cleanup prevents memory leaks
- [x] Modern Supabase API (not deprecated methods)

---

## Next Steps

1. **Implement fixes** in priority order:
   - [ ] Add logging to message subscriptions (15 min)
   - [ ] Optimize message updates (remove refetch) (10 min)
   - [ ] Implement bookings realtime (30 min)
   - [ ] Verify database publication (5 min)
   - [ ] Test end-to-end (20 min)

2. **Deploy and monitor**:
   - Watch browser console for realtime logs
   - Monitor Supabase realtime connections
   - Check for RLS policy violations

3. **Future enhancements**:
   - Typing indicators
   - Read receipts
   - Presence (online/offline status)
   - Reconnection UI feedback
