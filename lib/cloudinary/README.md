# Cloudinary Upload Module

Client-side image upload utilities for Cloudinary with signed uploads.

## Files

- **`uploadImage.ts`** - Main upload helper with validation and error handling

## Usage

### Basic Upload

```tsx
'use client';

import { uploadImageSigned } from '@/lib/cloudinary/uploadImage';

async function handleUpload(file: File) {
  const result = await uploadImageSigned({
    file,
    preset: 'avatar_preset',
  });

  if (result.success) {
    console.log('Uploaded:', result.secure_url);
    console.log('Size:', result.width, 'x', result.height);
    console.log('Cloudinary ID:', result.public_id);
  } else {
    console.error('Upload failed:', result.error);
  }
}
```

### With React State

```tsx
'use client';

import { useState } from 'react';
import {
  uploadAvatar,
  type UploadResponse,
} from '@/lib/cloudinary/uploadImage';

export function AvatarUploader() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const uploadResult = await uploadAvatar(file);
    setResult(uploadResult);
    setUploading(false);

    if (uploadResult.success) {
      // Save uploadResult.secure_url to database
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {result && !result.success && (
        <p className="text-red-600">{result.error}</p>
      )}
      {result && result.success && (
        <img src={result.secure_url} alt="Uploaded" />
      )}
    </div>
  );
}
```

### With Existing PhotoUpload Component

```tsx
'use client';

import { PhotoUpload } from '@/components/ui/photo-upload';
import { uploadAvatar } from '@/lib/cloudinary/uploadImage';

export function ProfileSection() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    const result = await uploadAvatar(file);

    if (result.success) {
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
    />
  );
}
```

## API

### `uploadImageSigned(options)`

Main upload function with full control.

**Parameters:**

- `options.file: File` - The image file to upload
- `options.preset: UploadPreset` - Upload preset (`"avatar_preset"`, `"cover_preset"`, or `"profile_images_preset"`)

**Returns:** `Promise<UploadResponse>`

**Success Response:**

```typescript
{
  success: true,
  public_id: string,    // Cloudinary public ID
  secure_url: string,   // HTTPS URL to image
  width: number,        // Image width in pixels
  height: number        // Image height in pixels
}
```

**Error Response:**

```typescript
{
  success: false,
  error: string,        // Human-readable error message
  code?: string         // Error code (optional)
}
```

### `uploadAvatar(file)`

Convenience function for avatar uploads (max 5MB).

**Parameters:**

- `file: File` - The avatar image file

**Returns:** `Promise<UploadResponse>`

### `uploadCover(file)`

Convenience function for cover image uploads (max 10MB).

**Parameters:**

- `file: File` - The cover image file

**Returns:** `Promise<UploadResponse>`

### `uploadProfileImage(file)`

Convenience function for profile image uploads (max 10MB).

**Parameters:**

- `file: File` - The profile image file

**Returns:** `Promise<UploadResponse>`

## Validation

### File Type Validation

Only files with MIME types starting with `image/` are accepted:

- ✅ `image/jpeg`
- ✅ `image/png`
- ✅ `image/gif`
- ✅ `image/webp`
- ❌ `application/pdf`
- ❌ `video/mp4`

### Size Limits

- **Avatar** (`avatar_preset`): 5MB
- **Cover** (`cover_preset`): 10MB
- **Profile Images** (`profile_images_preset`): 10MB

### Error Messages

The function provides clear, user-friendly error messages:

- File type errors: `"Invalid file type: video/mp4. Only images are allowed."`
- Size errors: `"File size (12.5MB) exceeds maximum allowed size of 10MB"`
- Network errors: `"Failed to connect to Cloudinary: Network request failed"`
- Server errors: `"Failed to get upload signature: Unauthorized"`

## Type Safety

All functions are fully typed with TypeScript:

```typescript
import type {
  UploadPreset, // "avatar_preset" | "cover_preset" | "profile_images_preset"
  UploadResponse, // UploadResult | UploadError
  UploadResult, // Success response type
  UploadError, // Error response type
  UploadOptions, // uploadImageSigned options
} from '@/lib/cloudinary/uploadImage';
```

## Error Handling

All errors are caught and returned in a standardized format:

```tsx
const result = await uploadAvatar(file);

if (!result.success) {
  // Type-safe error handling
  console.error(result.error); // string
  console.error(result.code); // string | undefined
}
```

## Security

- ✅ Client-side only (marked with `'use client'`)
- ✅ No server-only imports
- ✅ Signed uploads (signature from server)
- ✅ Authenticated uploads (server validates session)
- ✅ File validation (type and size)
- ✅ No API secrets exposed

## Testing

```typescript
// Mock file for testing
const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

// Test upload
const result = await uploadAvatar(mockFile);
expect(result.success).toBe(true);
if (result.success) {
  expect(result.secure_url).toContain('cloudinary.com');
}
```

## Related Files

- **Server Route:** `app/api/cloudinary/sign/route.ts`
- **Server Helpers:** `lib/cloudinary-server.ts`
- **Client Helpers (deprecated):** `lib/cloudinary-upload.ts` (use `uploadImage.ts` instead)
- **Storage Helpers:** `lib/storage-helpers.ts` (Supabase storage)
