# Hero Search Component

Functional search bar for the homepage hero section with glass morphism design.

## Components

### 1. **Combobox** (`components/ui/combobox.tsx`)
Custom combobox/autocomplete component with search functionality.

**Features:**
- Searchable dropdown
- Custom icon support
- Keyboard navigation
- Click-away to close
- Filtered results
- Selected state indication

**Props:**
```typescript
interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}
```

### 2. **HeroSearch** (`components/home/hero-search.tsx`)
Main search bar component for the homepage.

**Features:**
- City autocomplete with all 25 cities
- Date range selection (start & end)
- Travelers count (1-4)
- Form validation
- Query param generation
- Mobile-responsive layout

## Design

### Glass Morphism
```css
bg-white/80 backdrop-blur-lg
border border-white/20
rounded-2xl shadow-glass
```

### Grid Layout
- Desktop: `grid-cols-4` (city, dates, travelers, button)
- Mobile: `grid-cols-1` (stacked vertically)

### Field Structure
Each field has:
- Label: `text-xs font-semibold uppercase tracking-wider`
- Input: `h-12 rounded-xl`
- Icon: Positioned appropriately

## Functionality

### 1. City Selection (Required)
- Combobox with searchable city list
- Format: "City Name, Country"
- MapPin icon
- Must be selected to search

### 2. Date Range (Optional)
- Two date inputs: start and end
- Min date: today
- End date min: start date
- Calendar icon in label

### 3. Travelers (Optional)
- Select dropdown: 1-4 travelers
- Users icon
- Defaults to 1

### 4. Search Button
- Full height (`h-12`)
- Search icon + text
- Primary brand color
- Triggers navigation

## Navigation Logic

```typescript
// Build URL with query params
const params = new URLSearchParams();
if (startDate && endDate) {
  params.set("dates", `${startDate}_${endDate}`);
}
params.set("travelers", travelers);

// Navigate to city page
const url = `/cities/${selectedCity}?${params.toString()}`;
router.push(url);
```

### URL Examples

**City only:**
```
/cities/barcelona
```

**City with dates:**
```
/cities/barcelona?dates=2026-02-01_2026-02-07&travelers=2
```

**City with all params:**
```
/cities/lisbon?dates=2026-03-15_2026-03-20&travelers=4
```

## Validation

### Required Fields
- City must be selected
- Shows error: "Please select a destination"

### Optional Fields
- Dates: Can be empty
- Travelers: Defaults to 1

### Date Validation
- Start date: Must be today or future
- End date: Must be after start date
- Handled by HTML5 date inputs

## Quick Stats
Below the search bar, displays:
- Total cities count
- Total guides count
- Separator dots between stats

## Mobile Layout

On mobile (`md:` breakpoint):
- Fields stack vertically
- Date inputs remain side-by-side in grid
- Search button full width
- Labels remain visible
- Quick stats center-aligned

## Integration

### Homepage Usage
```tsx
import { HeroSearch } from '@/components/home/hero-search';
import { getCities } from '@/lib/data-service';

export default async function HomePage() {
  const cities = await getCities();
  
  return (
    <section>
      {/* Hero content */}
      <HeroSearch cities={cities} />
      {/* More content */}
    </section>
  );
}
```

## Styling

### Glass Morphism Effect
- Background: `bg-white/80` (80% opacity white)
- Blur: `backdrop-blur-lg`
- Border: `border-white/20`
- Shadow: `shadow-glass` (custom shadow)

### Smooth Animations
- Combobox dropdown: Fade in/out
- Button hover: Scale and color transitions
- Focus states: Ring with brand color
- All transitions: `transition-all`

### Brand Colors
- Primary: Brand red for button
- Focus: Brand red ring
- Labels: Muted gray (`ink-soft`)
- Text: Dark gray (`ink`)

## Accessibility

- Semantic HTML with proper labels
- Keyboard navigation in combobox
- Focus visible states
- ARIA attributes (TODO: enhance)
- Screen reader friendly
- High contrast text

## Performance

- Client component for interactivity
- Server component passes static city data
- No unnecessary re-renders
- Memoized filtered options
- Efficient search algorithm

## Future Enhancements

1. **Calendar Popup**: Replace date inputs with visual calendar
2. **Recent Searches**: Show recent/popular searches
3. **Suggestions**: Smart suggestions based on user behavior
4. **Voice Search**: Voice input for accessibility
5. **Map View**: Toggle to map-based search
6. **Filters Preview**: Show guide count for each city in dropdown
7. **URL Sync**: Read initial state from URL params
8. **Analytics**: Track search patterns
9. **Autocomplete AI**: Suggest destinations based on preferences
10. **Multi-City**: Select multiple cities

## Examples

### Basic Search
```tsx
<HeroSearch cities={citiesData} />
```

### With Pre-selected Values (Future)
```tsx
<HeroSearch 
  cities={citiesData}
  initialCity="barcelona"
  initialDates={{ start: "2026-02-01", end: "2026-02-07" }}
  initialTravelers={2}
/>
```

## Testing Checklist

- [ ] City selection works
- [ ] City search filters correctly
- [ ] Date validation (future dates only)
- [ ] End date after start date
- [ ] Travelers selection updates
- [ ] Error shows when city not selected
- [ ] Navigation works with query params
- [ ] Mobile layout stacks correctly
- [ ] Glass morphism renders properly
- [ ] Quick stats display correctly

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- HTML5 date inputs (with fallback)
- CSS backdrop-filter support
- Flexbox and Grid support

