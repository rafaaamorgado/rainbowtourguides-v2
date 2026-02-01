# Chat System Quick Reference

## For Developers

### Import Paths

```typescript
// Server-side API
import {
  getChatMessages,
  sendChatMessage,
  getBookingChatContext,
  canAccessChat,
} from '@/lib/chat-api';

// Client components
import MessageInbox from '@/components/messaging/MessageInbox';
import { ChatWindow } from '@/components/messaging/chat-window';

// Server actions
import { sendMessageAction } from '@/components/messaging/message-actions';

// Utilities
import { isMessagingEnabled } from '@/lib/messaging-rules';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// Existing data service
import { getMessages, getBookings } from '@/lib/data-service';
```

### Quick Usage Examples

#### 1. Add Chat to a Page (Server Component)

```typescript
// app/guide/messages/page.tsx
import MessageInbox from '@/components/messaging/MessageInbox';
import { getBookings, getMessages } from '@/lib/data-service';
import { requireRole } from '@/lib/auth-helpers';

export default async function MessagesPage() {
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

#### 2. Check if Chat is Available

```typescript
import { isMessagingEnabled } from '@/lib/messaging-rules';

if (isMessagingEnabled(booking.status)) {
  // Show chat UI
} else {
  // Show locked state
}

// Returns true for: accepted, awaiting_payment, confirmed, completed
// Returns false for: draft, pending, declined, cancelled_*
```

#### 3. Send a Message (Client Component)

```typescript
'use client';

import { sendMessageAction } from '@/components/messaging/message-actions';

async function handleSend() {
  const result = await sendMessageAction(bookingId, userId, messageText);

  if (result.success) {
    // Success! Message sent
    setInput('');
  } else {
    // Show error
    alert(result.error);
  }
}
```

#### 4. Load Messages (Server Component)

```typescript
import { getChatMessages } from '@/lib/chat-api';

const messages = await getChatMessages(bookingId);
// Returns: Message[] ordered by created_at ascending
```

#### 5. Set Up Realtime Subscription (Client Component)

```typescript
'use client';

import { useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

const supabase = createSupabaseBrowserClient();

useEffect(() => {
  if (!supabase || !bookingId) return;

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
        const newMessage = payload.new;
        setMessages((prev) => [...prev, newMessage]);
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [supabase, bookingId]);
```

#### 6. Get Booking Context

```typescript
import { getBookingChatContext } from '@/lib/chat-api';

const context = await getBookingChatContext(bookingId);

if (context) {
  console.log('Status:', context.status);
  console.log('Traveler:', context.travelerProfile.name);
  console.log('Guide:', context.guideProfile.name);
}
```

### Database Schema Reference

```sql
-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id),
  sender_id uuid NOT NULL REFERENCES profiles(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes (recommended)
CREATE INDEX idx_messages_booking_id ON messages(booking_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

### TypeScript Types

```typescript
// Message type (from lib/mock-data.ts)
interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_name: string;
  content: string; // Adapted from 'body' field
  timestamp: string;
}

// Booking status enum (from types/database.ts)
type BookingStatus =
  | 'draft'
  | 'pending'
  | 'accepted'
  | 'awaiting_payment'
  | 'confirmed'
  | 'declined'
  | 'cancelled_by_traveler'
  | 'cancelled_by_guide'
  | 'completed';

// BookingChatContext (from lib/chat-api.ts)
interface BookingChatContext {
  bookingId: string;
  status: string;
  travelerId: string;
  guideId: string;
  travelerProfile: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  guideProfile: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  cityName: string;
  startAt: string;
  durationHours: number;
}

// ChatOperationResult (from lib/chat-api.ts)
interface ChatOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### RLS Policies (Database)

```sql
-- Read messages (SELECT)
CREATE POLICY messages_participants_read ON messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id
        AND (b.traveler_id = auth.uid() OR b.guide_id = auth.uid())
    )
  );

-- Send messages (INSERT)
CREATE POLICY messages_participants_send ON messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM bookings b
      WHERE b.id = booking_id
        AND (b.traveler_id = auth.uid() OR b.guide_id = auth.uid())
        AND b.status IN ('accepted', 'awaiting_payment', 'confirmed', 'completed')
    )
  );
```

### Common Patterns

#### Pattern: Check Access Before Showing Chat

```typescript
import { canAccessChat } from '@/lib/chat-api';
import { requireUser } from '@/lib/auth-helpers';

export default async function BookingDetailPage({ params }) {
  const { user } = await requireUser();
  const hasAccess = await canAccessChat(params.bookingId, user.id);

  if (!hasAccess) {
    return <div>You don't have access to this chat</div>;
  }

  return <ChatUI bookingId={params.bookingId} userId={user.id} />;
}
```

#### Pattern: Show Locked State for Pending Bookings

```tsx
import { isMessagingEnabled } from '@/lib/messaging-rules';
import { Lock } from 'lucide-react';

{
  !isMessagingEnabled(booking.status) ? (
    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
      <Lock className="h-5 w-5" />
      <p>Chat will open after the guide accepts your booking</p>
    </div>
  ) : (
    <ChatInput onSend={handleSend} />
  );
}
```

#### Pattern: Error Handling

```typescript
const result = await sendChatMessage(bookingId, userId, body);

if (!result.success) {
  if (result.error?.includes('not available')) {
    // RLS policy blocked - booking not approved
    showError('Chat is not available for this booking');
  } else {
    // Generic error
    showError('Failed to send message. Please try again.');
  }
}
```

### Troubleshooting

#### Issue: Messages not appearing

**Check:**

1. RLS policies are enabled on `messages` table
2. Booking status is one of: accepted, awaiting_payment, confirmed, completed
3. User is traveler or guide of the booking
4. Realtime subscription is active (check browser console)

**Debug:**

```typescript
// Check if messaging is enabled
console.log('Messaging enabled:', isMessagingEnabled(booking.status));

// Check subscription
console.log('Supabase client:', supabase);
console.log('Channel state:', channel);

// Check RLS
const hasAccess = await canAccessChat(bookingId, userId);
console.log('Has access:', hasAccess);
```

#### Issue: "Chat not available" error

**Cause:** Booking status is not in approved list

**Solution:**

```typescript
// Check current status
const context = await getBookingChatContext(bookingId);
console.log('Current status:', context?.status);

// Verify status is one of: accepted, awaiting_payment, confirmed, completed
if (!isMessagingEnabled(context?.status || '')) {
  // Guide needs to accept the booking first
}
```

#### Issue: Realtime not working

**Check:**

1. Supabase Realtime is enabled in project settings
2. Browser client is created: `createSupabaseBrowserClient()`
3. Subscription filter matches: `booking_id=eq.${bookingId}`
4. Cleanup function removes channel on unmount

**Debug:**

```typescript
const channel = supabase.channel(`test-${bookingId}`);
channel.subscribe((status) => {
  console.log('Subscription status:', status);
  // Should see: 'SUBSCRIBED'
});
```

### Testing Checklist

- [ ] Traveler can send message when booking is accepted
- [ ] Guide can send message when booking is accepted
- [ ] Messages appear in real-time for both users
- [ ] Chat is locked when booking is pending
- [ ] Cannot send message when booking is declined
- [ ] Empty messages are blocked
- [ ] Error messages are user-friendly
- [ ] Subscription cleans up on unmount
- [ ] Messages are ordered by time
- [ ] Sender name and avatar display correctly

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only
```

### Useful Commands

```bash
# Run development server
npm run dev

# Check for linting errors
npm run lint

# Build for production
npm run build

# Check TypeScript types
npx tsc --noEmit
```

### Related Documentation

- [CHAT_SYSTEM.md](./CHAT_SYSTEM.md) - Full implementation guide
- [CHAT_IMPLEMENTATION_SUMMARY.md](./CHAT_IMPLEMENTATION_SUMMARY.md) - Summary of changes
- [CHAT_DATA_FLOW.md](./CHAT_DATA_FLOW.md) - Data flow diagrams
- [CLAUDE.md](../CLAUDE.md) - Project architecture overview
- [SECURITY.md](../SECURITY.md) - Security best practices
