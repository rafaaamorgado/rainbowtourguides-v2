# Chat Read Status - Quick Reference

## For Developers

### When to Call `upsertBookingRead`

Call when user is actively viewing the chat:

```typescript
import { upsertBookingRead } from '@/lib/chat-actions';

// When user opens chat
await upsertBookingRead(bookingId, lastMessageId);

// When new message arrives while chat is open
useEffect(() => {
  if (chatIsOpen && messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    upsertBookingRead(bookingId, lastMessage.id);
  }
}, [messages, chatIsOpen, bookingId]);
```

### Get Unread Counts for Inbox

```typescript
import { getUnreadCounts } from '@/lib/chat-actions';

const bookingIds = bookings.map((b) => b.id);
const result = await getUnreadCounts(bookingIds);

if (result.success) {
  const unreadMap = result.data; // { bookingId: count }
}
```

### Display Check Marks

```typescript
import { Check, CheckCheck } from 'lucide-react';
import { useBookingReads } from '@/lib/hooks/useBookingReads';

function MessageBubble({ message, currentUserId, recipientId, bookingId }) {
  const { recipientRead } = useBookingReads({
    bookingId,
    currentUserId,
    recipientId,
  });

  const isRead = recipientRead
    ? new Date(recipientRead.last_read_at) >= new Date(message.created_at)
    : false;

  return (
    <div>
      {message.body}
      {message.sender_id === currentUserId && (
        isRead ? <CheckCheck className="text-blue-500" /> : <Check />
      )}
    </div>
  );
}
```

### Display Unread Badge

```typescript
function ChatListItem({ booking, unreadCount }) {
  return (
    <div className="flex items-center">
      <span>{booking.name}</span>
      {unreadCount > 0 && (
        <div className="bg-blue-500 text-white rounded-full px-2 py-1 text-xs">
          {unreadCount}
        </div>
      )}
    </div>
  );
}
```

## Database Queries

### Check read status for a booking

```sql
SELECT
  br.user_id,
  p.full_name,
  br.last_read_at,
  br.last_read_message_id
FROM booking_reads br
JOIN profiles p ON p.id = br.user_id
WHERE br.booking_id = 'YOUR_BOOKING_ID';
```

### Get unread count manually

```sql
SELECT COUNT(*) as unread
FROM messages
WHERE booking_id = 'BOOKING_ID'
  AND sender_id != 'YOUR_USER_ID'
  AND created_at > COALESCE(
    (SELECT last_read_at FROM booking_reads
     WHERE booking_id = 'BOOKING_ID'
     AND user_id = 'YOUR_USER_ID'),
    '1970-01-01'
  );
```

### Mark as read (SQL)

```sql
INSERT INTO booking_reads (booking_id, user_id, last_read_message_id, last_read_at)
VALUES ('BOOKING_ID', 'USER_ID', 'LAST_MSG_ID', NOW())
ON CONFLICT (booking_id, user_id)
DO UPDATE SET
  last_read_message_id = EXCLUDED.last_read_message_id,
  last_read_at = EXCLUDED.last_read_at,
  updated_at = NOW();
```

## API Reference

### Server Actions (`lib/chat-actions.ts`)

#### `upsertBookingRead(bookingId, lastMessageId)`

Marks chat as read up to specified message.

**Parameters:**

- `bookingId: string` - Booking/chat ID
- `lastMessageId: string | null` - Last message read (null if no messages)

**Returns:**

```typescript
Promise<{
  success: boolean;
  error?: string;
  data?: BookingRead;
}>;
```

**Usage:**

```typescript
const result = await upsertBookingRead(bookingId, lastMessageId);
if (result.success) {
  console.log('Marked as read');
}
```

#### `getUnreadCounts(bookingIds)`

Batch fetch unread counts for multiple bookings.

**Parameters:**

- `bookingIds: string[]` - Array of booking IDs

**Returns:**

```typescript
Promise<{
  success: boolean;
  error?: string;
  data?: Record<string, number>; // bookingId -> unread count
}>;
```

**Usage:**

```typescript
const result = await getUnreadCounts(['booking1', 'booking2']);
if (result.success) {
  const count1 = result.data?.['booking1'] || 0;
}
```

### Hooks

#### `useBookingReads({ bookingId, currentUserId, recipientId })`

Manages read status with realtime updates.

**Parameters:**

- `bookingId: string | undefined`
- `currentUserId: string | undefined`
- `recipientId: string | undefined`

**Returns:**

```typescript
{
  myRead: BookingRead | null;
  recipientRead: BookingRead | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

**Usage:**

```typescript
const { recipientRead } = useBookingReads({
  bookingId: selectedBooking?.id,
  currentUserId: user.id,
  recipientId: otherUserId,
});
```

## Types (`lib/chat-types.ts`)

### `Message`

```typescript
interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender?: {
    full_name?: string;
    avatar_url: string | null;
  };
}
```

### `BookingRead`

```typescript
interface BookingRead {
  booking_id: string;
  user_id: string;
  last_read_message_id: string | null;
  last_read_at: string;
  created_at: string;
  updated_at: string;
}
```

### `BookingChatContext`

```typescript
interface BookingChatContext {
  bookingId: string;
  travelerId: string;
  guideId: string;
  currentUserId: string;
  recipientId: string;
  myRead: BookingRead | null;
  recipientRead: BookingRead | null;
}
```

## Console Logging Reference

### Expected Logs

**On chat open:**

```
[useBookingReads] Fetched reads booking=abc123 myRead=2024-02-01T10:00:00Z recipientRead=2024-02-01T09:30:00Z
[useBookingReads] Subscribing booking=abc123
[MessageInbox] Marked as read booking=abc123 lastMsgId=msg789
```

**On new message:**

```
[RT] received INSERT id=msg123 booking=abc123 sender=user456
[RT-Inbox] New message in booking=abc123 sender=user456
[RT-Inbox] Incrementing unread count for booking abc123
```

**On recipient reads:**

```
[useBookingReads] Realtime event=UPDATE user=user456
[useBookingReads] Updated recipientRead: { last_read_at: "2024-02-01T10:05:00Z", ... }
```

## Troubleshooting

### Check marks not updating

1. Verify realtime subscription: Look for `[useBookingReads] Subscription status=SUBSCRIBED`
2. Check RLS policies allow reading booking_reads
3. Verify recipientId is correct

### Unread counts incorrect

1. Check if booking_reads entry exists: `SELECT * FROM booking_reads WHERE booking_id = 'X' AND user_id = 'Y'`
2. Verify timezone handling (all should be UTC)
3. Check for clock skew between client/server

### Realtime not working

1. Verify table is in publication: `SELECT * FROM pg_publication_tables WHERE tablename = 'booking_reads'`
2. Check Supabase dashboard for realtime connections
3. Look for CHANNEL_ERROR in console logs

## Common Patterns

### Pattern 1: Mark as read on visibility change

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      upsertBookingRead(bookingId, lastMsg.id);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () =>
    document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [bookingId, messages]);
```

### Pattern 2: Optimistic unread count decrement

```typescript
// Don't wait for server - update UI immediately
setUnreadCounts((prev) => ({
  ...prev,
  [bookingId]: 0,
}));

// Then sync with server
await upsertBookingRead(bookingId, lastMessageId);
```

### Pattern 3: Batch process inbox updates

```typescript
// Fetch unread counts for all bookings at once
const bookingIds = bookings.map((b) => b.id);
const { data: counts } = await getUnreadCounts(bookingIds);

// Update state once
setUnreadCounts(counts || {});
```
