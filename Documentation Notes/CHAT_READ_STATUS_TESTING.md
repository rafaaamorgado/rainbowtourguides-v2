# Chat Read Status Testing Guide

This guide helps you test the Telegram-like read/unread status implementation.

## Setup

1. **Run the migration**:

   ```sql
   -- Run the SQL from supabase/migrations/create_booking_reads.sql
   -- in your Supabase SQL Editor
   ```

2. **Verify realtime is enabled**:
   ```sql
   -- Check if booking_reads is in realtime publication
   SELECT * FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime'
   AND tablename = 'booking_reads';
   ```

## Test Scenarios

### Test 1: Single Check Mark (Message Sent)

**Setup**: Two users with an active booking in `accepted`, `awaiting_payment`, `confirmed`, or `completed` status.

**Steps**:

1. User A opens the chat with User B
2. User A sends a message "Hello"
3. **Expected**: Message shows single check mark ✓

**Verify**:

- Check browser console for: `[upsertBookingRead] Success booking=...`
- Message displays with single check mark
- No errors in console

### Test 2: Double Check Mark (Message Read)

**Steps**:

1. User A sends message "Hello" to User B
2. User A sees single check mark ✓
3. User B opens the chat with User A
4. **Expected**: User A now sees double check mark ✓✓ (blue)

**Verify**:

- User B console shows: `[upsertBookingRead] Success`
- User A sees check mark change from single ✓ to double ✓✓
- Check realtime logs: `[useBookingReads] Realtime event=UPDATE`

### Test 3: Unread Badge in Chat List

**Steps**:

1. User A sends 3 messages to User B
2. User B is on inbox page (NOT in chat with User A)
3. **Expected**: User B sees unread badge with number "3" next to User A's chat

**Verify**:

- Badge displays correct count
- Badge is blue circular with white text
- Count updates in real-time when new messages arrive

### Test 4: Unread Badge Clears on Open

**Steps**:

1. User B has unread messages from User A (badge shows "3")
2. User B clicks on User A's chat
3. **Expected**: Badge disappears immediately

**Verify**:

- Badge clears when chat opens
- `booking_reads` table updated with current timestamp
- Console shows: `[MessageInbox] Marked as read`

### Test 5: Real-time Unread Count Update

**Setup**: Two browser windows side-by-side

**Steps**:

1. Window 1: User A in inbox
2. Window 2: User B sends message to User A
3. **Expected**: Window 1 immediately shows unread badge "1"

**Verify**:

- Badge appears without page refresh
- Console shows: `[RT-Inbox] Incrementing unread count`
- Badge count increments with each new message

### Test 6: Multiple Conversations

**Steps**:

1. User A has chats with User B, User C, User D
2. Each user sends messages to User A
3. **Expected**: Each chat shows correct unread count independently

**Verify**:

- Unread counts are accurate per conversation
- Counts don't interfere with each other
- Opening one chat doesn't affect others' unread status

## Database Verification

### Check booking_reads entries

```sql
-- View all read statuses for a specific booking
SELECT
  br.*,
  p.full_name as user_name
FROM booking_reads br
JOIN profiles p ON p.id = br.user_id
WHERE br.booking_id = 'YOUR_BOOKING_ID';
```

### Check unread messages count

```sql
-- Count unread messages for a user in a booking
SELECT COUNT(*) as unread_count
FROM messages m
WHERE m.booking_id = 'YOUR_BOOKING_ID'
  AND m.sender_id != 'YOUR_USER_ID'
  AND m.created_at > (
    SELECT last_read_at
    FROM booking_reads
    WHERE booking_id = 'YOUR_BOOKING_ID'
    AND user_id = 'YOUR_USER_ID'
  );
```

### Verify RLS policies

```sql
-- Test as traveler
SET request.jwt.claims.sub = 'TRAVELER_USER_ID';

-- Should return only their booking_reads
SELECT * FROM booking_reads;

-- Should be able to insert/update own read status
INSERT INTO booking_reads (booking_id, user_id, last_read_at)
VALUES ('BOOKING_ID', 'TRAVELER_USER_ID', NOW())
ON CONFLICT (booking_id, user_id)
DO UPDATE SET last_read_at = NOW();
```

## Console Logging

Watch for these log messages to verify correct behavior:

### On chat open:

```
[useBookingReads] Fetched reads booking=... myRead=... recipientRead=...
[useBookingReads] Subscribing booking=...
[MessageInbox] Marked as read booking=... lastMsgId=...
```

### On new message received:

```
[RT] received INSERT id=... booking=... sender=...
[RT-Inbox] New message in booking=... sender=...
[RT-Inbox] Incrementing unread count for booking ...
```

### On recipient reads message:

```
[useBookingReads] Realtime event=UPDATE user=...
[useBookingReads] Updated recipientRead: {...}
```

## Common Issues

### Issue: Double check marks never appear

**Cause**: Realtime not working for booking_reads table
**Fix**: Run `ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_reads;`

### Issue: Unread counts wrong

**Cause**: Clock skew or timezone issues
**Fix**: Ensure all timestamps use UTC (TIMESTAMPTZ type)

### Issue: RLS errors when inserting

**Cause**: User not a participant in booking
**Fix**: Verify booking.traveler_id or booking.guide_id matches auth.uid()

### Issue: Check marks not updating in real-time

**Cause**: useBookingReads hook not subscribed
**Fix**: Check console for subscription status logs

## Performance Notes

- Unread counts are fetched in batch for inbox (one query for all bookings)
- Realtime subscriptions are per-booking (one channel per open chat)
- booking_reads upserts are debounced by chat focus/visibility
- Messages are deduplicated by ID to prevent duplicates from realtime + optimistic updates

## Next Steps

After testing:

1. Monitor Supabase realtime connections in dashboard
2. Check for slow queries in Supabase logs
3. Add indexes if needed for large message volumes
4. Consider cleanup job for old booking_reads entries
