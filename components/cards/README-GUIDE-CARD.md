# GuideCard Component

Premium guide card component matching Brand Style Guide V2.

## Usage

```tsx
import { GuideCard, GuideCardGrid, GuideCardSkeleton } from "@/components/cards/guide-card";

// Single card
<GuideCard guide={guide} />

// Compact variant
<GuideCard guide={guide} variant="compact" />

// Grid of cards
<GuideCardGrid>
  {guides.map((guide) => (
    <GuideCard key={guide.id} guide={guide} />
  ))}
</GuideCardGrid>

// Loading state
<GuideCardGrid>
  <GuideCardSkeleton />
  <GuideCardSkeleton />
  <GuideCardSkeleton />
</GuideCardGrid>
```

## Props Interface

```typescript
interface GuideCardProps {
  guide: {
    id: string;
    name: string;
    slug: string;
    city_name: string;
    country_name: string;
    photo_url: string;
    tagline: string;
    rating: number;
    review_count: number;
    price_4h: number;
    experience_tags: string[];
    verified: boolean;
    instant_book: boolean;
  };
  variant?: 'default' | 'compact';
}
```

## Design Features

### Container
- Background: `bg-panel-light` (white)
- Border: `border-slate-200` (subtle line)
- Rounded: `rounded-2xl`
- Shadow: `shadow-md` → `shadow-glass` on hover
- Animation: Smooth lift on hover (`-translate-y-0.5`)

### Photo Section
- Aspect ratio: Square (`aspect-square`)
- Zoom on hover: `scale-105` with smooth transition
- Rounded top: `rounded-t-2xl`

### Verified Badge
- Position: Top right (`top-2 right-2`)
- Style: Emerald green with white text
- Icon: Star icon filled white
- Shadow for depth

### Content Section
- Padding: `p-6` (default) or `p-4` (compact)
- Spacing follows 4px grid

### Name
- Size: `text-xl` (default) or `text-lg` (compact)
- Color: `text-ink` → `text-brand` on hover
- Font weight: `font-semibold`

### Location
- Size: `text-sm`
- Color: `text-ink-soft` (muted gray)

### Rating
- Gold stars: `text-yellow-400 fill-yellow-400`
- Shows up to 5 stars
- Includes rating number and review count

### Tagline
- Only shown in default variant
- Line clamp: 2 lines max
- Color: `text-ink-soft`

### Tags
- Max 3 tags displayed
- Alternating backgrounds: `pride-lilac` and `pride-mint` (30% opacity)
- Rounded: `rounded-full`
- Size: `text-xs`

### Price
- Label: "From" in small text
- Amount: Large, semibold
- Color: `text-ink`

### Instant Book Badge
- Icon: Lightning bolt (Zap)
- Color: Brand red with light background
- Only shows when `instant_book` is true

## Variants

### Default
Full card with all details including tagline and spacing for optimal readability.

### Compact
Reduced padding and no tagline for denser layouts.

## Complementary Components

### GuideCardSkeleton
Loading state skeleton that matches the card structure.

### GuideCardGrid
Pre-configured responsive grid:
- 1 column on mobile
- 2 columns on small screens
- 3 columns on large screens
- 4 columns on extra large screens

## Brand Alignment

This component follows the Brand Style Guide V2:
- **Premium**: Soft shadows, quality animations
- **Calm**: Subtle colors, generous spacing
- **Minimal**: Clean design, essential information only
- **Warm**: Friendly microcopy, approachable design
- **Pride Details**: Subtle lilac and mint accents

## Accessibility

- Semantic HTML with proper heading hierarchy
- Alt text for images
- Keyboard navigable (Link component)
- Screen reader friendly badge labels

## Example: Full Page Implementation

```tsx
"use client";

import { GuideCard, GuideCardGrid, GuideCardSkeleton } from "@/components/cards/guide-card";
import { getGuides } from "@/lib/data-service";
import { useEffect, useState } from "react";

export default function GuidesPage() {
  const [guides, setGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getGuides().then((data) => {
      setGuides(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <GuideCardGrid>
        {[...Array(8)].map((_, i) => (
          <GuideCardSkeleton key={i} />
        ))}
      </GuideCardGrid>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-ink mb-2">
          Meet Our Guides
        </h1>
        <p className="text-ink-soft">
          {guides.length} verified local guides ready to show you their city
        </p>
      </div>

      <GuideCardGrid>
        {guides.map((guide) => (
          <GuideCard key={guide.id} guide={guide} />
        ))}
      </GuideCardGrid>
    </div>
  );
}
```

## Integration with Data Service

Works seamlessly with the data service layer:

```tsx
import { getGuides, getGuide } from "@/lib/data-service";

// Get all guides
const guides = await getGuides();

// Get guides for a specific city
const barcelonaGuides = await getGuides("barcelona");

// Get guides with filters
const filteredGuides = await getGuides(undefined, {
  verified: true,
  instantBook: true,
  tags: ["Food & Drink", "Art Scene"],
});
```

