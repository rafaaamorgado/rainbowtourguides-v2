# Chat Read Status Implementation Summary

## Overview

Implemented Telegram-like read/unread status for Next.js + Supabase chat system with DB as source of truth.

## Database Schema

### `public.booking_reads` table

- `booking_id` (UUID, FK to bookings)
- `user_id` (UUID, FK to profiles)
- `last_read_message_id` (UUID, nullable, FK to messages)
- `last_read_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)
- Primary key: `(booking_id, user_id)`
- RLS enabled with policies for participants only

## Implementation Files

### New Files Created

1. **`lib/chat-types.ts`** - TypeScript types
   - `Message` - Chat message with sender info
   - `BookingRead` - Read status record
   - `BookingChatContext` - Full chat context with both participants' read status
   - `MessageWithReadStatus` - Message with computed read flag

2. **`lib/chat-actions.ts`** - Server actions
   - `upsertBookingRead(bookingId, lastMessageId)` - Mark chat as read
   - `getBookingReads(bookingId)` - Fetch both participants' read status
   - `getUnreadCount(bookingId)` - Get unread count for one booking
   - `getUnreadCounts(bookingIds[])` - Batch fetch unread counts for inbox

3. **`lib/hooks/useBookingReads.ts`** - Realtime read status hook
   - Fetches read status for both participants
   - Subscribes to realtime updates on `booking_reads` table
   - Updates state when recipient reads messages (for double check marks)

4. **`supabase/migrations/create_booking_reads.sql`** - Database migration
   - Creates `booking_reads` table
   - Sets up RLS policies
   - Enables realtime publication
   - Creates indexes and triggers

5. **`CHAT_READ_STATUS_TESTING.md`** - Testing guide
   - Test scenarios for all features
   - Database verification queries
   - Console logging reference
   - Troubleshooting guide

### Modified Files

1. **`types/database.ts`**
   - Added `BookingReadsTable` type
   - Added to `Database['public']['Tables']`

2. **`components/messaging/MessageInbox.tsx`**
   - Removed client-only `unreadBookings` Set heuristic
   - Added `unreadCounts` state (DB-backed)
   - Integrated `useBookingReads` hook
   - Call `upsertBookingRead` when chat opens and when messages load
   - Display unread badge with count in chat list
   - Show single/double check marks based on `recipientRead.last_read_at`
   - Use `getUnreadCounts` server action for initial load

3. **`components/messaging/chat-window.tsx`**
   - Added `recipientId` prop (required)
   - Integrated `useBookingReads` hook
   - Display single/double check marks
   - Call `upsertBookingRead` when messages load

4. **`lib/hooks/useBookingMessagesRealtime.ts`**
   - Import `Message` type from `lib/chat-types` (shared type)

5. **`app/traveler/messages/[threadId]/page.tsx`**
   - Pass `recipientId={bookingData.guide_id}` to ChatWindow

6. **`app/guide/messages/[threadId]/page.tsx`**
   - Pass `recipientId={bookingData.traveler_id}` to ChatWindow

## Business Logic

### Read Status Rules

1. **Single Check Mark (✓)**
   - Message sent successfully (INSERT succeeded)
   - Always shown for sent messages

2. **Double Check Mark (✓✓)**
   - Recipient's `booking_reads.last_read_at` >= `message.created_at`
   - Changes from single to double when recipient opens chat
   - Blue color to indicate read status

3. **Unread Badge**
   - Shows count of messages where:
     - `sender_id != currentUserId`
     - `created_at > myRead.last_read_at`
   - Badge clears when user opens chat
   - Count updates in real-time via background subscription

4. **Mark as Read**
   - Triggered when:
     - User opens chat (after messages load)
     - New messages arrive while chat is open
   - Upserts `booking_reads` with:
     - `last_read_message_id` = last message ID
     - `last_read_at` = NOW()

### Chat Enablement

Chat is only enabled when `booking.status` in:

- `accepted`
- `awaiting_payment`
- `confirmed`
- `completed`

## Realtime Subscriptions

### 1. Messages Subscription (per chat)

- Channel: `booking:{bookingId}:messages`
- Table: `messages`
- Filter: `booking_id=eq.{bookingId}`
- Event: `INSERT`
- Purpose: Receive new messages in real-time

### 2. Booking Reads Subscription (per chat)

- Channel: `booking:{bookingId}:reads`
- Table: `booking_reads`
- Filter: `booking_id=eq.{bookingId}`
- Events: `INSERT`, `UPDATE`, `DELETE`
- Purpose: Update double check marks when recipient reads

### 3. Inbox Background Subscription

- Channel: `inbox:{userId}:messages`
- Table: `messages`
- Event: `INSERT`
- Purpose: Update unread badges for all conversations

## RLS Policies

### `booking_reads` table policies:

1. **SELECT**: Users can read booking_reads for bookings they participate in
2. **INSERT**: Users can insert their own booking_reads if they're a participant
3. **UPDATE**: Users can only update their own booking_reads
4. **DELETE**: Users can only delete their own booking_reads

Ensures:

- Users can't see read status of unrelated bookings
- Users can't spoof read status of other users
- Auth.uid() enforcement on insert/update

## Performance Optimizations

1. **Batch Unread Count Fetching**
   - `getUnreadCounts(bookingIds[])` fetches all counts in single query
   - Reduces N+1 query problem in inbox

2. **Deduplication**
   - Messages deduplicated by ID in `useBookingMessagesRealtime`
   - Prevents duplicate messages from optimistic updates + realtime

3. **Stable Ordering**
   - Messages sorted by `created_at` ascending
   - Consistent across realtime updates

4. **Indexed Queries**
   - Indexes on `booking_id`, `user_id`, `last_read_at`
   - Fast lookups for read status

## Testing Checklist

- [ ] Single check mark appears on sent message
- [ ] Double check mark appears when recipient opens chat
- [ ] Unread badge shows correct count
- [ ] Unread badge clears when opening chat
- [ ] Unread count updates in real-time without refresh
- [ ] Multiple conversations maintain separate unread counts
- [ ] Check marks update in real-time when recipient reads
- [ ] RLS prevents unauthorized access to booking_reads
- [ ] Realtime subscriptions clean up on unmount
- [ ] No console errors or warnings

## Migration Steps

1. Run SQL migration: `supabase/migrations/create_booking_reads.sql`
2. Verify realtime is enabled: `SELECT * FROM pg_publication_tables WHERE tablename = 'booking_reads'`
3. Test read/write permissions with both user roles
4. Monitor Supabase realtime connections in dashboard
5. Deploy frontend changes
6. Test in production with two real users

## Known Limitations

1. Read status is per-booking, not per-message (Telegram-style)
2. No "typing" indicator (out of scope)
3. No "online" status (already implemented separately in MessageInbox)
4. No push notifications for unread messages
5. No read receipts privacy settings

## Future Enhancements

1. Add typing indicators
2. Add message reactions
3. Add message forwarding
4. Add message search
5. Add message deletion (soft delete with tombstones)
6. Add message editing history
7. Add read receipts privacy toggle
8. Add notification preferences per booking
