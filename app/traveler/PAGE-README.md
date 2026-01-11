# Traveler Dashboard Homepage

Main dashboard page for authenticated travelers showing bookings, stats, and quick actions.

## Features

### 1. Welcome Header
- **H1**: "Welcome back, [Display Name]!"
- **Subtitle**: "Here's what's happening with your bookings"
- Personalized greeting using profile data

### 2. Stats Cards (3 columns)
Grid responsive layout with key metrics:

#### Upcoming Tours
- **Icon**: Calendar (emerald)
- **Count**: Bookings with status `confirmed` or `accepted` and future dates
- **Label**: "Upcoming tours"

#### Pending Requests
- **Icon**: Clock (amber)
- **Count**: Bookings with status `pending`
- **Label**: "Pending requests"

#### Cities Explored
- **Icon**: MapPin (blue)
- **Count**: Unique cities from completed bookings
- **Label**: "Cities explored"

### 3. Upcoming Bookings Section
Shows next 3 upcoming tours with full details.

#### Empty State
If no upcoming bookings:
- Uses `EmptyState` component
- Title: "No upcoming tours"
- Description: "Ready to explore? Browse our verified guides..."
- CTA: "Find a Guide" → `/cities`

#### Booking Cards
Each card displays:
- **Guide Photo**: Avatar with fallback (first letter)
- **Guide Name**: Font semibold
- **Location**: City name with MapPin icon
- **Date**: Formatted as "Jan 15, 2026"
- **Duration**: Hours
- **Status Badge**: Color-coded by status
  - Confirmed: Emerald
  - Accepted: Blue
  - Pending: Amber
- **Actions**:
  - "View Details" → `/traveler/bookings/[id]`
  - "Message" → `/traveler/messages/[id]`

#### View All Link
Shows if more than 3 upcoming bookings exist.

### 4. Past Experiences Section
Shows last 3 completed bookings.

#### Past Booking Cards
Similar to upcoming cards but:
- Different gradient avatar colors (mint to amber)
- Shows review status (stars if reviewed)
- Single action: "View Details"
- No status badge (all completed)

#### View All Link
Filters to show completed bookings.

### 5. Quick Actions (2 columns)

#### Find a Guide Card
- **Style**: Gradient background (brand to pink)
- **Icon**: MapPin in frosted glass container
- **Title**: "Find a Guide"
- **Description**: "Explore new cities..."
- **CTA**: "Browse cities" → `/cities`
- **Hover**: Shadow lift effect

#### Manage Profile Card
- **Style**: White with border
- **Icon**: User (changes color on hover)
- **Title**: "Manage Profile"
- **Description**: "Update your preferences..."
- **CTA**: "Go to settings" → `/traveler/settings`
- **Hover**: Border color + shadow

## Data Flow

```typescript
// 1. Check authentication
const user = await supabase.auth.getUser();

// 2. Fetch profile
const profile = await supabase.from("profiles").select("*");

// 3. Fetch bookings
const bookings = await getBookings(user.id, "traveler");

// 4. Calculate stats
const upcoming = bookings.filter(/* confirmed/accepted + future */);
const pending = bookings.filter(/* status = pending */);
const completed = bookings.filter(/* status = completed */);
const uniqueCities = new Set(completed.map(b => b.city_name)).size;

// 5. Display data
```

## Booking Status Logic

### Upcoming Bookings
```typescript
(status === "confirmed" || status === "accepted") 
&& new Date(date) >= new Date()
```

### Pending Bookings
```typescript
status === "pending"
```

### Completed Bookings
```typescript
status === "completed" 
&& new Date(date) < new Date()
```

## Responsive Design

### Mobile (`< md`)
- Stats: Single column
- Booking cards: Stack vertically
  - Photo and name inline
  - Actions stack vertically
- Quick actions: Single column

### Tablet (`md`)
- Stats: 3 columns
- Booking cards: Grid layout
  - Photo | Content | Actions
- Quick actions: 2 columns

### Desktop (`lg+`)
- Same as tablet
- More horizontal space
- Actions in column layout

## Status Badge Colors

```typescript
confirmed: "bg-emerald-100 text-emerald-700"
accepted:  "bg-blue-100 text-blue-700"
pending:   "bg-amber-100 text-amber-700"
```

## Empty State Handling

### No Upcoming Bookings
- Full `EmptyState` component
- Centered in white card
- Minimal variant
- Clear CTA to browse cities

### No Past Bookings
- Section hidden entirely
- User sees welcome message + upcoming section

## Brand Consistency

### Colors
- **Primary**: Brand red for CTAs
- **Success**: Emerald for confirmed
- **Warning**: Amber for pending
- **Info**: Blue for accepted
- **Text**: Ink (dark) and ink-soft (muted)

### Spacing
- Section gaps: `space-y-8`
- Card gaps: `gap-6` (stats), `gap-4` (bookings)
- Internal padding: `p-6` (cards), `p-8` (actions)

### Borders & Shadows
- Cards: `border border-slate-200`
- Hover: `border-brand/50 shadow-md`
- Quick actions: Gradient or subtle border

### Typography
- H1: `text-3xl md:text-4xl font-bold`
- H2: `text-2xl font-bold`
- Stats: `text-4xl font-bold`
- Body: `text-sm` to `text-lg`

## Performance

- **Server Component**: Fast initial load
- **Static Data**: Bookings fetched once
- **Optimized Queries**: Only fetch user's bookings
- **Lazy Loading**: Could paginate past bookings

## Accessibility

- Semantic HTML structure
- Proper heading hierarchy (H1 → H2)
- Alt text for images (avatar fallbacks)
- Keyboard navigable links
- Screen reader friendly labels
- High contrast text

## Future Enhancements

1. **Real-time Updates**: WebSocket for booking status changes
2. **Calendar View**: Visual calendar of bookings
3. **Map View**: See all visited cities on map
4. **Achievements**: Badges for milestones
5. **Recommendations**: AI-suggested destinations
6. **Travel Stats**: Distance traveled, hours toured
7. **Photo Gallery**: Photos from tours
8. **Social Sharing**: Share experiences
9. **Export**: Download booking history
10. **Notifications**: In-app alerts

## Example Usage

```typescript
// This page is automatically rendered at /traveler
// No explicit routing needed

// User visits: https://app.com/traveler
// → Redirects if not authenticated
// → Shows dashboard if authenticated
```

## Testing Checklist

- [ ] Stats calculate correctly
- [ ] Upcoming bookings filter properly
- [ ] Past bookings show completed only
- [ ] Empty state appears when no bookings
- [ ] "View all" link shows when >3 bookings
- [ ] Status badges display correct colors
- [ ] Quick action links navigate correctly
- [ ] Mobile layout stacks properly
- [ ] Avatar fallbacks work
- [ ] Date formatting displays correctly

