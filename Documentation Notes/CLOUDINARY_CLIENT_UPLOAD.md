# Cloudinary Client Upload Implementation

This document describes the client-side upload implementation for Cloudinary signed uploads.

## Overview

The upload system uses a **signed upload flow** for security:

1. **Client** validates file (type, size)
2. **Client** requests signature from your API (`/api/cloudinary/sign`)
3. **Server** verifies authentication and returns signature
4. **Client** uploads directly to Cloudinary with signature
5. **Cloudinary** verifies signature and stores the file

## Architecture

```
┌─────────────┐
│   Client    │
│ Component   │
└──────┬──────┘
       │ 1. Call uploadAvatar(file)
       ▼
┌─────────────────────────┐
│  lib/cloudinary/        │
│  uploadImage.ts         │
├─────────────────────────┤
│ • Validate file         │
│ • Request signature     │
│ • Upload to Cloudinary  │
└──────┬──────────────┬───┘
       │              │
       │ 2. POST      │ 4. Upload
       ▼              ▼
┌──────────────┐   ┌─────────────┐
│ /api/        │   │ Cloudinary  │
│ cloudinary/  │   │ API         │
│ sign         │   │             │
└──────────────┘   └─────────────┘
```

## File Structure

```
lib/cloudinary/
├── uploadImage.ts      # Main upload helper
├── README.md          # Usage documentation
└── index.ts           # Public exports
```

## Main Function

### `uploadImageSigned({ file, preset })`

```typescript
import { uploadImageSigned } from '@/lib/cloudinary';

const result = await uploadImageSigned({
  file: selectedFile,
  preset: 'avatar_preset',
});

if (result.success) {
  // Upload successful
  console.log('URL:', result.secure_url);
  console.log('Size:', result.width, 'x', result.height);
  console.log('ID:', result.public_id);
} else {
  // Upload failed
  console.error('Error:', result.error);
  console.error('Code:', result.code);
}
```

## Validation Rules

### File Type

- ✅ Must be an image (`image/*`)
- ❌ Rejects non-image files (PDFs, videos, etc.)

### File Size

| Preset                  | Max Size | Use Case            |
| ----------------------- | -------- | ------------------- |
| `avatar_preset`         | 5MB      | User avatars        |
| `cover_preset`          | 10MB     | Cover/banner images |
| `profile_images_preset` | 10MB     | Profile galleries   |

### Error Messages

All validation errors return user-friendly messages:

```typescript
// File too large
{
  success: false,
  error: "File size (12.5MB) exceeds maximum allowed size of 10MB",
  code: "Error"
}

// Wrong type
{
  success: false,
  error: "Invalid file type: video/mp4. Only images are allowed.",
  code: "Error"
}

// Network error
{
  success: false,
  error: "Failed to connect to Cloudinary: Network request failed",
  code: "Error"
}
```

## Convenience Functions

### `uploadAvatar(file)`

For user profile pictures (max 5MB).

```tsx
import { uploadAvatar } from '@/lib/cloudinary';

const result = await uploadAvatar(file);
```

### `uploadCover(file)`

For cover/banner images (max 10MB).

```tsx
import { uploadCover } from '@/lib/cloudinary';

const result = await uploadCover(file);
```

### `uploadProfileImage(file)`

For profile image galleries (max 10MB).

```tsx
import { uploadProfileImage } from '@/lib/cloudinary';

const result = await uploadProfileImage(file);
```

## React Component Example

```tsx
'use client';

import { useState } from 'react';
import { uploadAvatar, type UploadResponse } from '@/lib/cloudinary';

export function AvatarUploader() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const result = await uploadAvatar(file);

    if (result.success) {
      setAvatarUrl(result.secure_url);
      // TODO: Save to database
      // await saveAvatarUrl(result.secure_url);
    } else {
      setError(result.error);
    }

    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="block"
      />

      {uploading && <div className="text-blue-600">Uploading...</div>}

      {error && <div className="text-red-600">{error}</div>}

      {avatarUrl && (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="w-32 h-32 rounded-full object-cover"
        />
      )}
    </div>
  );
}
```

## Integration with Existing Components

### With PhotoUpload Component

```tsx
'use client';

import { useState } from 'react';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { uploadAvatar } from '@/lib/cloudinary';

export function ProfilePhotoSection({ userId }: { userId: string }) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    const result = await uploadAvatar(file);

    if (result.success) {
      // Also save to database
      await fetch('/api/profile/avatar', {
        method: 'POST',
        body: JSON.stringify({
          avatar_url: result.secure_url,
          public_id: result.public_id,
        }),
      });

      return {
        success: true,
        url: result.secure_url,
      };
    }

    return {
      success: false,
      error: result.error,
    };
  };

  const handleChange = (url: string | string[] | null) => {
    setAvatarUrl(typeof url === 'string' ? url : null);
  };

  return (
    <PhotoUpload
      variant="avatar"
      value={avatarUrl}
      onChange={handleChange}
      onUpload={handleUpload}
      helperText="Max 5MB. JPG, PNG, WebP, or GIF."
    />
  );
}
```

## Type Definitions

```typescript
// Upload preset types
type UploadPreset = 'avatar_preset' | 'cover_preset' | 'profile_images_preset';

// Success response
interface UploadResult {
  success: true;
  public_id: string; // e.g., "users/avatars/user-123/avatar.jpg"
  secure_url: string; // e.g., "https://res.cloudinary.com/..."
  width: number; // Image width in pixels
  height: number; // Image height in pixels
}

// Error response
interface UploadError {
  success: false;
  error: string; // Human-readable error message
  code?: string; // Error code
}

// Union type
type UploadResponse = UploadResult | UploadError;

// Upload options
interface UploadOptions {
  file: File;
  preset: UploadPreset;
}
```

## Error Handling Best Practices

### 1. Type Guards

```tsx
const result = await uploadAvatar(file);

if (result.success) {
  // TypeScript knows this is UploadResult
  console.log(result.secure_url); // ✅ OK
  console.log(result.error); // ❌ Error: Property doesn't exist
} else {
  // TypeScript knows this is UploadError
  console.log(result.error); // ✅ OK
  console.log(result.secure_url); // ❌ Error: Property doesn't exist
}
```

### 2. User-Friendly Messages

```tsx
const result = await uploadAvatar(file);

if (!result.success) {
  // Show user-friendly error
  alert(result.error);

  // Log technical details for debugging
  console.error('[Upload Error]', {
    error: result.error,
    code: result.code,
    file: file.name,
    size: file.size,
  });
}
```

### 3. Loading States

```tsx
const [uploading, setUploading] = useState(false);

const handleUpload = async (file: File) => {
  setUploading(true);
  try {
    const result = await uploadAvatar(file);
    // Handle result...
  } finally {
    setUploading(false); // Always reset loading state
  }
};
```

## Security Features

1. **Client-Side Validation**
   - File type checking
   - File size limits
   - Prevents invalid uploads before network request

2. **Server-Side Authentication**
   - `/api/cloudinary/sign` requires valid session
   - User ID embedded in folder path
   - Prevents unauthorized uploads

3. **Signed Uploads**
   - Signature generated by server with API secret
   - Cloudinary verifies signature before accepting upload
   - Prevents tampering with upload parameters

4. **No Secrets in Client**
   - API secret never leaves the server
   - Client only receives signature (time-limited)
   - Safe for use in public client code

## Troubleshooting

### "Invalid file type" Error

**Cause:** File is not an image  
**Solution:** Ensure `file.type` starts with `"image/"`

```tsx
// Check before uploading
if (!file.type.startsWith('image/')) {
  alert('Please select an image file');
  return;
}
```

### "File size exceeds maximum" Error

**Cause:** File is too large  
**Solution:** Compress or resize the image before upload

```tsx
// Check file size
const maxSize = 5 * 1024 * 1024; // 5MB
if (file.size > maxSize) {
  alert('Image is too large. Please select a smaller file.');
  return;
}
```

### "Failed to get upload signature: Unauthorized"

**Cause:** User is not authenticated  
**Solution:** Ensure user is signed in before allowing uploads

```tsx
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

const supabase = createSupabaseBrowserClient();
const {
  data: { session },
} = await supabase.auth.getSession();

if (!session) {
  alert('Please sign in to upload images');
  return;
}
```

### "Failed to connect to Cloudinary"

**Cause:** Network error or CORS issue  
**Solution:** Check network connectivity and Cloudinary CORS settings

## Performance Tips

1. **Compress images** before upload using browser APIs
2. **Show preview** immediately using `URL.createObjectURL(file)`
3. **Upload in background** without blocking UI
4. **Implement retry logic** for network failures
5. **Cache results** to avoid re-uploading

## Next Steps

1. ✅ Set up environment variables (`.env.local`)
2. ✅ Run database migration for `profile_images` table
3. ✅ Test upload flow with signed-in user
4. 🔲 Update existing components to use `uploadAvatar()`
5. 🔲 Add upload progress tracking (optional)
6. 🔲 Implement image compression (optional)

## Related Documentation

- **Setup Guide:** `CLOUDINARY_SETUP.md`
- **API Documentation:** `CLOUDINARY_INTEGRATION.md`
- **Server Route:** `app/api/cloudinary/sign/route.ts`
- **Migration:** `supabase/migrations/20260203000000_create_profile_images.sql`
