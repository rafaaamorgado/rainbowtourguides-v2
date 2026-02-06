# Photo Upload Component Implementation

## Overview

A comprehensive, reusable photo upload component has been created and implemented across all photo/document upload locations in the application.

## New Component: `PhotoUpload`

**Location:** `components/ui/photo-upload.tsx`

### Features

- **Multiple Variants:**
  - `avatar` - Circular profile photo with gradient placeholder
  - `photo` - Standard rectangular photo upload
  - `document` - Document upload (images or PDFs)
  - `gallery` - Multiple photo gallery (up to N photos)

- **Configurable Sizes:** `sm`, `md`, `lg`, `xl`
- **File Validation:** File type and size checking
- **Preview:** Instant preview before upload completes
- **Error Handling:** Clear error messages
- **Upload Progress:** Loading states with spinners
- **Responsive Design:** Mobile-friendly layouts

### Props

```typescript
interface PhotoUploadProps {
  value?: string | string[] | null; // Current URL(s)
  onChange: (url: string | string[] | null) => void;
  onUpload: (file: File) => Promise<UploadResult>;
  variant?: 'avatar' | 'photo' | 'document' | 'gallery';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  maxFiles?: number; // For gallery variant
  accept?: string; // File types
  maxSizeMB?: number; // Max file size
  label?: string;
  helperText?: string;
  showPreview?: boolean;
  className?: string;
  placeholder?: string; // For avatar initials
}
```

## Implementation Locations

### 1. ✅ Traveler Profile Form

**File:** `components/traveler/profile-form.tsx`

- **Main Profile Photo:**
  - Variant: `avatar`
  - Size: `lg`
  - Uploads to: `avatars` bucket
  - Shows initials placeholder

- **Additional Photos (Gallery):**
  - Variant: `gallery`
  - Size: `md`
  - Max: 4 photos
  - Uploads to: `avatars` bucket

### 2. ✅ Traveler Onboarding

**File:** `app/traveler/onboarding/page.tsx`

- **Profile Photo:**
  - Variant: `avatar`
  - Size: `lg`
  - Uploads to: `avatars` bucket
  - Optional field

### 3. ✅ Guide Profile Form

**File:** `components/guide/profile-form.tsx`

- **Profile Photo:**
  - Variant: `avatar`
  - Size: `lg`
  - Uploads to: `avatars` bucket
  - Used in edit profile page

### 4. ✅ Guide Onboarding (Legacy)

**File:** `components/guide/onboarding/Step1BasicInfo.tsx`

- **Profile Photo:**
  - Variant: `photo`
  - Size: `md`
  - Uploads to: `guide-photos` bucket
  - Required field

### 5. ✅ Guide Onboarding (New)

**File:** `components/guide/onboarding/step-basic-info.tsx`

- **Profile Photo:**
  - Variant: `avatar`
  - Size: `lg`
  - Uploads to: `avatars` bucket
  - Now fully functional (was placeholder)

### 6. ✅ Guide ID Verification

**File:** `components/guide/onboarding/Step6IDUpload.tsx`

- **ID Document:**
  - Variant: `document`
  - Size: `xl`
  - Accepts: `image/*,application/pdf`
  - Max: 10MB
  - Uploads to: `guide-documents` bucket (private)

## Storage Helpers

The component integrates with existing storage helpers:

- `uploadAvatar(userId, file)` - For profile avatars
- `uploadTravelerPhoto(userId, file, index)` - For traveler galleries
- `uploadFile(file, bucket, folder, filename)` - Generic upload

## Visual Styles

### Avatar Variant

- Circular design
- Gradient background (pride colors)
- Shows initials when no photo
- Upload/Change/Remove buttons

### Photo Variant

- Rectangular with rounded corners
- Dashed border when empty
- Hover actions (change/remove)
- Upload icon and instructions

### Gallery Variant

- Grid layout (2 cols mobile, 4 cols desktop)
- Upload placeholder shows remaining slots
- Individual remove buttons on hover
- Counter showing X/N photos

### Document Variant

- Large upload area
- Accepts images and PDFs
- Security messaging for ID uploads
- Blurred preview for sensitive docs

## UI/UX Improvements

1. **Instant Feedback:**
   - Preview appears immediately
   - Loading spinner during upload
   - Success/error states

2. **Clear Instructions:**
   - File type hints
   - Size limits displayed
   - Helper text for each context

3. **Modern Design:**
   - Smooth transitions
   - Gradient backgrounds
   - Lucide icons
   - Hover effects

4. **Accessibility:**
   - Proper labels
   - Disabled states
   - Error messages
   - Keyboard navigation

## Testing Guide

### 1. Test Traveler Profile Photos

1. Go to `/traveler/profile`
2. Upload main profile photo (avatar)
3. Verify preview appears
4. Try to upload >2MB file (should error)
5. Upload up to 4 additional photos
6. Remove photos
7. Save and verify photos persist

### 2. Test Traveler Onboarding

1. Create new traveler account
2. Go to `/traveler/onboarding`
3. Upload profile photo (optional)
4. Complete and verify photo saved

### 3. Test Guide Profile

1. Log in as guide
2. Go to `/guide/profile`
3. Upload/change profile photo
4. Verify shows on public profile

### 4. Test Guide Onboarding

1. Sign up as new guide
2. Go through onboarding steps
3. Upload profile photo in Step 1
4. Upload ID document in Step 6
5. Complete and verify

### 5. Test Edge Cases

- Upload wrong file type
- Upload oversized file
- Upload while offline
- Remove and re-upload
- Cancel upload mid-process

## Error Handling

The component handles:

- Invalid file types
- File size limits
- Upload failures
- Network errors
- Authentication errors

## Browser Compatibility

Tested and works on:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Dependencies

- React hooks (useState, useRef, useCallback)
- Lucide icons
- Tailwind CSS
- Existing storage helpers

## Future Enhancements

Potential improvements:

1. Image cropping tool
2. Drag-and-drop support
3. Webcam capture
4. Image filters/adjustments
5. Compression before upload
6. Multi-file parallel upload
7. Progress bars for large files
8. Image metadata extraction

## Migration Notes

### Old Components Replaced

- `components/ui/avatar-upload.tsx` - Can be deprecated
- Custom upload code in Step1BasicInfo - Replaced
- Placeholder upload UI - Now functional

### Breaking Changes

None - the new component is backward compatible with existing upload functions.

## Code Quality

- ✅ No linter errors
- ✅ TypeScript type safety
- ✅ Follows project architecture
- ✅ Reusable and composable
- ✅ Consistent with design system
