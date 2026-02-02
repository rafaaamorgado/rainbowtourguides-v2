# Traveler Dashboard Layout

Authenticated traveler dashboard with sidebar navigation and responsive design.

## Structure

### Layout (`layout.tsx`)
Server component that handles authentication and authorization.

### Sidebar (`sidebar.tsx`)
Client component with navigation and mobile menu.

## Authentication Flow

### 1. Check User Authentication
```typescript
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/auth/sign-in?redirect=/traveler/dashboard");
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
- **Guide**: → `/guide/dashboard`
- **Not traveler/admin**: → `/`
- **Traveler/Admin**: ✓ Access granted

## Layout Structure

### Desktop (`lg:` breakpoint)
```
┌─────────────────────────────────┐
│ Sidebar (w-64)  │  Main Content │
│                 │               │
│  - Logo         │   {children}  │
│  - User Info    │               │
│  - Navigation   │               │
│  - Bottom Links │               │
└─────────────────────────────────┘
```

### Mobile
```
┌─────────────────────────────────┐
│  [☰]  Rainbow Tour Guides       │ ← Header
├─────────────────────────────────┤
│                                 │
│        Main Content             │
│        {children}               │
│                                 │
└─────────────────────────────────┘

Hamburger opens sidebar overlay
```

## Sidebar Components

### 1. Header Section
- **Logo**: Links to homepage
- **Close button**: Mobile only (X icon)

### 2. User Info Card
- **Avatar**: 
  - If `avatar_url` exists: Display image
  - Else: Show first letter on gradient background
- **Name**: User's display name
- **Badge**: "Traveler" role badge

### 3. Navigation Links
```typescript
const navigationLinks = [
  { name: "Dashboard", href: "/traveler/dashboard", icon: Home },
  { name: "My Bookings", href: "/traveler/bookings", icon: Calendar },
  { name: "Messages", href: "/traveler/messages", icon: MessageSquare },
  { name: "Profile", href: "/traveler/profile", icon: User },
  { name: "Reviews", href: "/traveler/reviews", icon: Star },
  { name: "Settings", href: "/traveler/settings", icon: Settings },
];
```

### 4. Active Link Detection
Uses `usePathname()` to detect active route:
```typescript
const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
```

**Active Styling:**
- Background: `bg-brand/10`
- Text: `text-brand font-semibold`
- Chevron indicator

**Inactive Styling:**
- Text: `text-ink-soft`
- Hover: `hover:bg-slate-100 hover:text-ink`

### 5. Bottom Section
- **Browse Cities**: Quick link to explore
- **Sign Out**: Redirects to `/auth/sign-out`

## Main Content Area

### Styling
- Padding: `p-8`
- Max width: `max-w-7xl mx-auto`
- Background: `bg-slate-50` (light gray)

### Left Padding
- Desktop: `lg:pl-64` (accounts for fixed sidebar)
- Mobile: No left padding (sidebar overlay)

## Mobile Experience

### Header Bar
- Fixed at top
- Logo + hamburger menu
- Height: 64px (h-16)
- White background with bottom border

### Sidebar Overlay
- **Closed**: `transform -translate-x-full`
- **Open**: `transform translate-x-0`
- **Animation**: `transition-transform duration-300`
- **Backdrop**: Semi-transparent black overlay
- **Z-index**: 50 (above content, below modals)

### Interactions
- Tap hamburger: Opens sidebar
- Tap backdrop: Closes sidebar
- Tap close button: Closes sidebar
- Tap navigation link: Navigates + closes sidebar

## Brand Alignment

### Apple-like Design
- **Clean**: Minimal clutter, generous whitespace
- **Premium**: Smooth animations, quality shadows
- **Hierarchy**: Clear visual hierarchy
- **Typography**: Consistent font weights and sizes

### Color Palette
- **Background**: `bg-slate-50` (light gray)
- **Sidebar**: `bg-white` (white)
- **Active**: Brand red (`bg-brand/10`, `text-brand`)
- **Text**: Ink (`text-ink`, `text-ink-soft`)
- **Borders**: `border-slate-200`

### Spacing
- **Sidebar padding**: `p-6` (header), `p-4` (nav/bottom)
- **Link padding**: `px-3 py-2.5`
- **Main content**: `p-8`
- **Card gaps**: `gap-6`

### Rounded Corners
- **Sidebar sections**: `rounded-xl`
- **User avatar**: `rounded-full`
- **Logo**: `rounded-lg`
- **Cards**: `rounded-2xl`

## Dashboard Page

### Stats Grid
4 stat cards showing:
- Upcoming Tours
- Cities Visited
- Unread Messages
- Guides Met

### Quick Actions
3 action cards:
- Browse Cities
- My Bookings
- Messages

### Recent Activity
Timeline of recent events:
- Tour confirmations
- New messages
- Booking updates

## Responsive Breakpoints

- **Mobile**: `< 1024px` (sidebar overlay)
- **Desktop**: `≥ 1024px` (`lg:` prefix, fixed sidebar)

## Future Enhancements

1. **Notifications Badge**: Count on Messages link
2. **Profile Dropdown**: Quick actions in header
3. **Theme Toggle**: Dark mode support
4. **Keyboard Shortcuts**: Quick navigation
5. **Search**: Global search in sidebar
6. **Favorites**: Pin favorite guides/cities
7. **Help Widget**: In-app support chat
8. **Tour Calendar**: Visual calendar view
9. **Achievements**: Gamification badges
10. **Multi-language**: i18n support

## Accessibility

- Semantic HTML with proper ARIA labels
- Keyboard navigation support
- Focus visible states
- Screen reader friendly
- High contrast ratios
- Touch targets ≥ 44px

## Performance

- Server-side auth checks (fast first load)
- Client-side navigation (instant transitions)
- Optimized images with Next.js Image
- CSS animations (GPU-accelerated)
- Lazy loading for heavy components

## Security

- Server-side auth validation
- Role-based access control
- Secure session management
- CSRF protection via Supabase
- XSS prevention

## Testing Checklist

- [ ] Unauthenticated users redirected to sign-in
- [ ] Guides redirected to guide dashboard
- [ ] Active link highlighting works
- [ ] Mobile menu opens/closes
- [ ] Sign out redirects correctly
- [ ] Avatar displays fallback correctly
- [ ] All navigation links work
- [ ] Mobile header shows on small screens
- [ ] Desktop sidebar fixed on large screens
- [ ] Smooth animations on interactions

## Usage

```tsx
// In any page under /traveler/*
export default function TravelerBookingsPage() {
  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        <Link href="/traveler/dashboard">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-ink font-medium">Bookings</span>
      </nav>

      {/* Page content */}
      <h1>My Bookings</h1>
      {/* ... */}
    </div>
  );
}
```

The layout automatically wraps all pages under `/traveler/*`.

