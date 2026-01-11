# Guide Profile Page

Comprehensive guide profile page with booking functionality.

## Structure

### Server Component (`page.tsx`)
Fetches guide and review data from the data-service layer.

### Client Component (`booking-card.tsx`)
Handles booking form state, validation, and submission.

## Page Sections

### 1. Hero Section
- **Background**: Blurred city image with dark overlay
- **Guide Photo**: 
  - Size: `w-32 h-32`
  - Style: `rounded-full`, `border-4 border-white`, `shadow-lg`
  - Verified badge overlay (bottom-right)
- **Guide Info**:
  - Name: `text-4xl font-bold text-white`
  - Location: City name with MapPin icon
  - Rating: Star display + count + "(X reviews)"
  - Verified badge: Emerald green

### 2. Main Content Grid
Layout: `grid-cols-1 lg:grid-cols-3 gap-8`

#### Left Column (`lg:col-span-2`)

##### About Section
- H2: "About [Name]"
- Bio text with generous line height
- Tagline in accent box with brand color border-left

##### Languages
- Globe icon + heading
- Language badges with `bg-pride-lilac/30`
- Examples: Portuguese, English, Spanish

##### Specialties
- Experience tags with `bg-pride-mint/30`
- Examples: Street Art, Beaches, Nightlife

##### Tour Highlights
- Grid of 3 images (`grid-cols-1 md:grid-cols-3`)
- Images: `aspect-video`, `rounded-2xl`
- Placeholder images from Unsplash (city landmarks)

##### Reviews Section
- H3: "Reviews (X)"
- Review cards:
  - Avatar: Gradient circle with first letter
  - Name + date (month/year format)
  - Star rating (5 gold stars)
  - Review text
  - Card style: `bg-panel-light`, `border`, `rounded-xl`, `p-6`
- Empty state if no reviews

#### Right Column (`lg:col-span-1`)

##### Booking Card (Sticky)
- Position: `sticky top-24`
- Style: `bg-panel-light`, `border-2`, `rounded-2xl`, `shadow-glass`

**Form Fields:**

1. **Price Display**
   - "Starting from" label
   - Price: `text-3xl font-bold`
   - "/ per tour" suffix

2. **Tour Duration (Radio Buttons)**
   - 4 hours ($X)
   - 6 hours ($X)
   - 8 hours ($X)
   - Selected: `border-brand bg-brand/5`

3. **Date Picker**
   - Input type: date
   - Min: Today's date
   - Future dates only

4. **Time Picker**
   - Input type: time
   - Standard time format

5. **Number of Travelers**
   - Select: 1-4 people
   - Note: "Max group size: 4 people"

6. **Meeting Location**
   - Select dropdown:
     - Guide's Default Meetup (default)
     - My Hotel
     - Custom Location

7. **Special Requests (Optional)**
   - Textarea: 3 rows
   - Placeholder: "Any specific interests, dietary restrictions, or accessibility needs?"

8. **Price Summary**
   - Base tour price (duration-based)
   - Service fee (10% of base)
   - Total (bold, larger text)

9. **Submit Button**
   - Text: "Request to Book"
   - Full width: `w-full py-4`
   - Brand primary color

10. **Note**
    - "You won't be charged yet. The guide will confirm availability first."
    - Small text, centered

## Functionality

### Form Validation
- All required fields must be filled
- Date must be in the future
- Time must be selected
- Validates before submission

### Price Recalculation
- Automatically updates when duration changes
- Recalculates service fee (10%)
- Updates total in real-time

### Authentication Check
- If user is authenticated:
  - Creates booking request
  - Navigates to `/traveler/bookings`
- If not authenticated:
  - Redirects to `/auth/sign-in?redirect=/guides/[slug]`

### Booking Submission
1. Validates all fields
2. Checks future date requirement
3. Checks authentication status
4. Creates booking via data-service (TODO)
5. Shows loading state during submission
6. Handles errors gracefully
7. Redirects on success

### Error Handling
- Form validation errors shown inline
- Past date error: "Please select a future date and time"
- Missing fields: "Please select a date and time"
- API errors: "Failed to create booking request. Please try again."

## Data Flow

```typescript
// Server Component (page.tsx)
const guide = await getGuide(slug);           // From data-service
const reviews = await getReviews(guide.id);   // From data-service

// Pass to Client Component
<BookingCard guide={guide} isAuthenticated={isAuthenticated} />

// Client Component (booking-card.tsx)
// Handles form state and submission
const handleSubmit = async (e: FormEvent) => {
  // Validation
  // Auth check
  // Create booking
  // Navigate
};
```

## SEO & Metadata

- **Title**: `[Name] - [City] LGBTQ+ Tour Guide | Rainbow Tour Guides`
- **Description**: First 155 characters of bio
- **OpenGraph**: Profile type with guide info

## Brand Alignment

- **Premium**: High-quality images, smooth interactions
- **Trust Signals**: Verified badge, reviews, clear pricing
- **Clear Pricing**: Transparent breakdown with service fee
- **Booking Experience**: Step-by-step, no surprises
- **Mobile-Friendly**: Responsive grid, stacks on mobile

## Future Enhancements

1. **Real-time Availability**: Check guide's calendar
2. **Instant Book**: Skip approval for verified guides
3. **Payment Integration**: Stripe Checkout
4. **Calendar Sync**: Add to Google Calendar
5. **Messaging**: Direct chat before booking
6. **Favorites**: Save guides for later
7. **Gift Cards**: Purchase tours as gifts
8. **Group Pricing**: Discounts for larger groups
9. **Recurring Tours**: Book multiple dates
10. **Reviews Photos**: Upload images with reviews

## Components Used

- `BookingCard` - Client component for booking form
- `Badge` - For languages, tags, verified status
- `Button`, `Input`, `Select`, `Textarea` - Form components
- `Image` - Next.js optimized images
- Icons - From `lucide-react`

## Example Usage

```typescript
// Navigate to guide profile
<Link href="/guides/marco-silva">View Guide</Link>

// The page will:
// 1. Fetch Marco Silva's data
// 2. Fetch his reviews
// 3. Display profile with booking card
// 4. Allow authenticated users to book
```

## Performance

- **Server Component**: Initial data fetch on server (fast first load)
- **Client Component**: Interactive booking form (instant updates)
- **Image Optimization**: Next.js Image component for optimized delivery
- **Lazy Loading**: Reviews load with page (could be paginated)

## Accessibility

- Semantic HTML with proper heading hierarchy
- Form labels for all inputs
- Alt text for images
- Keyboard navigable
- ARIA attributes where needed
- Color contrast meets WCAG standards

