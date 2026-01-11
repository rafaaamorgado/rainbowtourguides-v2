# Guide Onboarding Wizard

Comprehensive 7-step onboarding process for new guides.

## Overview

Multi-step form wizard that collects all necessary information to create a guide profile. Features progress tracking, validation, draft saving, and a review step.

## Structure

### Main Component (`page.tsx`)
- State management for 7 steps
- Form data and validation
- Draft saving to localStorage
- Navigation between steps
- Submit functionality

### Progress Indicator (`progress-indicator.tsx`)
- Visual step indicator
- Shows completed (checkmark), current (ring), and upcoming steps
- Responsive: Shows step numbers + labels

### Step Components (`steps.tsx`)
Seven individual step components with specific form fields.

## Steps Breakdown

### Step 1: Basic Information
**Fields:**
- Photo URL (text input for mock)
- Full Name* (required)
- City* (select from cities)
- Languages* (multi-select checkboxes: English, Spanish, Portuguese, French, German, Italian)
- Short Bio* (textarea, 200-500 chars)
- Tagline* (input, 60 chars max)

**Validation:**
- Name required
- City required
- At least 1 language
- Bio minimum 200 characters
- Tagline required

### Step 2: LGBTQ+ Alignment
**Fields:**
- "I identify as LGBTQ+" (checkbox)
- "I'm an LGBTQ+ ally" (checkbox)
- Why I enjoy guiding LGBTQ+ travelers* (textarea, 100-300 chars)
- Safety commitment* (checkbox with terms)

**Validation:**
- Why guide: minimum 100 characters
- Safety commitment: required

### Step 3: Experience & Tags
**Fields:**
- Experience Tags* (multi-select, min 3):
  - Nightlife, Daytime Culture, Food & Drink, Queer History
  - Hidden Gems, Architecture, Nature, Art Scene
- Tour Description* (textarea, 150-400 chars)

**Validation:**
- Minimum 3 tags selected
- Description minimum 150 characters

### Step 4: Pricing
**Fields:**
- 4 hours price* (min: $50)
- 6 hours price* (min: $75)
- 8 hours price* (min: $100)
- Shows commission breakdown (you receive 80%)

**Validation:**
- All three prices required
- Minimum amounts enforced
- Shows guide's take (80%) below each input

### Step 5: Availability
**Fields:**
- Available Days* (checkboxes: Mon-Sun)
- Time Ranges* (checkboxes: Morning, Afternoon, Evening)
- Additional Notes (textarea, optional)

**Validation:**
- At least 1 day selected
- At least 1 time range selected

### Step 6: ID Verification
**Fields:**
- ID Document Upload* (file input: image/*, .pdf)
- Mock: Just stores filename

**Privacy Notice:**
- Blue info box explaining secure storage
- Admin-only access
- Never shown to travelers

**Instructions:**
- Photo must be clear
- All information visible
- Not expired

### Step 7: Review & Submit
**Features:**
- Profile preview card with all entered data
- Organized in 2-column grid
- Shows:
  - Name, Location, Languages
  - Experience tags
  - Tagline, Pricing, Availability
  - ID document status
  - Full bio
- Terms acceptance checkbox* (required)
- Links to Terms and Code of Conduct

## Navigation

### Buttons
- **Back**: Available on steps 2-7
- **Save Draft**: Available on all steps
- **Next**: Available on steps 1-6 (validates before proceeding)
- **Submit for Review**: On step 7 only

### Keyboard
- Scroll to top when changing steps
- Form submission on final step

## Validation System

### Per-Step Validation
Each step validates required fields before allowing progress:

```typescript
const validateStep = (step: number): boolean => {
  // Check required fields for current step
  // Set errors object
  // Return true/false
};
```

### Inline Errors
- Shows below each field
- Red text
- Cleared when field is edited

### Required Field Indicator
Red asterisk (*) next to labels

## Draft Saving

### Auto-save to localStorage
```typescript
const STORAGE_KEY = "guide_onboarding_draft";

// Save draft
localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

// Load draft on mount
const draft = localStorage.getItem(STORAGE_KEY);
if (draft) setFormData(JSON.parse(draft));

// Clear draft on submit
localStorage.removeItem(STORAGE_KEY);
```

### "Save Draft" Button
- Available on all steps
- Shows success alert
- Doesn't navigate away

## Submit Flow

### Step 7 → Submit
```typescript
1. Validate all Step 7 fields
2. Save to localStorage (mock database)
3. Clear draft
4. Show success screen
5. Redirect to /guide/dashboard after 2s
```

### Success Screen
- Checkmark icon (emerald)
- Title: "Profile Submitted!"
- Message: "Your profile has been submitted..."
- Auto-redirect message

## Form Data Structure

```typescript
interface OnboardingFormData {
  // Step 1
  photo_url: string;
  name: string;
  city_id: string;
  languages: string[];
  bio: string;
  tagline: string;
  
  // Step 2
  identifies_lgbtq: boolean;
  is_ally: boolean;
  why_guide_lgbtq: string;
  safety_commitment: boolean;
  
  // Step 3
  experience_tags: string[];
  tour_description: string;
  
  // Step 4
  price_4h: number;
  price_6h: number;
  price_8h: number;
  
  // Step 5
  available_days: string[];
  time_ranges: string[];
  availability_notes: string;
  
  // Step 6
  id_document: string;
  
  // Step 7
  terms_accepted: boolean;
}
```

## Progress Indicator

### Visual Design
- 7 circles connected by lines
- **Completed**: Brand red with checkmark, filled line
- **Current**: Brand red with ring animation
- **Upcoming**: Gray with number, gray line

### Responsive
- Desktop: Shows step labels below circles
- Mobile: Hides labels, shows circles only

## Design Patterns

### Field Groups
- Related fields grouped together
- Clear labels with required indicators
- Helper text below inputs
- Character counters for limited fields

### Checkboxes
- Large touch targets (p-4)
- Border hover effects
- Selected state highlighted

### Multi-select
- Visual selection with border color
- Tag-style for experience tags
- Button-style for days/times

## Brand Consistency ✨

### Clean & Minimal
- One step at a time
- No overwhelm
- Clear progress

### Encouraging Tone
- Friendly labels
- Helpful descriptions
- Positive reinforcement

### Premium Feel
- Smooth transitions
- Quality shadows
- Rounded corners (`rounded-2xl`)

## Accessibility

- Semantic HTML forms
- Proper label associations
- Keyboard navigation
- Focus visible states
- Screen reader friendly
- Required field indicators

## Validation Messages

### Character Minimums
- Bio: 200 characters
- Why guide LGBTQ+: 100 characters
- Tour description: 150 characters

### Selection Minimums
- Languages: 1
- Experience tags: 3
- Days: 1
- Time ranges: 1

### Price Minimums
- 4 hours: $50
- 6 hours: $75
- 8 hours: $100

## Future Enhancements

1. **Real File Upload**: Integrate with Supabase Storage
2. **Photo Preview**: Show uploaded photo in real-time
3. **Auto-save**: Save draft on every change
4. **Progress Persistence**: Remember step on refresh
5. **Validation Libraries**: Integrate Zod + React Hook Form
6. **Rich Text Editor**: For bio and descriptions
7. **Photo Editor**: Crop and adjust photos
8. **Video Introduction**: Upload intro video
9. **Multi-language**: Support for multiple languages
10. **Calendar Integration**: Import availability from Google Calendar

## Testing Checklist

- [ ] All steps render correctly
- [ ] Progress indicator updates
- [ ] Next button validates current step
- [ ] Back button works
- [ ] Save draft stores to localStorage
- [ ] Draft loads on mount
- [ ] Required field validation works
- [ ] Character counters update
- [ ] Multi-select checkboxes work
- [ ] Price calculations show correctly
- [ ] Submit creates profile
- [ ] Success screen shows
- [ ] Redirects to dashboard
- [ ] Mobile layout works

## Usage

```typescript
// Navigate to onboarding
<Link href="/guide/onboarding">Complete Onboarding</Link>

// The wizard will:
// 1. Guide through 7 steps
// 2. Validate each step
// 3. Allow draft saving
// 4. Submit for review
// 5. Redirect to dashboard
```

## Error Handling

### Inline Errors
- Show below each field
- Red text (`text-red-600`)
- Clear on field change

### Step Validation
- Prevents progression without required fields
- Highlights missing fields
- Scrolls to top on step change

## Commission Note

Shown in Step 4 (Pricing):
- Platform takes 20%
- Guide receives 80%
- Shown per price tier

## Privacy & Security

### ID Verification
- Secure storage promise
- Admin-only review
- Clear privacy policy
- Never shown to travelers

### Data Storage
- Currently: localStorage (mock)
- Future: Supabase encrypted storage
- GDPR compliant

