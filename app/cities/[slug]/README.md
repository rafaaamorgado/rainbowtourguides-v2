# City Detail Page

City detail page with guide discovery and client-side filtering.

## Structure

### Server Component (`page.tsx`)
Fetches city and guide data from the data-service layer.

### Client Component (`guides-section.tsx`)
Handles filtering, sorting, and search logic on the client side.

## Features

### 1. SEO Metadata
- Dynamic title: `[City Name] LGBTQ+ Tour Guides | Rainbow Tour Guides`
- Description from city data (truncated to 155 chars)
- OpenGraph tags for social sharing

### 2. Hero Section
- **Aspect ratio**: `aspect-[21/9]` (cinematic ultra-wide)
- **Photo**: Full-width city image from mock data
- **Gradient overlay**: Dark gradient for text readability
- **Breadcrumb**: Home > Cities > [City Name]
- **Content**: City name, country, guide count

### 3. City Info Section
- **About**: City description from mock data
- **Safety Notes Box**:
  - Emerald green accent color
  - Border-left-4 design
  - Shield icon with title
  - 3 bullet points with icons:
    1. Verified guides
    2. Safe spaces
    3. Community support

### 4. Guides Section (Client Component)
Interactive filtering with URL sync (coming soon).

#### Filter Bar (Sticky)
- **Position**: `sticky top-20` (stays visible on scroll)
- **Background**: Glass morphism effect
- **Filters**:
  - **Search**: Text input with icon
  - **Theme**: Dropdown (All, Nightlife, Daytime Culture, Food & Drink, Queer History, Art Scene, Hidden Gems)
  - **Duration**: Dropdown (Any, 4h, 6h, 8h)
  - **Sort**: Dropdown (Recommended, Price Low-High, Price High-Low, Rating)
  - **Clear**: Button to reset all filters

#### Filtering Logic
- **Search**: Filters by guide name, tagline, or tags
- **Theme**: Filters by experience tags
- **Duration**: Shows only guides offering selected duration
- **Sort**:
  - **Recommended**: Verified first, then by rating
  - **Price (Low to High)**: Ascending by `price_4h`
  - **Price (High to Low)**: Descending by `price_4h`
  - **Rating**: Descending by rating

#### Results Display
- Results count: "X guides in [City]"
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Uses `GuideCard` component from `/components/cards/guide-card.tsx`

### 5. Empty States

#### No Guides After Filtering
Uses `EmptyState` component with:
- Title: "No guides match your filters"
- Description: Suggests adjusting criteria
- Actions: "Clear filters" and "Browse all cities"

#### City Not Found
Returns Next.js `notFound()` for 404 handling.

## Brand Alignment

- **Premium**: Cinematic hero, smooth animations, quality typography
- **Clean Layout**: Generous whitespace, clear hierarchy
- **Accessible**: Semantic HTML, proper labels, keyboard navigation
- **Responsive**: Mobile-first, adapts to all screen sizes

## Data Flow

```typescript
// Server Component (page.tsx)
const city = await getCity(slug);          // From data-service
const guides = await getGuides(slug);      // From data-service

// Pass to Client Component
<GuidesSection guides={guides} cityName={city.name} />

// Client Component (guides-section.tsx)
// Filters and sorts guides using useState and useMemo
const filteredGuides = useMemo(() => {
  // Filter and sort logic
}, [guides, query, theme, duration, sortBy]);
```

## Future Enhancements

1. **URL Query Params**: Sync filters with URL for shareable filtered views
2. **Price Range Slider**: Replace fixed duration with price range
3. **Map View**: Show guides on an interactive map
4. **Availability Calendar**: Filter by guide availability
5. **Favorites**: Allow users to save guides
6. **Advanced Search**: Search by languages, years of experience

## Components Used

- `GuideCard` - From `/components/cards/guide-card.tsx`
- `EmptyState` - From `/components/ui/empty-state.tsx`
- `Input`, `Select`, `Button` - From `/components/ui/`
- `Image` - Next.js optimized images
- Icons - From `lucide-react`

## Example Usage

```typescript
// Navigate to a city
<Link href="/cities/barcelona">Barcelona</Link>

// The page will:
// 1. Fetch Barcelona data
// 2. Fetch all guides in Barcelona
// 3. Display hero, info, and filterable guide grid
```

## Performance

- **Server Component**: Initial data fetch on server (fast first load)
- **Client Component**: Filtering runs on client (instant updates)
- **Memoization**: Uses `useMemo` to prevent unnecessary recalculations
- **Image Optimization**: Next.js Image component for optimized delivery

