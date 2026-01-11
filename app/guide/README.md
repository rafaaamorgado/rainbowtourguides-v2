# Guide Dashboard Layout

Authenticated guide dashboard with sidebar navigation, approval banner, and responsive design.

## Structure

### Layout (`layout.tsx`)
Server component that handles authentication and guide-specific authorization.

### Sidebar (`sidebar.tsx`)
Client component with guide navigation and mobile menu.

### Dashboard (`dashboard/page.tsx`)
Example dashboard page with stats and quick actions.

## Authentication Flow

### 1. Check User Authentication
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/auth/sign-in?redirect=/guide/dashboard");
```

### 2. Verify User Profile & Role
```typescript
const { data: profile } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", user.id)
  .single();
```

### 3. Role-Based Redirects
- **Traveler**: → `/traveler/dashboard`
- **Not guide/admin**: → `/`
- **Guide/Admin**: ✓ Access granted

### 4. Fetch Guide Data
```typescript
const { data: guide } = await supabase
  .from("guides")
  .select("*")
  .eq("id", user.id)
  .single();
```

### 5. Get Pending Bookings Count
```typescript
const { count: pendingCount } = await supabase
  .from("bookings")
  .select("*", { count: "exact", head: true })
  .eq("guide_id", user.id)
  .eq("status", "pending");
```

## Navigation Links

### Always Visible
1. **Dashboard** (`/guide/dashboard`) - Home icon
2. **Bookings** (`/guide/bookings`) - Calendar icon
   - Badge with pending count (if > 0)
3. **Profile** (`/guide/profile`) - User icon
4. **Payouts** (`/guide/payouts`) - DollarSign icon

### Conditional
5. **Onboarding** (`/guide/onboarding`) - ClipboardCheck icon
   - Only shown if `guide.status !== "approved"`
   - Hidden once guide is approved

## Approval Banner

### Display Condition
Shows when `guide.status !== "approved"`

### Design
- **Background**: `bg-amber-50`
- **Border**: `border-l-4 border-amber-500`
- **Rounded**: `rounded-r-xl`
- **Padding**: `p-4` with margin

### Content
- **Icon**: Warning triangle in amber circle
- **Title**: "Profile Under Review" (semibold)
- **Message**: "Your profile is under review. You'll be notified once approved..."

### Position
Between sidebar and main content, at the top:
```
┌─────────────────────────────────┐
│ [!] Profile Under Review        │ ← Banner
├─────────────────────────────────┤
│ Dashboard Content               │
└─────────────────────────────────┘
```

## Sidebar Features

### Logo & Header
- Same as traveler layout
- Rainbow Tours logo with gradient

### User Info Card
- Avatar with fallback (first letter)
- Different gradient: `from-pride-mint to-pride-amber`
- Display name
- **Badge**: "Guide" (emerald green)

### Active Link Detection
Same as traveler layout using `usePathname()`

### Pending Badge
Shows count of pending bookings on "Bookings" link:
```tsx
{pendingBookingsCount > 0 && (
  <Badge className="bg-brand text-white">
    {pendingBookingsCount}
  </Badge>
)}
```

### Bottom Links
- **Browse as Traveler**: Links to `/cities` (MapPin icon)
- **Sign Out**: Redirects to `/auth/sign-out` (LogOut icon, red hover)

## Mobile Experience

Identical to traveler layout:
- Mobile header with hamburger
- Sidebar overlay
- Backdrop
- Smooth animations
- Close on navigation

## Differences from Traveler Layout

| Feature | Traveler | Guide |
|---------|----------|-------|
| Badge Color | Slate | Emerald |
| Avatar Gradient | Lilac → Mint | Mint → Amber |
| Navigation | Dashboard, Bookings, Messages, Saved, Settings | Dashboard, Bookings, Onboarding*, Profile, Payouts |
| Special Features | - | Approval banner, Pending count badge |
| Browse Link | Browse Cities | Browse as Traveler |

*Onboarding only shown if not approved

## Guide Status States

### Pending
- Status: `guide.status === "pending"`
- Shows: Approval banner
- Shows: Onboarding link
- Cannot: Accept bookings (future)

### Approved
- Status: `guide.status === "approved"`
- Hides: Approval banner
- Hides: Onboarding link
- Can: Accept bookings, receive payments

### Rejected
- Status: `guide.status === "rejected"`
- Shows: Different banner (red)
- Action: Contact support

## Dashboard Page

### Stats Cards (4 columns)
1. **Pending Requests**: Amber - Bookings awaiting response
2. **This Month's Tours**: Emerald - Confirmed tours this month
3. **Total Earnings**: Brand red - Cumulative earnings
4. **Average Rating**: Purple - Overall rating

### Quick Actions (3 cards)
1. **View Bookings**: Manage tour requests
2. **Edit Profile**: Update guide information
3. **Payouts**: View earnings and payment info

### Recent Activity
Timeline of recent events:
- New booking requests
- New reviews
- Profile updates

## Props Interface

```typescript
interface SidebarProps {
  profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    role: string;
  };
  guide: {
    status: string;
  } | null;
  pendingBookingsCount: number;
}
```

## Brand Consistency

### Apple-like Design
- **Clean**: Minimal clutter, focused UI
- **Premium**: Quality animations, shadows
- **Consistent**: Same patterns as traveler layout
- **Professional**: Emerald accent for guide role

### Color Palette
- **Guide Badge**: Emerald (`bg-emerald-100 text-emerald-700`)
- **Pending Badge**: Brand red
- **Warning Banner**: Amber
- **Stats Icons**: Varied (amber, emerald, red, purple)

## Security

- Server-side authentication
- Role-based access control
- Guide-specific data fetching
- Pending bookings only for this guide

## Future Enhancements

1. **Availability Calendar**: Manage available dates
2. **Earnings Chart**: Visual earnings over time
3. **Review Management**: Respond to reviews
4. **Booking Analytics**: Acceptance rate, popular times
5. **Performance Metrics**: Views, conversion rate
6. **Bulk Actions**: Accept/decline multiple bookings
7. **Templates**: Quick responses for messages
8. **Tax Reports**: Export earnings for taxes
9. **Guide Network**: Connect with other guides
10. **Training Resources**: Improve guide skills

## Testing Checklist

- [ ] Unauthenticated users redirected
- [ ] Travelers redirected to traveler dashboard
- [ ] Guide data fetched correctly
- [ ] Pending count displays in badge
- [ ] Approval banner shows when pending/rejected
- [ ] Approval banner hides when approved
- [ ] Onboarding link shows/hides correctly
- [ ] Mobile menu works
- [ ] Active link highlighting works
- [ ] Sign out redirects correctly

## Usage

```typescript
// Any page under /guide/*
export default function GuideBookingsPage() {
  return (
    <div className="space-y-8">
      <h1>Bookings</h1>
      {/* Page content */}
    </div>
  );
}
```

The layout automatically wraps all pages under `/guide/*` with authentication, sidebar, and approval banner.

