# Chat System Data Flow

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT SIDE                              │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  MessageInbox Component (Client Component)                 │ │
│  │  - State: messages[], selectedBooking, messageInput       │ │
│  │  - Realtime: Supabase browser client subscription         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                           │           │                           │
│                           │           │                           │
│            ┌──────────────┘           └─────────────┐            │
│            │ Fetch                            Send  │            │
│            │ Messages                         Msg   │            │
│            ▼                                        ▼            │
│  ┌─────────────────────┐              ┌─────────────────────┐  │
│  │  Server Component   │              │  Server Action      │  │
│  │  fetchMessages()    │              │  sendMessageAction()│  │
│  └─────────────────────┘              └─────────────────────┘  │
│            │                                        │            │
└────────────┼────────────────────────────────────────┼───────────┘
             │                                        │
             │                                        │
┌────────────┼────────────────────────────────────────┼───────────┐
│            │          SERVER SIDE                   │            │
│            ▼                                        ▼            │
│  ┌─────────────────────┐              ┌─────────────────────┐  │
│  │  lib/data-service   │              │  lib/chat-api       │  │
│  │  getMessages()      │              │  sendChatMessage()  │  │
│  └─────────────────────┘              └─────────────────────┘  │
│            │                                        │            │
│            │                                        │            │
│            └────────────────┬───────────────────────┘            │
│                             ▼                                    │
│                   ┌──────────────────────┐                      │
│                   │  lib/adapters        │                      │
│                   │  adaptMessageFromDB()│                      │
│                   └──────────────────────┘                      │
│                             │                                    │
│                             ▼                                    │
│                   ┌──────────────────────┐                      │
│                   │  Supabase Client     │                      │
│                   │  (Server)            │                      │
│                   └──────────────────────┘                      │
│                             │                                    │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                       │
│                                                                   │
│  ┌────────────────────┐         ┌────────────────────┐          │
│  │  messages          │         │  bookings          │          │
│  ├────────────────────┤         ├────────────────────┤          │
│  │ id (uuid)          │         │ id (uuid)          │          │
│  │ booking_id (uuid)  │◄────────│ traveler_id (uuid) │          │
│  │ sender_id (uuid)   │         │ guide_id (uuid)    │          │
│  │ body (text)        │         │ status (enum)      │          │
│  │ created_at         │         └────────────────────┘          │
│  └────────────────────┘                                          │
│                                                                   │
│  RLS Policies:                                                   │
│  - messages_participants_read: SELECT if user is participant    │
│  - messages_participants_send: INSERT if booking approved       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Realtime Events
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE REALTIME                             │
│                                                                   │
│  postgres_changes event → WebSocket → Browser Client            │
│  Filter: booking_id = eq.{bookingId}                            │
│  Event: INSERT on messages table                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ New Message Event
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT SIDE (Update)                          │
│                                                                   │
│  MessageInbox receives event → Fetch full message data →        │
│  Update messages state → UI re-renders with new message         │
└─────────────────────────────────────────────────────────────────┘
```

## Sending a Message Flow

```
User types message and presses Send
    │
    ▼
MessageInbox.handleSendMessage()
    │
    ├─ Validate: messageInput.trim() not empty
    ├─ Set isSending = true
    │
    ▼
Call sendMessageAction(bookingId, userId, body)  [Server Action]
    │
    ▼
lib/chat-api.sendChatMessage(bookingId, userId, body)
    │
    ├─ Validate: body not empty
    ├─ Create Supabase server client
    │
    ▼
INSERT INTO messages (booking_id, sender_id, body)
    │
    ├─ RLS Check: auth.uid() = sender_id?
    ├─ RLS Check: User is participant?
    ├─ RLS Check: Booking status in [accepted, awaiting_payment, confirmed, completed]?
    │
    ▼
    ├─ Success → Return { success: true, data: Message }
    ├─ RLS Error → Return { success: false, error: "Chat not available..." }
    └─ Other Error → Return { success: false, error: "Failed to send message" }
    │
    ▼
MessageInbox receives result
    │
    ├─ If success: Clear input, wait for realtime event
    └─ If error: Show error message to user
    │
    ▼
Supabase Realtime broadcasts INSERT event
    │
    ▼
MessageInbox subscription receives event
    │
    ├─ Fetch full message with sender profile
    ├─ Check for duplicates
    └─ Append to messages state
    │
    ▼
UI updates with new message (auto-scroll to bottom)
```

## Loading Messages Flow

```
User selects a conversation (booking)
    │
    ▼
MessageInbox.handleSelectConversation(booking)
    │
    ├─ Set selectedBooking
    ├─ Clear previous messages
    │
    ▼
Call fetchMessages(booking.id)  [Server Component Function]
    │
    ▼
lib/data-service.getMessages(bookingId)
    │
    ▼
SELECT messages WHERE booking_id = ? ORDER BY created_at ASC
    │
    ├─ RLS Check: User is participant? (via bookings join)
    │
    ▼
Fetch returns Message[] or []
    │
    ▼
lib/adapters.adaptMessageFromDB() for each message
    │
    ├─ Map database fields to UI format
    ├─ body → content
    ├─ sender profile → sender_name
    │
    ▼
MessageInbox sets messages state
    │
    ▼
UI renders messages grouped by date
    │
    ▼
Auto-scroll to bottom of conversation
```

## Realtime Subscription Flow

```
MessageInbox mounts with selectedBooking
    │
    ▼
useEffect with [supabase, selectedBooking] dependencies
    │
    ▼
Create Supabase channel: `booking_messages:${bookingId}`
    │
    ▼
Subscribe to postgres_changes:
    - event: INSERT
    - schema: public
    - table: messages
    - filter: booking_id=eq.${bookingId}
    │
    ▼
Channel.subscribe() → WebSocket connection established
    │
    │ ... waiting for events ...
    │
    ▼
New message inserted (by either participant)
    │
    ▼
PostgreSQL triggers notification
    │
    ▼
Supabase Realtime receives notification
    │
    ▼
WebSocket sends payload to subscribed clients
    │
    ▼
MessageInbox callback receives payload
    │
    ├─ payload.new contains new message row
    ├─ Fetch full message with sender profile
    ├─ Check if message already in state (avoid duplicates)
    └─ Append to messages state
    │
    ▼
UI updates instantly with new message
    │
    │ ... subscription stays active ...
    │
    ▼
User navigates away OR component unmounts
    │
    ▼
useEffect cleanup function runs
    │
    ▼
supabase.removeChannel(channel) → WebSocket closed
```

## Booking Status Enforcement

```
┌─────────────────────────────────────────────────────────────┐
│ Booking Status Flow                                          │
└─────────────────────────────────────────────────────────────┘

draft → pending → accepted → awaiting_payment → confirmed → completed
  │       │          │              │               │            │
  │       │          │              │               │            │
  🔒      🔒         ✅             ✅              ✅           ✅
  Chat    Chat      Chat          Chat           Chat         Chat
  Locked  Locked    Open          Open           Open         Open


Alternative flows:

pending → declined
   │         │
  🔒        🔒
  Locked    Hidden

accepted → cancelled_by_traveler
   │              │
  ✅            🔒 (Read-only or Hidden)
  Open

confirmed → cancelled_by_guide
   │              │
  ✅            🔒 (Read-only or Hidden)
  Open


UI Behavior:

🔒 Locked State:
   - Input field disabled
   - Lock icon displayed
   - Message: "Chat will open after the guide accepts your booking"

✅ Open State:
   - Input field enabled
   - Send button active
   - Realtime updates active

Hidden State (declined/cancelled):
   - Conversation not shown in list
   - OR shown with read-only badge
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Error Scenarios                                              │
└─────────────────────────────────────────────────────────────┘

1. RLS Policy Violation (booking not approved)
   ─────────────────────────────────────────
   User sends message on pending booking
        │
        ▼
   RLS blocks INSERT (status not in allowed list)
        │
        ▼
   Error code: 42501 or "policy" in message
        │
        ▼
   Return: "Chat is not available until booking is accepted."
        │
        ▼
   UI shows error below input field


2. Empty Message
   ─────────────
   User clicks Send with empty input
        │
        ▼
   Client-side validation catches
        │
        ▼
   handleSendMessage() returns early
        │
        ▼
   No API call made


3. Network Error
   ──────────────
   User sends message, network fails
        │
        ▼
   sendMessageAction() throws exception
        │
        ▼
   try/catch block catches error
        │
        ▼
   setSendError("An unexpected error occurred")
        │
        ▼
   UI shows error message in red


4. Not Authorized (user not participant)
   ─────────────────────────────────────
   User attempts to access booking they don't own
        │
        ▼
   RLS policy on messages table blocks SELECT
        │
        ▼
   getMessages() returns []
        │
        ▼
   UI shows empty state OR
   Booking not shown in conversation list


5. Realtime Connection Lost
   ─────────────────────────
   WebSocket disconnects
        │
        ▼
   Supabase client attempts reconnection
        │
        ▼
   User continues to see cached messages
        │
        ▼
   New messages may not appear until refresh
        │
        ▼
   (Future: Add connection status indicator)
```

## Data Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Security Enforcement Layers                                  │
└─────────────────────────────────────────────────────────────┘

Layer 1: Client-Side (UX)
   - Hide conversations for non-participant bookings
   - Disable input for non-approved booking statuses
   - Show appropriate locked/error states

        ▼

Layer 2: Server Action Validation
   - Validate empty message
   - Pass authenticated user ID (from requireUser())
   - Return user-friendly errors

        ▼

Layer 3: RLS Policies (Database)
   - Enforce auth.uid() = sender_id
   - Check user is traveler OR guide of booking
   - Check booking status in allowed list
   - Block unauthorized SELECT/INSERT

        ▼

Layer 4: Database Constraints
   - Foreign key constraints (booking_id, sender_id)
   - NOT NULL constraints
   - Data type validation

Result: Defense in depth - multiple layers prevent unauthorized access
```

## Performance Optimizations

```
┌─────────────────────────────────────────────────────────────┐
│ Optimization Points                                          │
└─────────────────────────────────────────────────────────────┘

1. Query Optimization
   ─────────────────
   - Index on messages(booking_id)
   - Index on messages(created_at)
   - Limit to 50 messages per query
   - ORDER BY created_at ASC (oldest first)

2. Realtime Filtering
   ──────────────────
   - Filter at database level: booking_id=eq.${bookingId}
   - Only subscribe to active conversation
   - Unsubscribe when navigating away

3. State Management
   ────────────────
   - Duplicate prevention in realtime updates
   - Efficient state updates (prev => [...prev, newMsg])
   - Auto-scroll only when messages change

4. Network Efficiency
   ──────────────────
   - Batch profile fetches with messages
   - Single query with JOINs vs N+1 queries
   - Minimal payload in realtime events

5. Future: Pagination
   ──────────────────
   - Load initial 50 messages
   - "Load more" loads previous 50
   - Cursor-based pagination using created_at
   - Virtual scrolling for very long chats
```
