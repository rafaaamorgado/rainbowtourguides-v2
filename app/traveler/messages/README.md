# Traveler Messages Page

Two-column messaging UI inspired by WhatsApp/iMessage for chatting with guides.

## Layout Structure

### Two-Column Layout
```
┌────────────────────────────────────────┐
│ Sidebar (w-80) │  Message Thread      │
│                │                       │
│ - Search       │  Header               │
│ - Conversations│  ───────────────────  │
│                │  Message Thread       │
│                │  (scrollable)         │
│                │  ───────────────────  │
│                │  Input Area           │
└────────────────────────────────────────┘
```

## Left Sidebar (Conversation List)

### Header
- Title: "Messages"
- Search input with icon
- Placeholder: "Search conversations..."

### Conversation Cards
Each conversation displays:
- **Guide Photo**: 12×12 rounded-full with gradient fallback
- **Guide Name**: Font semibold
- **City**: Small text below name
- **Last Message**: Truncated to 1 line
- **Timestamp**: Relative time ("2h ago")
- **Unread Badge**: Red badge with count (if unread)

### States
- **Active**: `bg-brand/10` (red tint)
- **Hover**: `bg-slate-50`
- **Default**: White background

### Search
Filters conversations by:
- Guide name
- City name

## Right Panel (Message Thread)

### Empty State (No Selection)
Shows when no conversation is selected:
- Icon: MessageSquare
- Title: "Select a conversation"
- Description: "Choose a conversation from the left..."

### Header (When Selected)
- **Back Button**: Mobile only (arrow-left icon)
- **Guide Photo**: 10×10 rounded-full
- **Guide Name**: Semibold
- **Booking Reference**: "Booking #123"
- **View Details Link**: External link icon

### Message Thread
**Date Dividers**: 
- Centered text with lines on sides
- Format: "January 15, 2026"

**Message Bubbles**:
- **From Traveler (You)**:
  - Aligned right
  - Background: `bg-brand` (red)
  - Text: White
  - Max width: `max-w-md`
  - Rounded: `rounded-2xl`

- **From Guide**:
  - Aligned left
  - Background: White with border
  - Text: `text-ink`
  - Max width: `max-w-md`
  - Rounded: `rounded-2xl`

**Timestamp**:
- Below each message
- Format: "3:45 PM"
- Color: `text-white/70` (yours) or `text-ink-soft` (theirs)

**Auto-scroll**:
- Scrolls to bottom on load
- Scrolls to bottom when new message added

### Input Area
- **Textarea**: 2 rows, auto-resize
- **Placeholder**: "Type your message..."
- **Character Limit**: 500 characters
- **Character Counter**: "X/500 characters"
- **Send Button**: Primary button with Send icon
- **Disabled**: When input is empty
- **Enter Key**: Sends message (Shift+Enter for new line)

## Mobile Responsive

### Breakpoint: `lg` (1024px)

### Mobile Behavior
- **Conversation List**: Full width by default
- **Selected Conversation**: Hides sidebar, shows thread
- **Back Button**: Appears in thread header
- **Navigation**: Back button returns to conversation list

### Desktop Behavior
- **Two Columns**: Always visible
- **No Back Button**: Not needed
- **Fixed Width Sidebar**: 320px (w-80)
- **Flexible Thread**: Takes remaining space

## Functionality

### Data Fetching
```typescript
// Fetch bookings with conversations
const bookings = await getBookings(userId, "traveler");

// Filter to active bookings only
const conversations = bookings.filter(b => 
  b.status === "confirmed" || 
  b.status === "accepted" || 
  b.status === "completed"
);

// Fetch messages for selected booking
const messages = await getMessages(bookingId);
```

### URL Parameter
Supports `?booking=[id]` parameter:
- Auto-selects conversation on page load
- Used when clicking "Message" from bookings page

### Send Message (Mock)
Currently shows alert: "Messaging coming soon!"

**Future Implementation**:
```typescript
await sendMessage({
  booking_id: selectedBooking.id,
  sender_id: currentUserId,
  content: messageInput,
});
```

### Message Grouping
Messages grouped by date:
```typescript
{
  "January 15, 2026": [message1, message2],
  "January 16, 2026": [message3, message4],
}
```

## Brand Consistency

### Colors
- **Your Messages**: Brand red background
- **Their Messages**: White background with border
- **Active Conversation**: Brand red tint (10% opacity)
- **Hover**: Slate gray (50)

### Typography
- **Names**: Font semibold
- **Messages**: Text small, leading relaxed
- **Timestamps**: Extra small, muted

### Spacing
- **Sidebar Padding**: `p-4`
- **Thread Padding**: `p-6`
- **Input Padding**: `p-4`
- **Message Spacing**: `space-y-6` (groups), `space-y-4` (messages)

### Borders & Shadows
- Sidebar border: `border-r border-slate-200`
- Header border: `border-b border-slate-200`
- Input border: `border-t border-slate-200`
- Message bubble: `rounded-2xl`

## Empty States

### No Conversations
- Icon: MessageSquare
- Title: "No conversations"
- Description: "You don't have any active conversations yet."

### No Messages in Thread
- Icon: MessageSquare (larger)
- Text: "No messages yet. Start the conversation!"

## Accessibility

- Semantic HTML structure
- Keyboard navigation (Enter to send)
- Screen reader friendly labels
- Focus visible states
- High contrast text
- Touch targets ≥ 44px

## Performance

- Client component for interactivity
- Auto-scroll with useRef
- Efficient filtering with useMemo (could be added)
- Lazy loading for long message lists (future)

## Future Enhancements

1. **Real-time Updates**: WebSocket for live messages
2. **Read Receipts**: Show when guide has read
3. **Typing Indicators**: "Guide is typing..."
4. **Image Sharing**: Send photos/attachments
5. **Message Reactions**: Like/emoji reactions
6. **Voice Messages**: Record and send audio
7. **Message Search**: Search within conversations
8. **Archive**: Archive old conversations
9. **Notifications**: Push notifications for new messages
10. **Online Status**: Show if guide is online

## Testing Checklist

- [ ] Conversation list displays correctly
- [ ] Search filters conversations
- [ ] Clicking conversation opens thread
- [ ] Messages display correctly (yours vs theirs)
- [ ] Date dividers show properly
- [ ] Auto-scroll works on load
- [ ] Character counter updates
- [ ] Send button disabled when empty
- [ ] Enter key sends message
- [ ] Mobile: Sidebar hides when conversation open
- [ ] Mobile: Back button returns to list
- [ ] URL parameter auto-selects conversation
- [ ] "View Details" link works

## Usage

```typescript
// Navigate to messages
<Link href="/traveler/messages">Messages</Link>

// Navigate to specific conversation
<Link href="/traveler/messages?booking=b1">
  Message Guide
</Link>

// From bookings page
<Button asChild>
  <Link href={`/traveler/messages?booking=${booking.id}`}>
    Message Guide
  </Link>
</Button>
```

## Example Message Data

```typescript
{
  id: "m1",
  booking_id: "b1",
  sender_id: "u3",
  sender_name: "Sarah Chen",
  content: "Hi Marco! Looking forward to the tour tomorrow.",
  timestamp: "2026-01-19T14:30:00Z"
}
```

## State Management

### Local State
- `bookings` - List of conversations
- `messages` - Messages in selected thread
- `selectedBooking` - Currently active conversation
- `searchQuery` - Search filter
- `messageInput` - Current message being typed
- `isMobileConversationOpen` - Mobile view state

### Effects
- Load bookings on mount
- Auto-select from URL parameter
- Auto-scroll to bottom when messages change

