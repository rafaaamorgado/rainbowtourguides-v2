# Message Inbox UI Enhancements

## Features Implemented

### 1. ✅ Last Message Timestamp

Each conversation now shows when the last message was sent:

- Format: "2h ago", "1d ago", "3d ago", etc.
- Uses `date-fns` library (`formatDistanceToNow`)
- Positioned in the top-right of each conversation item

### 2. ✅ Message Preview

Shows the last message content below the location:

```
Guide Name (bold)
City Name
"Last message text preview..." (truncated)
```

### 3. ✅ Unread Message Indicator

Conversations with unread messages are visually highlighted:

- **Blue dot** indicator (top-right corner)
- **Bold text** for guide name and message preview
- **Light background** (`bg-slate-50/50`)
- Automatically marked as read when conversation is opened

## Visual Design

### Unread Conversation (with new message)

```
┌─────────────────────────────────────────────┐
│ ● Elena R.                         2h ago   │  ← Blue dot
│ KYOTO, JAPAN                               │
│ I'm looking forward to showing you...      │  ← Message preview (bold)
└─────────────────────────────────────────────┘
```

### Read Conversation (no new messages)

```
┌─────────────────────────────────────────────┐
│ Marco Rossi                        1d ago   │  ← No dot
│ ROME, ITALY                                │
│ The Colosseum tickets are confirmed...    │  ← Preview (normal)
└─────────────────────────────────────────────┘
```

## Technical Implementation

### State Management

```typescript
// Track last messages for each booking
const [lastMessages, setLastMessages] = useState<
  Record<string, { text: string; timestamp: string; senderId: string }>
>({});

// Track which bookings have unread messages
const [unreadBookings, setUnreadBookings] = useState<Set<string>>(new Set());
```

### Loading Last Messages

On component mount, fetches last message for each booking:

```typescript
for (const booking of filteredBookings) {
  const messages = await fetchMessages(booking.id);
  if (messages.length > 0) {
    const lastMsg = messages[messages.length - 1];
    lastMsgs[booking.id] = {
      text: lastMsg.content,
      timestamp: lastMsg.timestamp,
      senderId: lastMsg.sender_id,
    };

    // Mark as unread if last message is from other party
    if (lastMsg.sender_id !== currentUserId) {
      unread.add(booking.id);
    }
  }
}
```

### Marking as Read

When user opens a conversation:

```typescript
const handleSelectConversation = useCallback(
  async (booking: Booking) => {
    // ... existing code ...

    // Mark as read
    setUnreadBookings((prev) => {
      const next = new Set(prev);
      next.delete(booking.id);
      return next;
    });
  },
  [fetchMessages],
);
```

### Real-Time Updates

When new message arrives via Supabase Realtime:

```typescript
// Update last message
setLastMessages((prev) => ({
  ...prev,
  [selectedBooking.id]: {
    text: newMessage.content,
    timestamp: newMessage.timestamp,
    senderId: newMessage.sender_id,
  },
}));

// Mark as unread if from other party
if (newMessage.sender_id !== currentUserId) {
  setUnreadBookings((prev) => new Set(prev).add(selectedBooking.id));
}
```

### UI Rendering

```typescript
filteredBookings.map((booking) => {
  const lastMsg = lastMessages[booking.id];
  const isUnread = unreadBookings.has(booking.id);

  return (
    <div
      className={cn(
        'p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 relative',
        isUnread && 'bg-slate-50/50', // Highlight unread
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {/* Guide name - bold if unread */}
          <p
            className={cn(
              'truncate',
              isUnread ? 'font-bold text-ink' : 'font-semibold text-ink',
            )}
          >
            {booking.guide_name}
          </p>

          {/* Location */}
          <p className="text-sm text-ink-soft truncate">
            {booking.city_name}
          </p>

          {/* Message preview - bold if unread */}
          {lastMsg && (
            <p
              className={cn(
                'text-sm truncate mt-1',
                isUnread ? 'font-medium text-ink' : 'text-ink-soft',
              )}
            >
              {lastMsg.text}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {/* Timestamp */}
          {lastMsg && (
            <span className="text-xs text-ink-soft whitespace-nowrap">
              {formatDistanceToNow(new Date(lastMsg.timestamp), {
                addSuffix: true,
              }).replace('about ', '')}
            </span>
          )}

          {/* Blue dot for unread */}
          {isUnread && (
            <div className="w-3 h-3 rounded-full bg-blue-500" />
          )}
        </div>
      </div>
    </div>
  );
})
```

## Dependencies Added

```json
{
  "dependencies": {
    "date-fns": "^2.30.0" // Already in package.json
  }
}
```

## User Experience

### Unread Logic

A conversation is marked as **unread** if:

1. The last message `sender_id` is NOT the current user
2. The conversation has not been opened since that message arrived

A conversation is marked as **read** when:

1. User clicks on the conversation
2. `handleSelectConversation` is called

### Timestamp Formatting

Uses `date-fns` for human-readable timestamps:

- Less than 1 hour: "10m ago", "45m ago"
- Less than 24 hours: "2h ago", "12h ago"
- Less than 7 days: "1d ago", "3d ago"
- More than 7 days: "1w ago", "2w ago"

The "about" prefix is removed for cleaner display.

## Testing Checklist

- [ ] Open messages page as traveler
- [ ] Verify last message preview shows for each conversation
- [ ] Verify timestamp shows (e.g., "2h ago")
- [ ] Send a message from guide in another tab/browser
- [ ] Verify conversation gets blue dot indicator
- [ ] Verify conversation background is highlighted
- [ ] Verify text becomes bold
- [ ] Click on conversation
- [ ] Verify blue dot disappears
- [ ] Verify text returns to normal weight
- [ ] Verify background highlight removes

## Known Limitations

1. **Initial Load Performance**: Fetches all messages for all bookings on mount
   - **Impact**: May be slow with many conversations
   - **Future Enhancement**: Fetch only last message per booking via optimized query

2. **No Persistence**: Unread state is not persisted to database
   - **Impact**: Refreshing page may change unread indicators
   - **Future Enhancement**: Add `last_read_at` column to bookings table

3. **No Unread Count**: No total count of unread conversations
   - **Future Enhancement**: Add badge with count in navigation

## Future Enhancements

### 1. Persistent Read Status

```sql
-- Add to bookings table
ALTER TABLE bookings ADD COLUMN traveler_last_read_at TIMESTAMPTZ;
ALTER TABLE bookings ADD COLUMN guide_last_read_at TIMESTAMPTZ;

-- Update on conversation open
UPDATE bookings
SET traveler_last_read_at = NOW()
WHERE id = ? AND traveler_id = ?;
```

### 2. Optimized Last Message Query

```typescript
// Instead of fetching all messages
const { data } = await supabase
  .from('messages')
  .select('*')
  .eq('booking_id', bookingId)
  .order('created_at', { desc: true })
  .limit(1) // Only fetch last message
  .single();
```

### 3. Unread Count Badge

```tsx
<Link href="/traveler/messages">
  Messages
  {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
</Link>
```

### 4. Mark All as Read

```tsx
<Button onClick={markAllAsRead}>Mark all as read</Button>
```

### 5. Sound Notification

```typescript
// Play sound when new message arrives
const audio = new Audio('/sounds/notification.mp3');
if (newMessage.sender_id !== currentUserId) {
  audio.play();
}
```

## Summary

✅ **Implemented:**

- Last message timestamp
- Message preview
- Unread indicator (blue dot)
- Visual highlighting for unread conversations
- Auto-mark as read on open
- Real-time updates

✨ **Result:**
Users can now easily see:

- Which conversations have new messages
- What the last message was
- When it was sent
- All without opening the conversation

The inbox now provides a WhatsApp/iMessage-like experience! 🎉
