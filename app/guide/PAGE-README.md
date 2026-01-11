# Guide Dashboard Homepage

Guide-focused dashboard with booking request management and tour overview.

## Features

### 1. Welcome Header
- **Title**: "Welcome back, [Name]!"
- **Subtitle** (if approved): "Here's what's happening with your tours"
- **Warning** (if not approved): Alert icon + "Your profile is under review"

### 2. Stats Cards (3 columns)

#### New Requests (Amber)
- **Icon**: AlertCircle
- **Count**: Bookings with `status = "pending"`
- **Label**: "New requests"

#### Upcoming Tours (Emerald)
- **Icon**: Calendar
- **Count**: Bookings with `confirmed` or `accepted` status and future dates
- **Label**: "Upcoming tours"

#### This Month's Earnings (Brand Red)
- **Icon**: DollarSign
- **Count**: Sum of completed bookings this month × 0.8 (guide commission)
- **Label**: "This month's earnings"
- **Format**: "$X" (rounded)

### 3. New Booking Requests Section

#### Header
- **H2**: "New Requests"
- **Badge**: Shows pending count (amber)

#### Empty State
If no pending requests:
- Title: "No new requests"
- Description: "You're all caught up!"
- Icon: Calendar
- Variant: Minimal

#### Request Cards
Each pending booking displays:

**Structure**: Amber border (border-2) to indicate action needed

**Traveler Info**:
- Avatar: Gradient circle with "T" fallback
- Text: "New booking request"
- Location: "From Traveler in [City]"

**Details**:
- Date with Calendar icon
- Duration with Clock icon
- Traveler's message in quote box:
  - Background: `bg-slate-50`
  - Border: `border-slate-200`
  - Italic text
- Price: `text-lg font-bold`

**Actions** (3 buttons):
1. **Accept Request** (Primary):
   - CheckCircle icon
   - Updates status to `accepted`
   - Instant feedback

2. **Decline** (Outline, red text):
   - Opens confirmation dialog
   - Updates status to `declined`

3. **View Details** (Outline):
   - Navigate to booking details

### 4. Upcoming Tours Section
Shows confirmed tours (max 3).

#### Tour Cards
- Traveler avatar (different gradient: mint)
- Tour location
- Date, duration, status badge (emerald)
- **Actions**:
  - "View Details" (primary)
  - "Message" (outline with MessageSquare icon)

#### View All Link
Shows if more than 3 upcoming tours.

### 5. Quick Actions (2 columns)

#### Edit Profile Card (Gradient)
- **Background**: Brand red to pink gradient
- **Icon**: User in frosted container
- **Title**: "Edit Profile"
- **Description**: "Update your bio, photos, languages..."
- **CTA**: "Manage profile" → `/guide/profile`

#### Manage Availability Card (White)
- **Background**: White with border
- **Icon**: Settings (changes color on hover)
- **Title**: "Manage Availability"
- **Description**: "Set your available dates and times..."
- **CTA**: "Update calendar" → `/guide/availability`

### 6. Decline Confirmation Dialog

**Design**:
- Red warning icon in circle
- Title: "Decline Booking Request?"
- Description: Explains consequences and suggests alternatives
- **Actions**:
  - "Keep Request" (outline)
  - "Yes, Decline" (red)

## Functionality

### Accept Request
```typescript
const handleAccept = async (bookingId: string) => {
  // Update booking status to "accepted"
  // Trigger notification to traveler
  // Update local state for instant feedback
};
```

### Decline Request
```typescript
const handleDeclineClick = (bookingId: string) => {
  // Open confirmation dialog
  setBookingToDecline(bookingId);
  setDeclineDialogOpen(true);
};

const handleDeclineConfirm = async () => {
  // Update booking status to "declined"
  // Notify traveler
  // Update local state
};
```

### Stats Calculation

#### New Requests
```typescript
bookings.filter(b => b.status === "pending")
```

#### Upcoming Tours
```typescript
bookings.filter(b => 
  (b.status === "confirmed" || b.status === "accepted") 
  && new Date(b.date) >= new Date()
)
```

#### This Month's Earnings
```typescript
const completedThisMonth = bookings.filter(b => {
  if (b.status !== "completed") return false;
  const bookingDate = new Date(b.date);
  return bookingDate.getMonth() === now.getMonth() 
    && bookingDate.getFullYear() === now.getFullYear();
});

const earnings = completedThisMonth.reduce(
  (sum, b) => sum + b.price_total * 0.8, // 80% to guide, 20% platform fee
  0
);
```

## Data Flow

```typescript
1. Fetch bookings: getBookings(guideId, "guide")
2. Filter by status and dates
3. Calculate stats
4. Display requests (pending)
5. Display upcoming (confirmed/accepted)
6. Handle accept/decline actions
```

## Differences from Traveler Dashboard

| Feature | Traveler | Guide |
|---------|----------|-------|
| **Welcome Message** | Bookings status | Profile review status |
| **Stats** | Upcoming, Pending, Cities | New Requests, Upcoming, Earnings |
| **Main Section** | Upcoming bookings | **New Requests** (action needed) |
| **Actions** | View, Message, Cancel | **Accept, Decline**, View |
| **Quick Actions** | Find Guide, Manage Profile | Edit Profile, Manage Availability |
| **Focus** | Booking management | **Request management** |

## Visual Hierarchy

### Request Cards Stand Out
- **Amber border-2**: Visually distinct
- **Action buttons**: Prominent Accept button
- **Traveler message**: Quote box with context

### Status Colors
- **New Requests**: Amber (needs attention)
- **Upcoming Tours**: Emerald (confirmed)
- **Earnings**: Brand red (highlight)

## Brand Consistency ✨

- **Professional**: Clean, organized interface
- **Action-Oriented**: Clear CTAs for pending requests
- **Status Indicators**: Color-coded for quick scanning
- **Premium**: Smooth animations, quality shadows
- **Calm**: Not overwhelming despite action items

## Mobile Responsive

- Stats: Stack to single column
- Request cards: Stack vertically
- Actions: Full width buttons on mobile
- Quick actions: Single column stack

## Future Enhancements

1. **Real-time Notifications**: Push alerts for new requests
2. **Batch Actions**: Accept/decline multiple requests
3. **Smart Scheduling**: Suggest alternative dates
4. **Earnings Chart**: Visual earnings over time
5. **Performance Metrics**: Acceptance rate, response time
6. **Quick Replies**: Template responses
7. **Calendar Integration**: Sync with Google Calendar
8. **Availability Blocks**: Mark unavailable dates
9. **Price Adjustment**: Seasonal pricing
10. **Traveler History**: See repeat travelers

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Keyboard navigation
- Focus visible states
- Screen reader friendly labels
- High contrast status colors

## Testing Checklist

- [ ] Stats calculate correctly
- [ ] Pending requests show in amber cards
- [ ] Accept button updates status
- [ ] Decline shows confirmation dialog
- [ ] Upcoming tours display correctly
- [ ] Empty state shows when no requests
- [ ] "View all" link shows when >3 bookings
- [ ] Quick action links navigate correctly
- [ ] Mobile layout stacks properly
- [ ] Approval warning shows when not approved

## Usage

```typescript
// Automatically renders at /guide
// Layout wraps with auth and sidebar
// No explicit routing needed
```

## Navigation

- From any guide page to dashboard: `/guide/dashboard` or `/guide`
- New request actions: Update status inline
- View details: `/guide/bookings/[id]`
- Messages: `/guide/messages?booking=[id]`
- Profile: `/guide/profile`
- Availability: `/guide/availability`

