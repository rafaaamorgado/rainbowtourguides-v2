# Real-Time Chat System Implementation

## Overview

The chat system enables real-time messaging between travelers and guides for approved bookings. Messages are stored in the `public.messages` table and are grouped by `booking_id`.

## Architecture

### Database Schema

**Messages Table** (`public.messages`):

- `id` (uuid, primary key)
- `booking_id` (uuid, foreign key → bookings.id)
- `sender_id` (uuid, foreign key → profiles.id)
- `body` (text, message content)
- `created_at` (timestamptz)

**Bookings Table** (`public.bookings`):

- `id` (uuid)
- `traveler_id` (uuid → profiles.id)
- `guide_id` (uuid → guides.id → profiles.id)
- `status` (booking_status enum)
- ... other fields

### Row Level Security (RLS)

**Messages RLS Policies**:

1. **messages_participants_read**: Users can SELECT messages only if they are the traveler or guide of the booking
2. **messages_participants_send**: Users can INSERT only if:
   - `auth.uid()` = `sender_id`
   - User is a participant (traveler or guide)
   - Booking status is one of: `accepted`, `awaiting_payment`, `confirmed`, `completed`

### Booking Status Flow

Chat becomes available when booking reaches these statuses:

1. **accepted** - Guide has accepted the booking request
2. **awaiting_payment** - Waiting for traveler to complete payment
3. **confirmed** - Payment completed, booking confirmed
4. **completed** - Tour has been completed

Chat is **NOT available** for:

- `draft` - Booking in creation
- `pending` - Awaiting guide response
- `declined` - Guide declined the booking
- `cancelled_by_traveler` - Traveler cancelled
- `cancelled_by_guide` - Guide cancelled

## API Reference

### Server-Side Functions (`lib/chat-api.ts`)

#### `getChatMessages(bookingId, limit?)`

Fetches messages for a booking, ordered by creation time ascending.

```typescript
const messages = await getChatMessages(bookingId, 50);
```

**Returns**: `Message[]`

#### `sendChatMessage(bookingId, senderId, body)`

Sends a new message. Enforces RLS policies.

```typescript
const result = await sendChatMessage(bookingId, userId, 'Hello!');

if (result.success) {
  console.log('Message sent:', result.data);
} else {
  console.error('Error:', result.error);
}
```

**Returns**: `ChatOperationResult<Message>`

#### `getBookingChatContext(bookingId)`

Fetches booking details and participant profiles for chat UI.

```typescript
const context = await getBookingChatContext(bookingId);

if (context) {
  console.log('Traveler:', context.travelerProfile.name);
  console.log('Guide:', context.guideProfile.name);
  console.log('Status:', context.status);
}
```

**Returns**: `BookingChatContext | null`

#### `canAccessChat(bookingId, userId)`

Checks if user has access to chat for this booking.

```typescript
const hasAccess = await canAccessChat(bookingId, userId);
```

**Returns**: `boolean`

### Server Actions (`components/messaging/message-actions.ts`)

#### `sendMessageAction(bookingId, senderId, body)`

Client-callable Server Action for sending messages.

```typescript
const result = await sendMessageAction(bookingId, currentUserId, messageText);

if (result.success) {
  // Message sent successfully
} else {
  // Show error: result.error
}
```

**Returns**: `SendMessageResult`

### Utility Functions

#### `isMessagingEnabled(status)` (`lib/messaging-rules.ts`)

Checks if messaging is enabled for a booking status.

```typescript
if (isMessagingEnabled(booking.status)) {
  // Show chat UI
} else {
  // Show locked state
}
```

**Returns**: `boolean`

## UI Components

### `MessageInbox` (`components/messaging/MessageInbox.tsx`)

Main messaging UI component for guide and traveler dashboards.

**Features**:

- List of conversations (bookings with messages enabled)
- Real-time message updates via Supabase subscriptions
- Message sending with error handling
- Responsive mobile/desktop layout
- Locked state for bookings not yet accepted

**Usage**:

```tsx
import MessageInbox from '@/components/messaging/MessageInbox';
import { getBookings, getMessages } from '@/lib/data-service';

<MessageInbox
  userRole="traveler"
  fetchMessages={getMessages}
  fetchBookings={getBookings}
  currentUserId={user.id}
/>;
```

### `ChatWindow` (`components/messaging/chat-window.tsx`)

Alternative standalone chat window component (optional).

## Real-Time Updates

The chat system uses Supabase Realtime to subscribe to new messages:

```typescript
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
      // New message received
      const newMessage = payload.new;
      setMessages((prev) => [...prev, newMessage]);
    },
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

## Error Handling

### RLS Policy Errors

If a user tries to send a message when the booking is not in an approved state:

```typescript
const result = await sendChatMessage(bookingId, userId, body);

if (!result.success && result.error) {
  // Show: "Chat is not available until booking is accepted."
}
```

### Empty Message Validation

```typescript
if (!messageText.trim()) {
  // Don't allow sending empty messages
  return;
}
```

### Network Errors

```typescript
try {
  const result = await sendMessageAction(bookingId, userId, text);
  // Handle result
} catch (error) {
  // Show: "An unexpected error occurred"
}
```

## Integration Example

### Guide Messages Page

```typescript
// app/guide/messages/page.tsx
import MessageInbox from '@/components/messaging/MessageInbox';
import { getBookings, getMessages } from '@/lib/data-service';
import { requireRole } from '@/lib/auth-helpers';

export default async function GuideMessagesPage() {
  const { user } = await requireRole('guide');

  return (
    <MessageInbox
      userRole="guide"
      fetchMessages={getMessages}
      fetchBookings={getBookings}
      currentUserId={user.id}
    />
  );
}
```

### Traveler Messages Page

```typescript
// app/traveler/messages/page.tsx
import MessageInbox from '@/components/messaging/MessageInbox';
import { getBookings, getMessages } from '@/lib/data-service';
import { requireRole } from '@/lib/auth-helpers';

export default async function TravelerMessagesPage() {
  const { user } = await requireRole('traveler');

  return (
    <MessageInbox
      userRole="traveler"
      fetchMessages={getMessages}
      fetchBookings={getBookings}
      currentUserId={user.id}
    />
  );
}
```

## Testing

### Test Scenarios

1. **Chat Access Control**:
   - ✅ Traveler can only see their own bookings
   - ✅ Guide can only see bookings assigned to them
   - ✅ Chat is locked until booking is accepted

2. **Message Sending**:
   - ✅ Send message when booking is accepted
   - ✅ Send message when booking is confirmed
   - ✅ Send message when booking is completed
   - ❌ Cannot send when booking is pending (RLS blocks)
   - ❌ Cannot send when booking is declined (RLS blocks)

3. **Real-Time Updates**:
   - ✅ New messages appear without refresh
   - ✅ Messages from other participant show in real-time
   - ✅ Subscription cleans up on unmount

4. **Error Handling**:
   - ✅ Empty messages are blocked
   - ✅ RLS errors show user-friendly message
   - ✅ Network errors are caught and displayed

### Manual Testing Steps

1. **As Traveler**:

   ```
   - Create a booking
   - Verify chat is locked (status: pending)
   - Wait for guide to accept
   - Verify chat opens (status: accepted)
   - Send a message
   - Verify message appears
   ```

2. **As Guide**:
   ```
   - Accept a booking
   - Navigate to Messages
   - Open conversation
   - Send a message
   - Verify traveler receives it in real-time
   ```

## Performance Considerations

### Message Pagination

Current implementation fetches the last 50 messages. For high-volume chats, implement cursor-based pagination:

```typescript
// Future enhancement
export async function getChatMessages(
  bookingId: string,
  limit: number = 50,
  before?: string, // cursor (created_at timestamp)
) {
  // ... implementation
}
```

### Realtime Subscription Optimization

- Subscriptions are created per conversation
- Cleanup happens on component unmount
- Only subscribe when a conversation is selected

### Database Indexes

Ensure indexes exist for optimal query performance:

```sql
CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_bookings_traveler_id ON bookings(traveler_id);
CREATE INDEX idx_bookings_guide_id ON bookings(guide_id);
```

## Security Considerations

### RLS Enforcement

All chat operations rely on RLS policies. Never bypass RLS unless using service role key for admin operations.

### XSS Prevention

Message content is rendered as plain text (not HTML) to prevent XSS attacks. Use proper escaping if adding rich text features.

### Rate Limiting

Consider implementing rate limiting for message sending to prevent spam:

```typescript
// Future enhancement: track message count per user per minute
```

## Migration Notes

### Removed Mock Data

The following mock data has been replaced with real database queries:

- `MOCK_MESSAGES` in `lib/mock-data.ts` (still exists but unused)
- Hardcoded messages in `MessageInbox` component

### Breaking Changes

1. **Message field name**: Changed from `text` to `body` (database schema)
2. **Booking status enum**: Added new statuses: `awaiting_payment`, `cancelled_by_traveler`, `cancelled_by_guide`
3. **Messaging enabled statuses**: Changed from `[confirmed, completed]` to `[accepted, awaiting_payment, confirmed, completed]`

## Future Enhancements

1. **Message Pagination**: Load older messages on scroll
2. **Typing Indicators**: Show when other user is typing
3. **Read Receipts**: Mark messages as read
4. **File Attachments**: Support image/file sharing
5. **Push Notifications**: Notify users of new messages
6. **Message Search**: Search within conversation
7. **Message Reactions**: Add emoji reactions to messages
