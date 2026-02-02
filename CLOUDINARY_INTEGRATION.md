# Cloudinary Integration - Technical Details

## API Endpoint: `/api/cloudinary/sign`

### Request

**Method:** `POST`

**Headers:**

```
Content-Type: application/json
Cookie: <supabase-auth-token>
```

**Body:**

```json
{
  "preset": "avatar_preset" | "cover_preset" | "profile_images_preset",
  "folder": "users/avatars/user-id-123" // Optional override
}
```

### Response (Success - 200)

```json
{
  "signature": "a1b2c3d4e5f6...",
  "timestamp": 1704067200,
  "apiKey": "123456789012345",
  "cloudName": "your-cloud-name",
  "folder": "users/avatars/user-id-123"
}
```

### Error Responses

**401 Unauthorized**

```json
{
  "error": "Unauthorized"
}
```

**400 Bad Request**

```json
{
  "error": "Invalid preset. Must be one of: avatar_preset, cover_preset, profile_images_preset"
}
```

**400 Bad Request (Invalid Folder)**

```json
{
  "error": "Invalid folder. Must match pattern: users/{type}/{userId}"
}
```

**500 Internal Server Error**

```json
{
  "error": "Failed to generate signature"
}
```

---

## Upload Presets

### `avatar_preset`

- **Folder:** `users/avatars/{userId}`
- **Use Case:** User profile pictures
- **Function:** `uploadAvatar(file)`

### `cover_preset`

- **Folder:** `users/covers/{userId}`
- **Use Case:** Cover/banner images
- **Function:** `uploadCover(file)`

### `profile_images_preset`

- **Folder:** `users/profile_images/{userId}`
- **Use Case:** Additional profile photos (galleries)
- **Function:** `uploadProfileImage(file)`

---

## Client-Side Functions

### `uploadAvatar(file: File)`

Uploads a file using the `avatar_preset`.

**Example:**

```tsx
import { uploadAvatar } from '@/lib/cloudinary-upload';

const result = await uploadAvatar(file);
if (result.success) {
  console.log('URL:', result.url);
}
```

### `uploadCover(file: File)`

Uploads a file using the `cover_preset`.

### `uploadProfileImage(file: File)`

Uploads a file using the `profile_images_preset`.

### `uploadToCloudinary(file, preset, customFolder?)`

Low-level upload function that accepts any valid preset.

**Example:**

```tsx
import { uploadToCloudinary } from '@/lib/cloudinary-upload';

const result = await uploadToCloudinary(
  file,
  'avatar_preset',
  'users/avatars/custom-id', // Optional
);
```

---

## URL Transformations

### `getCloudinaryThumbnail(url, width?, height?)`

Generates a thumbnail URL with automatic format and quality optimization.

**Example:**

```tsx
import { getCloudinaryThumbnail } from '@/lib/cloudinary-upload';

const original = 'https://res.cloudinary.com/demo/image/upload/sample.jpg';
const thumb = getCloudinaryThumbnail(original, 150, 150);
// Result: .../upload/w_150,h_150,c_fill,q_auto,f_auto/sample.jpg
```

### `transformCloudinaryUrl(url, transformations)`

Applies custom Cloudinary transformations.

**Example:**

```tsx
import { transformCloudinaryUrl } from '@/lib/cloudinary-upload';

const url = transformCloudinaryUrl(originalUrl, 'w_400,h_300,c_crop,g_face');
```

**Common Transformations:**

- `w_200,h_200` - Resize to 200x200
- `c_fill` - Crop to fill dimensions
- `c_crop,g_face` - Crop focusing on faces
- `q_auto` - Automatic quality
- `f_auto` - Automatic format (WebP, AVIF)
- `r_max` - Maximum border radius (circle)

---

## Security Features

1. **Authentication Required**
   - All requests must include valid Supabase session cookie
   - Unauthenticated requests receive 401

2. **Preset Validation**
   - Only three presets are allowed
   - Invalid presets receive 400

3. **Folder Enforcement**
   - Folders are automatically set to `users/{type}/{userId}`
   - Custom folders must match this pattern
   - Prevents users from uploading to other users' folders

4. **API Secret Protection**
   - `CLOUDINARY_API_SECRET` is never sent to client
   - Signature is generated server-side only
   - Client only receives the signature, not the secret

5. **User Isolation**
   - Each user's files are stored in their own folder
   - Folder paths include authenticated user ID
   - Cross-user access is prevented

---

## Integration with Existing Components

### PhotoUpload Component

Update your existing `PhotoUpload` component to use Cloudinary:

```tsx
import { PhotoUpload } from '@/components/ui/photo-upload';
import { uploadAvatar } from '@/lib/cloudinary-upload';

<PhotoUpload
  variant="avatar"
  value={avatarUrl}
  onChange={setAvatarUrl}
  onUpload={uploadAvatar} // ← Use Cloudinary upload
/>;
```

### AvatarUpload Component

```tsx
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { uploadAvatar } from '@/lib/cloudinary-upload';

<AvatarUpload
  value={avatarUrl}
  onChange={setAvatarUrl}
  onUpload={uploadAvatar} // ← Use Cloudinary upload
/>;
```

---

## Migration from Supabase Storage

### Step 1: Update Upload Functions

**Before (Supabase):**

```tsx
import { uploadAvatar } from '@/lib/storage-helpers';

const result = await uploadAvatar(userId, file);
```

**After (Cloudinary):**

```tsx
import { uploadAvatar } from '@/lib/cloudinary-upload';

const result = await uploadAvatar(file);
// No need to pass userId - automatically handled
```

### Step 2: Update Database URLs

Cloudinary URLs have this format:

```
https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{file}
```

Update your database to store these URLs in the `avatar_url` field.

### Step 3: Handle URL Display

Both Supabase and Cloudinary URLs work as direct image sources:

```tsx
<img src={profile.avatar_url} alt="Avatar" />
```

For thumbnails:

```tsx
import { getCloudinaryThumbnail } from '@/lib/cloudinary-upload';

<img src={getCloudinaryThumbnail(profile.avatar_url, 100, 100)} alt="Avatar" />;
```

---

## Testing Checklist

- [ ] Set environment variables in `.env.local`
- [ ] Restart dev server
- [ ] Sign in as a user
- [ ] Upload an avatar
- [ ] Check console for success/error messages
- [ ] Verify URL is returned
- [ ] Check Cloudinary dashboard for uploaded file
- [ ] Verify file is in correct folder (`users/avatars/{userId}`)
- [ ] Test with unauthenticated user (should fail)
- [ ] Test with invalid preset (should return 400)
- [ ] Test thumbnail generation
