# Guides Directory Page

Comprehensive guides browsing page with search, filtering, and curated sections.

## Files Created

### 1. `app/guides/page.tsx` - Main Server Component
- Fetches all guides and cities
- Calculates top-rated and new guides
- Renders hero, search bar, and curated sections

### 2. `app/guides/filtered-view.tsx` - Client Component
- Handles URL query param filtering
- Interest chip filtering
- Shows filtered results or empty state

### 3. `components/guides/search-bar.tsx` - Search UI
- Text search input
- City combobox
- Duration select
- Date range inputs (UI only)
- Updates URL query params

### 4. `app/layout.tsx` - Navigation Update
- Added "Guides" link as second item in navbar

## Page Structure

### A. Hero Section
- **Title**: "Find Your Guide"
- **Subtitle**: "Verified LGBTQ+ friendly locals. Safe, inclusive, authentic."
- **Search Bar**: Full-featured with filters

### B. Browse by Interest (Client Component)
- Interest chips (all unique tags from guides)
- Click to filter → updates URL `?interest=Nightlife`
- Active chip highlighted in brand red
- Shows filtered results below when active

### C. Top-Rated Guides
- 6 guides sorted by rating desc, then review count
- Uses GuideCard component

### D. New Guides
- 6 newest guides (reversed order as mock)
- Uses GuideCard component

### E. New Destinations
- Cities with ≤2 guides
- Shows city header with thumbnail
- Shows up to 3 guides per city
- "View City" button links to `/cities/[slug]`

### F. Popular Destinations
- 8 cities sorted by guide count desc
- City cards with cinematic photos
- Gradient overlay with city info
- Links to `/cities/[slug]`

## Search & Filtering

### Query Parameters
- `q` - Text search (name, city, bio, tagline, tags)
- `city` - Filter by city slug
- `interest` - Filter by experience tag
- `duration` - Filter by available duration (4/6/8)
- `start` - Start date (UI only, not filtered)
- `end` - End date (UI only, not filtered)

### Filter Logic
```typescript
// Text search
if (query) {
  guides = guides.filter(g => 
    g.name.includes(query) ||
    g.city_name.includes(query) ||
    g.bio.includes(query) ||
    g.tags.some(tag => tag.includes(query))
  );
}

// City filter
if (city) {
  guides = guides.filter(g => g.city_slug === city);
}

// Interest filter
if (interest) {
  guides = guides.filter(g => 
    g.experience_tags.includes(interest)
  );
}

// Duration filter
if (duration === "4") {
  guides = guides.filter(g => g.price_4h > 0);
}
```

### URL Examples
```
/guides
/guides?q=barcelona
/guides?city=lisbon
/guides?interest=Nightlife
/guides?interest=Food%20%26%20Drink&duration=4
/guides?q=art&city=barcelona&duration=6
```

## Components Used

### Existing
- `GuideCard` - From `/components/cards/guide-card.tsx`
- `EmptyState` - From `/components/ui/empty-state.tsx`
- `Combobox` - From `/components/ui/combobox.tsx`
- `Input`, `Select`, `Button`, `Badge` - shadcn/ui components

### New
- `GuidesSearchBar` - Search form with filters
- `FilteredView` - Client component for filtering

## Data Flow

```typescript
// Server Component (page.tsx)
const allGuides = await getGuides();        // All guides
const cities = await getCities();           // All cities
const topRated = sortByRating(allGuides);   // Top 6
const newest = reverse(allGuides);          // Newest 6
const allTags = uniqueTags(allGuides);      // All tags

// Pass to Client Component
<FilteredView allGuides={allGuides} allTags={allTags} />

// Client Component (filtered-view.tsx)
// Reads URL params
// Filters guides
// Renders results or empty state
```

## Empty State

When filters return no results:
- Title: "No guides match your filters"
- Description: "Try adjusting your search criteria..."
- Actions: "Clear Filters" and "Browse All Cities"

## Responsive Design

### Mobile
- Search bar: Single column stack
- Guide grid: 1 column
- City grid: 1 column
- Interest chips: Wrap

### Tablet
- Guide grid: 2 columns
- City grid: 2 columns

### Desktop
- Search bar: 5 columns
- Guide grid: 3-4 columns
- City grid: 4 columns
- Interest chips: Center-aligned wrap

## Brand Consistency

- **Premium**: Cinematic city photos, quality cards
- **Calm**: Generous whitespace, muted colors
- **Minimal**: Clean layout, clear hierarchy
- **Inclusive**: LGBTQ+ focused messaging

## Performance

- Server component for initial data fetch
- Client component for filtering (instant updates)
- Memoized filtering logic
- Optimized images with Next.js Image

## Future Enhancements

1. **Real Date Filtering**: Filter by guide availability
2. **Price Range**: Slider for price filtering
3. **Map View**: Show guides on interactive map
4. **Save Favorites**: Bookmark guides
5. **Compare Guides**: Side-by-side comparison
6. **Sort Options**: More sorting criteria
7. **Pagination**: Load more guides
8. **Infinite Scroll**: Lazy load on scroll
9. **Guide Recommendations**: AI-powered suggestions
10. **Recently Viewed**: Track viewed guides

## Manual Test Checklist

### Basic Navigation
- [ ] Navigate to `/guides` from navbar
- [ ] Page loads without 404 error
- [ ] Hero section displays correctly
- [ ] Search bar renders with all fields

### Search & Filtering
- [ ] Enter text in search → click Search → URL updates with `?q=barcelona`
- [ ] Select city → click Search → URL updates with `?city=lisbon`
- [ ] Select duration → click Search → URL updates with `?duration=4`
- [ ] Click interest chip → URL updates with `?interest=Nightlife`
- [ ] Filtered results display correctly
- [ ] "Clear Filters" button resets to `/guides`

### Sections Display
- [ ] Top-Rated Guides section shows 6 guides
- [ ] New Guides section shows 6 guides
- [ ] New Destinations section shows cities with guides
- [ ] Popular Destinations shows 8 city cards

### Links & Navigation
- [ ] Click guide card → navigates to `/guides/[slug]`
- [ ] Click city card → navigates to `/cities/[slug]`
- [ ] "View City" button works in New Destinations
- [ ] Interest chips toggle active state

### Empty State
- [ ] Search for non-existent term → shows empty state
- [ ] Empty state "Clear Filters" button works
- [ ] Empty state "Browse All Cities" link works

### Responsive
- [ ] Mobile: Search bar stacks vertically
- [ ] Mobile: Guide grid shows 1 column
- [ ] Desktop: Search bar shows 5 columns
- [ ] Desktop: Guide grid shows 3-4 columns

### URL Shareability
- [ ] Copy URL with filters → paste in new tab → filters persist
- [ ] Bookmark filtered page → filters remain on reload
- [ ] Share URL with `?interest=Nightlife` → recipient sees filtered view

