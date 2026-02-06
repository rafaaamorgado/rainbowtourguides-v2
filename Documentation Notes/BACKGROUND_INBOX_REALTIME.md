# Background Inbox Realtime Updates

## Overview

Added background realtime subscription to update the inbox list (last messages, unread indicators) for **all conversations**, even when no specific chat is open.

---

## The Problem

**Before**: Realtime only worked when a specific chat was open.

```
User opens /messages page → sees list of conversations
Guide sends message to Booking A → ❌ No update (chat not open)
User must refresh page to see new message indicator
```

**After**: Realtime works for all conversations in the background.

```
User opens /messages page → sees list of conversations
Guide sends message to Booking A → ✅ Last message updates instantly
                                  → ✅ Unread indicator appears
                                  → No refresh needed!
```

---

## Implementation

### Two Realtime Subscriptions

The inbox now has **two independent subscriptions**:

#### 1. **Selected Booking Subscription** (existing)

- **Channel**: `booking:<bookingId>:messages`
- **Purpose**: Updates the open chat window with full message details
- **Scope**: Only the currently selected booking
- **Used by**: `useBookingMessagesRealtime` hook

#### 2. **Background Inbox Subscription** (new)

- **Channel**: `inbox:<userId>:messages`
- **Purpose**: Updates last message & unread indicators for ALL bookings
- **Scope**: All user's bookings (RLS filtered automatically)
- **Used by**: MessageInbox component directly

---

## How It Works

### Setup

```typescript
// Background subscription listens to ALL messages user can see
const channel = supabase
  .channel(`inbox:${currentUserId}:messages`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      // No filter - RLS automatically filters to user's bookings only
    },
    handleInboxMessage,
  )
  .subscribe();
```

### Message Handling

When a new message arrives:

```typescript
const handleInboxMessage = (payload) => {
  const bookingId = payload.new.booking_id;

  // 1. Update last message preview
  setLastMessages({
    [bookingId]: {
      text: payload.new.body,
      timestamp: payload.new.created_at,
      senderId: payload.new.sender_id,
    },
  });

  // 2. Mark as unread IF:
  //    - Message is from other party (not self)
  //    - Booking is NOT currently open/selected
  if (
    payload.new.sender_id !== currentUserId &&
    selectedBooking?.id !== bookingId
  ) {
    setUnreadBookings((prev) => prev.add(bookingId));
  }
};
```

### Unread Logic

```
┌─────────────────────────────────────────────────────────┐
│ New message arrives in Booking X                        │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │ Sender = currentUser? │
        └───────────┬───────────┘
                    │
            ┌───────┴────────┐
           YES              NO
            │                │
        Ignore         ┌─────┴──────────────────┐
                       │ Booking X is selected? │
                       └─────┬──────────────────┘
                             │
                     ┌───────┴────────┐
                    YES              NO
                     │                │
              Mark as READ      Mark as UNREAD
           (user is viewing)   (in background)
```

---

## Console Logs

### Startup

```
[RT-Inbox] Setting up background subscription for 5 bookings
[RT-Inbox] Background subscription status=SUBSCRIBED time=2026-02-01T12:00:00.000Z
[RT-Inbox] ✅ Subscribed to inbox updates
```

### New Message (Not Selected)

```
[RT-Inbox] New message in booking=abc-123 sender=guide-456 (current=traveler-789 selected=none)
[RT-Inbox] Marking booking abc-123 as unread
```

### New Message (Currently Selected)

```
[RT-Inbox] New message in booking=abc-123 sender=guide-456 (current=traveler-789 selected=abc-123)
(No unread marking - user is viewing this conversation)
```

### Cleanup

```
[RT-Inbox] Cleaning up background subscription
```

---

## Testing

### Test 1: Background Updates

**Setup**:

1. Open two browsers
   - Browser A: Traveler at `/traveler/messages` (inbox view, no chat selected)
   - Browser B: Guide at `/guide/messages?booking=abc-123` (chat open)

**Action**:

- Guide sends message: "Hello traveler!"

**Expected in Browser A**:

- ✅ Last message for Booking abc-123 updates to "Hello traveler!"
- ✅ Unread indicator (blue dot) appears
- ✅ Timestamp updates to "just now"
- ✅ No page refresh needed

**Console**:

```
[RT-Inbox] New message in booking=abc-123 sender=guide-456 (current=traveler-789 selected=none)
[RT-Inbox] Marking booking abc-123 as unread
```

---

### Test 2: Auto-Read When Viewing

**Setup**:

1. Open two browsers
   - Browser A: Traveler at `/traveler/messages?booking=abc-123` (chat open)
   - Browser B: Guide at `/guide/messages?booking=abc-123` (chat open)

**Action**:

- Guide sends message: "Test"

**Expected in Browser A**:

- ✅ Message appears in chat window
- ✅ Last message updates
- ✅ NO unread indicator (user is viewing)

**Console**:

```
[RT-Inbox] New message in booking=abc-123 sender=guide-456 (current=traveler-789 selected=abc-123)
(No "Marking as unread" log - correct)
```

---

### Test 3: Multiple Conversations

**Setup**:

1. Browser A: Traveler at `/traveler/messages` (3 bookings in list)
   - Booking A (with Guide 1)
   - Booking B (with Guide 2)
   - Booking C (with Guide 3)

**Action**:

- Guide 1 sends message in Booking A
- Guide 2 sends message in Booking B
- Guide 3 sends message in Booking C

**Expected**:

- ✅ All 3 bookings update instantly
- ✅ All 3 show unread indicators
- ✅ Last messages all update
- ✅ No page refresh needed

---

### Test 4: Switch Between Chats

**Setup**:

1. Browser A: Traveler at `/traveler/messages`
2. Booking A has 1 unread message

**Action**:

1. Click on Booking A to open chat
2. Guide sends another message in Booking B

**Expected**:

- ✅ Booking A's unread indicator clears (viewing it)
- ✅ Booking B's unread indicator appears (not viewing)
- ✅ Both last messages update correctly

---

## Performance

### Before

- **Inbox updates**: Manual refresh required (no realtime)
- **Unread indicators**: Only updated on page load
- **Last messages**: Stale until refresh

### After

- **Inbox updates**: Instant (< 1 second)
- **Unread indicators**: Real-time updates
- **Last messages**: Always current
- **Extra overhead**: 1 additional Supabase Realtime channel per user

---

## Security

### RLS Protection

The background subscription has **no filter** on the messages table:

```typescript
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'messages',
  // No filter here
})
```

**This is safe** because:

1. Supabase Realtime respects Row Level Security (RLS)
2. Users only receive INSERT events for messages they can SELECT
3. The `messages_participants_read` RLS policy ensures users only see messages from their own bookings
4. Even without a filter, users cannot receive messages from other people's conversations

### Verification

```sql
-- RLS policy on messages table
CREATE POLICY messages_participants_read ON messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM bookings
    WHERE bookings.id = messages.booking_id
    AND (
      bookings.traveler_id = auth.uid()
      OR bookings.guide_id = auth.uid()
    )
  )
);
```

**Result**: Users only receive realtime events for their own bookings.

---

## Code Changes

### File Modified

- `components/messaging/MessageInbox.tsx`

### Changes Made

1. **Added background subscription** (lines ~198-270)
   - Subscribes to ALL messages user can see
   - Updates lastMessages for all bookings
   - Marks conversations as unread intelligently

2. **Fixed unread logic for selected booking** (lines ~178-196)
   - Changed: Was marking selected booking as unread (wrong)
   - Fixed: Clears unread indicator when viewing conversation (correct)

3. **Improved logging**
   - Added `[RT-Inbox]` prefix for background subscription logs
   - Shows which booking, sender, and selection state

---

## Debugging

### Check Background Subscription is Active

Open browser console on `/messages` page:

**Expected logs**:

```
[RT-Inbox] Setting up background subscription for N bookings
[RT-Inbox] ✅ Subscribed to inbox updates
```

**If missing**: Check that `bookings.length > 0` and `supabase` is initialized.

---

### Verify Unread Logic

Send message from another user, check console:

**If NOT selected**:

```
[RT-Inbox] Marking booking <id> as unread
```

**If selected**:

```
[RT-Inbox] New message in booking=<id> ... (selected=<id>)
(No "Marking as unread" - correct!)
```

---

### Check RLS Policies

If no messages arrive in background:

```sql
-- Run in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'messages';
```

**Expected**: `messages_participants_read` policy exists.

---

## Migration from Old Code

### Old Behavior

```typescript
// ❌ Only selected booking had realtime
useEffect(() => {
  if (!selectedBooking) return; // ← Inbox had no realtime!

  const channel = supabase.channel(`booking:${selectedBooking.id}`);
  // ...
}, [selectedBooking]);
```

**Problem**: Inbox list never updated in real-time.

---

### New Behavior

```typescript
// ✅ Background subscription for all bookings
useEffect(() => {
  if (!bookings.length) return;

  const channel = supabase.channel(`inbox:${currentUserId}:messages`);
  // Listens to ALL user's messages
  // ...
}, [bookings.length, currentUserId]);

// ✅ Selected booking still has its own subscription
const { messages } = useBookingMessagesRealtime({
  bookingId: selectedBooking?.id,
});
```

**Result**: Both inbox AND open chat get realtime updates.

---

## Summary

✅ **Background realtime** for inbox list  
✅ **Last message** updates instantly  
✅ **Unread indicators** update in real-time  
✅ **Smart unread logic** (not unread if viewing)  
✅ **RLS secured** (only see own bookings)  
✅ **Comprehensive logging** for debugging  
✅ **Works for both travelers and guides**

**Status**: Production ready 🚀
