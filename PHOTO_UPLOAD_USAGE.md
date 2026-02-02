# PhotoUpload Component - Usage Guide

## Quick Start

```tsx
import { PhotoUpload } from '@/components/ui/photo-upload';
import { uploadAvatar } from '@/lib/storage-helpers';

function MyComponent() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  return (
    <PhotoUpload
      variant="avatar"
      size="lg"
      value={photoUrl}
      onChange={setPhotoUrl}
      onUpload={(file) => uploadAvatar(userId, file)}
    />
  );
}
```

## Variant Examples

### 1. Avatar (Profile Photo)

```tsx
<PhotoUpload
  variant="avatar"
  size="lg"
  value={user.avatar_url}
  onChange={(url) => setUser({ ...user, avatar_url: url })}
  onUpload={async (file) => uploadAvatar(user.id, file)}
  placeholder={user.name}
  label="Profile Photo"
  helperText="JPG, PNG, WebP or GIF. Max 2MB."
/>
```

**Features:**

- Circular display
- Gradient background with initials
- "Upload Photo" / "Change Photo" button
- "Remove" button when photo exists

**Best for:**

- User profile photos
- Guide avatars
- Team member photos

---

### 2. Photo (Standard Upload)

```tsx
<PhotoUpload
  variant="photo"
  size="md"
  value={formData.coverImage}
  onChange={(url) => handleChange('coverImage', url)}
  onUpload={async (file) => uploadFile(file, 'images', userId, 'cover')}
  label="Cover Image"
  helperText="This image will appear at the top of your profile"
/>
```

**Features:**

- Rectangular with rounded corners
- Hover actions (change/remove)
- Click to upload when empty
- Preview with overlay controls

**Best for:**

- Cover images
- Tour photos
- General content images

---

### 3. Gallery (Multiple Photos)

```tsx
<PhotoUpload
  variant="gallery"
  size="md"
  value={formData.photoUrls}
  onChange={(urls) => setFormData({ ...formData, photoUrls: urls })}
  onUpload={async (file) => {
    const index = formData.photoUrls.length;
    return uploadTravelerPhoto(userId, file, index);
  }}
  maxFiles={4}
  label="Photo Gallery"
  helperText="Upload up to 4 photos"
/>
```

**Features:**

- Grid layout (responsive)
- Shows all uploaded photos
- Upload placeholder with counter (X/4)
- Individual remove buttons on hover

**Best for:**

- Photo galleries
- Portfolio images
- Multiple tour photos
- Property listings

---

### 4. Document (PDFs & Images)

```tsx
<PhotoUpload
  variant="document"
  size="xl"
  value={formData.idDocument}
  onChange={(url) => setFormData({ ...formData, idDocument: url })}
  onUpload={async (file) => uploadFile(file, 'documents', userId, 'id')}
  accept="image/*,application/pdf"
  maxSizeMB={10}
  label="ID Document"
  helperText="PNG, JPG, or PDF up to 10MB"
/>
```

**Features:**

- Large upload area
- Accepts documents and images
- Shows file icon for PDFs
- Secure upload messaging

**Best for:**

- ID verification
- Certificates
- Legal documents
- Contracts

---

## Props Reference

### Required Props

| Prop       | Type                              | Description                 |
| ---------- | --------------------------------- | --------------------------- |
| `value`    | `string \| string[] \| null`      | Current photo URL(s)        |
| `onChange` | `(url) => void`                   | Callback when photo changes |
| `onUpload` | `(file) => Promise<UploadResult>` | Upload function             |

### Optional Props

| Prop          | Type                                             | Default     | Description              |
| ------------- | ------------------------------------------------ | ----------- | ------------------------ |
| `variant`     | `"avatar" \| "photo" \| "document" \| "gallery"` | `"photo"`   | Visual style             |
| `size`        | `"sm" \| "md" \| "lg" \| "xl"`                   | `"md"`      | Component size           |
| `disabled`    | `boolean`                                        | `false`     | Disable upload           |
| `maxFiles`    | `number`                                         | `1`         | Max files (gallery only) |
| `accept`      | `string`                                         | `"image/*"` | Accepted file types      |
| `maxSizeMB`   | `number`                                         | `5`         | Max file size in MB      |
| `label`       | `string`                                         | -           | Label text               |
| `helperText`  | `string`                                         | -           | Helper text              |
| `showPreview` | `boolean`                                        | `true`      | Show instant preview     |
| `placeholder` | `string`                                         | -           | Avatar initials          |
| `className`   | `string`                                         | -           | Additional classes       |

---

## Upload Function Pattern

Your `onUpload` function should return:

```typescript
{
  success: boolean;
  url?: string;       // Public URL if successful
  error?: string;     // Error message if failed
}
```

Example implementations:

### Using Storage Helpers

```tsx
// Avatar
onUpload={(file) => uploadAvatar(userId, file)}

// Guide photo
onUpload={(file) => uploadGuidePhoto(guideId, file)}

// Traveler photo gallery
onUpload={(file) => uploadTravelerPhoto(userId, file, index)}

// Custom bucket
onUpload={(file) => uploadFile(file, 'bucket-name', userId, 'filename')}
```

### Custom Upload Logic

```tsx
onUpload={async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    return {
      success: response.ok,
      url: data.url,
      error: data.error,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Upload failed',
    };
  }
}
```

---

## Size Guidelines

### Avatar Variant

- `sm` - 64px (w-16 h-16)
- `md` - 96px (w-24 h-24)
- `lg` - 128px (w-32 h-32)
- `xl` - 160px (w-40 h-40)

### Photo/Document Variants

- `sm` - 128px height
- `md` - 160px height
- `lg` - 192px height
- `xl` - 224px height

### Gallery Variant

- `sm` - 96px height per item
- `md` - 128px height per item
- `lg` - 160px height per item
- `xl` - 192px height per item

---

## Styling & Customization

### Using className

```tsx
<PhotoUpload
  variant="avatar"
  className="my-8" // Add margin
  // ...other props
/>
```

### Custom Labels

```tsx
<div className="space-y-4">
  <div>
    <h3 className="text-lg font-medium">Profile Photo</h3>
    <p className="text-sm text-muted-foreground">
      Your main photo that travelers will see
    </p>
  </div>
  <PhotoUpload variant="avatar" {...props} />
</div>
```

---

## Error Handling

The component validates:

1. File type matches `accept` prop
2. File size under `maxSizeMB`
3. Upload function success/failure

Error messages appear below the upload area in red text.

### Custom Error Messages

The upload function can return custom errors:

```tsx
onUpload={async (file) => {
  if (file.size > 2 * 1024 * 1024) {
    return {
      success: false,
      error: 'Image must be under 2MB for optimal performance',
    };
  }

  // ... rest of upload logic
}
```

---

## Common Patterns

### Required Photo with Label

```tsx
<div className="space-y-2">
  <label className="text-sm font-medium">
    Profile Photo <span className="text-red-500">*</span>
  </label>
  <PhotoUpload variant="avatar" {...props} />
</div>
```

### Disabled State

```tsx
<PhotoUpload
  variant="avatar"
  disabled={isSubmitting}
  helperText={isSubmitting ? 'Saving...' : 'Upload photo'}
  {...props}
/>
```

### Gallery with Dynamic Upload

```tsx
const [photos, setPhotos] = useState<string[]>([]);

<PhotoUpload
  variant="gallery"
  value={photos}
  onChange={setPhotos}
  onUpload={async (file) => {
    // Index is automatically the next slot
    const index = photos.length;
    return uploadTravelerPhoto(userId, file, index);
  }}
  maxFiles={4}
/>;
```

---

## Accessibility

The component includes:

- Proper ARIA labels
- Keyboard navigation
- Focus states
- Screen reader friendly
- Error announcements

---

## Mobile Considerations

- Touch-friendly hit areas
- Responsive grid layouts
- Mobile camera access via `accept="image/*"`
- Optimized file size validation
- Loading states for slower connections

---

## Browser Support

Works on all modern browsers:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Troubleshooting

### Photo not uploading

1. Check upload function returns correct format
2. Verify user authentication
3. Check Supabase bucket permissions
4. Verify file size under limit

### Preview not showing

1. Ensure `showPreview={true}` (default)
2. Check file is image type
3. Verify browser supports FileReader API

### Gallery not adding photos

1. Check `maxFiles` not reached
2. Verify `value` is array type
3. Ensure `onChange` updates state correctly

---

## Examples in Codebase

See working implementations in:

- `components/traveler/profile-form.tsx` - Avatar + Gallery
- `app/traveler/onboarding/page.tsx` - Avatar
- `components/guide/profile-form.tsx` - Avatar
- `components/guide/onboarding/Step1BasicInfo.tsx` - Photo
- `components/guide/onboarding/Step6IDUpload.tsx` - Document
