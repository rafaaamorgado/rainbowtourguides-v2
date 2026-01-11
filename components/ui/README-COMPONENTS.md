# Reusable UI Components

Premium, brand-aligned UI components for loading, error, and empty states.

## LoadingSkeleton

Animated skeleton loaders with multiple variants.

### Basic Usage

```tsx
import { LoadingSkeleton, CardSkeleton, ListSkeleton, ProfileSkeleton, DashboardSkeleton } from "@/components/ui/loading-skeleton";

// Single skeleton
<LoadingSkeleton variant="card" />

// Multiple skeletons
<LoadingSkeleton variant="list" count={5} />

// Specialized skeletons with internal structure
<CardSkeleton />
<ListSkeleton count={3} />
<ProfileSkeleton />
<DashboardSkeleton count={4} />
```

### Variants
- `card` - Full card skeleton (default)
- `list` - Horizontal list item
- `profile` - Circular avatar
- `dashboard` - Dashboard card

## ErrorState

Premium error component with retry functionality.

### Basic Usage

```tsx
import { ErrorState, InlineErrorState, NetworkErrorState, NotFoundErrorState } from "@/components/ui/error-state";

// Default error state
<ErrorState 
  message="Unable to load guides. Please check your connection." 
  onRetry={() => fetchGuides()}
/>

// Custom title
<ErrorState 
  title="Failed to load data"
  message="Something went wrong on our end."
  onRetry={handleRetry}
/>

// Card variant (with border/background)
<ErrorState 
  variant="card"
  message="This guide is no longer available."
/>

// Minimal variant (compact)
<ErrorState 
  variant="minimal"
  message="Connection failed"
  onRetry={retry}
/>

// Inline error (compact, horizontal)
<InlineErrorState 
  message="Failed to save changes" 
  onRetry={handleSave}
/>

// Specialized error states
<NetworkErrorState onRetry={retry} />
<NotFoundErrorState />
```

### Props
- `message` - Error message text
- `onRetry` - Retry callback function (optional)
- `title` - Custom title (default: "Something went wrong")
- `showIcon` - Show error icon (default: true)
- `variant` - "default" | "minimal" | "card"

## EmptyState

Warm, friendly empty state with optional CTAs.

### Basic Usage

```tsx
import { 
  EmptyState, 
  NoGuidesEmptyState, 
  NoBookingsEmptyState,
  NoSavedEmptyState,
  NoResultsEmptyState,
  NoMessagesEmptyState
} from "@/components/ui/empty-state";

// Custom empty state
<EmptyState 
  title="No guides here... yet" 
  description="Try another city or join our waitlist to be notified when guides become available."
  icon="map"
  actionLabel="Explore other cities"
  actionHref="/cities"
/>

// With secondary action
<EmptyState 
  title="No saved guides"
  description="Bookmark guides to find them easily later."
  icon="heart"
  actionLabel="Browse guides"
  actionHref="/guides"
  secondaryActionLabel="Learn more"
  secondaryActionHref="/about"
/>

// Pre-configured empty states
<NoGuidesEmptyState cityName="Barcelona" />
<NoBookingsEmptyState />
<NoSavedEmptyState />
<NoResultsEmptyState searchQuery="diving" />
<NoMessagesEmptyState />
```

### Icons
- `sparkles` - General empty state (default)
- `search` - No search results
- `map` - No locations/guides
- `heart` - No favorites/saved items
- `users` - No messages/connections
- Custom icon: Pass any React node

### Variants
- `default` - Standard padding and spacing
- `minimal` - Compact version
- `card` - With border and background

## Examples in Context

### Loading Page

```tsx
export default function GuidesPage() {
  const { data, isLoading, error, refetch } = useGuides();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState 
        message="Unable to load guides. Please try again."
        onRetry={() => refetch()}
      />
    );
  }

  if (data.length === 0) {
    return <NoGuidesEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map(guide => <GuideCard key={guide.id} guide={guide} />)}
    </div>
  );
}
```

### Dashboard Stats

```tsx
export default function Dashboard() {
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <DashboardSkeleton count={4} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(stat => <StatCard key={stat.id} {...stat} />)}
    </div>
  );
}
```

### Search Results

```tsx
export default function SearchResults({ query }: { query: string }) {
  const { results, isLoading, error } = useSearch(query);

  if (isLoading) {
    return <ListSkeleton count={5} />;
  }

  if (error) {
    return <InlineErrorState message={error.message} />;
  }

  if (results.length === 0) {
    return <NoResultsEmptyState searchQuery={query} />;
  }

  return (
    <div className="space-y-3">
      {results.map(result => <ResultItem key={result.id} {...result} />)}
    </div>
  );
}
```

## Design Principles

All components follow the Rainbow Tour Guides brand:
- **Premium**: Soft shadows, rounded corners (rounded-2xl)
- **Minimal**: Clean layouts, thoughtful spacing
- **Warm**: Friendly microcopy, gradient accents
- **Accessible**: Proper semantic HTML, ARIA attributes
- **Responsive**: Mobile-first, adapts to all screen sizes

## Animation

Loading skeletons use `animate-pulse` with a subtle, professional animation that doesn't distract from the overall experience.

