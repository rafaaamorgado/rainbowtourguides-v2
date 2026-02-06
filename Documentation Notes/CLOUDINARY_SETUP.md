# Cloudinary Setup Guide

This project supports **Cloudinary** for image uploads with signed uploads for security.

## Environment Variables Checklist

Add these to your `.env.local` file:

### ✅ Required Variables

```bash
# Get these from your Cloudinary Dashboard (https://cloudinary.com/console)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret  # ⚠️ NEVER expose this in client code!
```

### 📍 Where to Find Your Credentials

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Navigate to **Dashboard** → **Account Details**
3. Copy:
   - **Cloud Name** → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
   - **API Key** → `NEXT_PUBLIC_CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

---

## Architecture

### Server-Side (Secure)

- **`lib/cloudinary-server.ts`** - Signature generation, config validation
- **`app/api/cloudinary/sign/route.ts`** - Preset-based signature endpoint
  - Supports: `avatar_preset`, `cover_preset`, `profile_images_preset`
  - Auto-organizes files: `users/{type}/{userId}`
  - Validates folder patterns for security
- Uses `CLOUDINARY_API_SECRET` (never exposed to client)

### Client-Side (Public)

- **`lib/cloudinary-upload.ts`** - Simplified upload functions with presets
  - `uploadAvatar()` - Upload user avatar
  - `uploadCover()` - Upload cover image
  - `uploadProfileImage()` - Upload profile images
- Uses `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_API_KEY`

---

## Usage Example

### Simple Upload (Recommended)

```tsx
'use client';

import { uploadAvatar } from '@/lib/cloudinary-upload';

export function AvatarUploader() {
  const handleUpload = async (file: File) => {
    const result = await uploadAvatar(file);

    if (result.success) {
      console.log('Avatar uploaded:', result.url);
      // Save result.url to your database
    } else {
      console.error('Upload failed:', result.error);
    }
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
      }}
    />
  );
}
```

### With PhotoUpload Component

```tsx
'use client';

import { useState } from 'react';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { uploadAvatar } from '@/lib/cloudinary-upload';

export function ProfilePhotoSection({
  currentAvatarUrl,
}: {
  currentAvatarUrl?: string;
}) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);

  const handleChange = (url: string | string[] | null) => {
    setAvatarUrl(typeof url === 'string' ? url : null);
  };

  return (
    <PhotoUpload
      variant="avatar"
      value={avatarUrl}
      onChange={handleChange}
      onUpload={uploadAvatar}
    />
  );
}
```

---

## Security Notes

- ✅ The API route (`/api/cloudinary/sign`) requires authentication
- ✅ API Secret is only used server-side
- ✅ Signatures are generated on-demand per upload
- ✅ User ID is automatically embedded in folder paths
- ✅ Preset validation prevents unauthorized folder access
- ✅ Custom folders must match pattern `users/{type}/{userId}`

---

## Folder Structure

Files are automatically organized by preset and user:

- **`avatar_preset`** → `users/avatars/{userId}/`
- **`cover_preset`** → `users/covers/{userId}/`
- **`profile_images_preset`** → `users/profile_images/{userId}/`

Custom folders can be specified but must match the pattern `users/{type}/{userId}` for security.

---

## Testing

1. Set up your `.env.local` with real Cloudinary credentials
2. Run the dev server: `npm run dev`
3. Navigate to a page with file upload
4. Upload an image and check the console for the returned URL
5. Verify the image appears in your [Cloudinary Media Library](https://cloudinary.com/console/media_library)

---

## Troubleshooting

### "Cloudinary is not configured"

- Check that all three env vars are set in `.env.local`
- Restart your dev server after adding env vars

### "Unauthorized" error

- The signature API route requires authentication
- Ensure the user is signed in before uploading

### Upload fails silently

- Check browser console for errors
- Verify your Cloudinary cloud name and API key are correct
- Check Network tab for failed requests

---

## Migration from Supabase Storage (Optional)

If you want to migrate from Supabase Storage to Cloudinary:

1. Replace Supabase upload imports:

   ```tsx
   // Before
   import { uploadAvatar } from '@/lib/storage-helpers';

   // After
   import { uploadAvatar } from '@/lib/cloudinary-upload';
   ```

2. Update upload calls (no userId needed):

   ```tsx
   // Before
   const result = await uploadAvatar(userId, file);

   // After
   const result = await uploadAvatar(file);
   ```

3. Update database schema to store Cloudinary URLs (they start with `https://res.cloudinary.com/`)
4. Optionally migrate existing images using Cloudinary's [Upload API](https://cloudinary.com/documentation/image_upload_api_reference)

See **`CLOUDINARY_INTEGRATION.md`** for detailed migration guide.
