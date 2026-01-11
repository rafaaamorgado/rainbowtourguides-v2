# Guide Profile Editor

Single-page profile editor for guides to update their information.

## Overview

Reuses onboarding form fields but organized into sections with individual save buttons. Each section can be edited and saved independently.

## Structure

### Components
- **Page** (`page.tsx`) - Main profile editor
- **Toast** (`components/ui/toast.tsx`) - Success notifications

### Sections (5 total)

## 1. Photo & Basic Info
**Fields:**
- Profile Photo URL
- Full Name
- City (dropdown)
- Languages (multi-select checkboxes)

**Layout:** 2-column grid on desktop

**Save Button:** Top-right of section

## 2. Bio & Tagline
**Fields:**
- Tagline (60 chars max with counter)
- Bio (500 chars max with counter)

**Layout:** Full-width fields

**Save Button:** Top-right of section

## 3. Experience Tags
**Fields:**
- Multi-select tags (8 options)
- Pill-style selection

**Tags:**
- Nightlife, Daytime Culture, Food & Drink, Queer History
- Hidden Gems, Architecture, Nature, Art Scene

**Layout:** Flexbox wrap

**Save Button:** Top-right of section

## 4. Pricing
**Fields:**
- 4 Hours price
- 6 Hours price
- 8 Hours price

**Commission Note:** Blue info box explaining 20% platform fee

**Calculation:** Shows "You receive: $X" (80% of price)

**Layout:** 3-column grid

**Save Button:** Top-right of section

## 5. Availability
**Fields:**
- General availability notes (textarea)
- Link to full Availability Calendar

**Note:** Simplified view with link to detailed calendar management

**Save Button:** Top-right of section

## Bonus: Profile Status
Displays current approval status:
- **Approved**: Emerald badge
- **Under Review**: Amber badge + explanation

## Features

### Individual Section Saving
Each section saves independently:
```typescript
const handleSaveSection = async (section: string) => {
  setSavingSection(section);
  // Show loading state
  await saveToLocalStorage(); // Mock save
  setSavingSection(null);
  showToast("Changes saved successfully!");
};
```

### Loading States
- Button shows "Saving..." with spinner
- Button disabled during save
- Only one section can save at a time

### Success Toast
- Appears top-right
- Green checkmark icon
- "Changes saved successfully!"
- Auto-dismisses after 3s
- Close button (X)

### Data Loading
```typescript
useEffect(() => {
  // Load cities for dropdown
  getCities().then(setCities);
  
  // Load current guide data
  getGuide(guideId).then(guideData => {
    setFormData(guideData);
  });
}, []);
```

### Data Persistence
```typescript
// Save to localStorage (mock)
localStorage.setItem("guide_profile", JSON.stringify(formData));

// Future: Save to Supabase
await updateGuide(guideId, formData);
```

## Section Headers

Each section has:
- **Title**: Bold, large
- **Description**: Small, muted
- **Save Button**: Right-aligned

```tsx
<div className="flex items-center justify-between border-b pb-4">
  <div>
    <h2>Section Title</h2>
    <p>Section description</p>
  </div>
  <Button onClick={handleSave}>Save Changes</Button>
</div>
```

## Form State Management

### useState Hooks
- `formData` - All field values
- `cities` - Available cities list
- `isLoading` - Initial load state
- `savingSection` - Track which section is saving
- `toast` - Toast notification state

### Data Flow
```typescript
1. Load guide data on mount
2. User edits field
3. formData updates via handleChange
4. User clicks "Save Changes" for section
5. Shows loading state
6. Saves to localStorage
7. Shows success toast
8. Hides loading state
```

## Toast System

### Custom Hook
```typescript
const { toast, showToast, hideToast } = useToast();

// Show success
showToast("Changes saved successfully!");

// Show error
showToast("Failed to save", "error");
```

### Component
- Fixed position (top-right)
- Animated entrance
- Auto-dismiss after 3s
- Manual close button
- Success (green) or Error (red)

## Responsive Design

### Desktop
- 2-3 column grids
- Side-by-side buttons
- Comfortable spacing

### Mobile
- Single column stacks
- Full-width inputs
- Touch-friendly targets

## Differences from Onboarding

| Feature | Onboarding | Profile Editor |
|---------|-----------|----------------|
| Layout | Multi-step wizard | Single page, sections |
| Progress | Step indicator | Section headers |
| Save | Draft to localStorage | Per-section saves |
| Navigation | Next/Back buttons | Scroll + section buttons |
| Validation | Per-step | Per-section (optional) |
| Success | Full-screen redirect | Toast notification |

## Benefits of Section-Based

1. **Quick Updates**: Edit one section without navigating
2. **Clear Organization**: Related fields grouped
3. **Individual Save**: Save one section at a time
4. **No Progress Loss**: Each section saves independently
5. **Better UX**: See entire profile at once

## Character Limits

| Field | Limit |
|-------|-------|
| Tagline | 60 |
| Bio | 500 |

## Price Minimums

| Duration | Minimum |
|----------|---------|
| 4 hours | $50 |
| 6 hours | $75 |
| 8 hours | $100 |

## Future Enhancements

1. **Real-time Validation**: Validate as user types
2. **Photo Upload**: Real file upload with preview
3. **Crop Tool**: Crop/edit photos in-browser
4. **Auto-save**: Save on every change (debounced)
5. **Change History**: Track profile edits
6. **Preview Mode**: See how profile looks to travelers
7. **Comparison View**: Compare with top guides
8. **SEO Preview**: How profile appears in search
9. **Analytics**: Profile views, conversion rate
10. **A/B Testing**: Test different taglines/prices

## Accessibility

- Semantic HTML forms
- Proper label associations
- Keyboard navigation
- Focus visible states
- Screen reader friendly
- Character counters for limited fields

## Brand Consistency ✨

- **Clean Layout**: Organized sections
- **Minimal**: One task per section
- **Premium**: Quality shadows, smooth saves
- **Encouraging**: Success feedback
- **Professional**: Emerald green for approval

## Testing Checklist

- [ ] Loads guide data correctly
- [ ] All fields display current values
- [ ] Character counters update
- [ ] Multi-select checkboxes work
- [ ] Save button per section works
- [ ] Loading states show correctly
- [ ] Toast appears on save
- [ ] Toast auto-dismisses
- [ ] Toast close button works
- [ ] Data persists to localStorage
- [ ] Mobile layout stacks properly
- [ ] Profile status displays correctly

## Usage

```typescript
// Navigate to profile editor
<Link href="/guide/profile">Edit Profile</Link>

// The page will:
// 1. Load current guide data
// 2. Display in editable sections
// 3. Allow per-section saves
// 4. Show success toasts
```

## Performance

- Client component for interactivity
- Loads data on mount
- Optimistic updates (instant feedback)
- Debounced auto-save (future)
- Minimal re-renders (section-based state)

