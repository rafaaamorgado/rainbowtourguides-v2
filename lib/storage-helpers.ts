import { createSupabaseBrowserClient } from './supabase-browser';

export type UploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

/**
 * Upload a file to Supabase Storage (client-side)
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param folder - The folder path within the bucket (typically user ID)
 * @param fileName - Optional custom file name (defaults to original file name with timestamp)
 * @returns Promise with upload result containing public URL or error
 */
export async function uploadFile(
  file: File,
  bucket: string,
  folder: string,
  fileName?: string,
): Promise<UploadResult> {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return {
      success: false,
      error: 'Supabase client not configured',
    };
  }

  try {
    // Generate unique file name with timestamp to prevent collisions
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const finalFileName = fileName || `${timestamp}.${fileExt}`;
    const filePath = `${folder}/${finalFileName}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Upload failed',
    };
  }
}

/**
 * Delete a file from Supabase Storage (client-side)
 * @param bucket - The storage bucket name
 * @param filePath - The full path to the file in storage
 * @returns Promise with deletion result
 */
export async function deleteFile(
  bucket: string,
  filePath: string,
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return {
      success: false,
      error: 'Supabase client not configured',
    };
  }

  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Delete failed',
    };
  }
}

/**
 * Get the user ID from the Supabase session (client-side)
 * @returns Promise with user ID or null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

/**
 * Get public URL for a Supabase Storage file (client-side)
 * Works with both full URLs and storage paths
 * @param urlOrPath - Full URL or storage path (e.g., "userId/filename.jpg")
 * @param bucket - Storage bucket name (default: "guide-photos")
 * @returns Public URL string or null
 */
export function getStoragePublicUrl(
  urlOrPath: string | null | undefined,
  bucket: string = 'guide-photos',
): string | null {
  if (!urlOrPath) {
    return null;
  }

  // If it's already a full URL, return it
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }

  // Optimize: Construct URL manually without initializing client
  // This is safe for public buckets and works on both server and client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    // Ensure no double slashes if vars have trailing/leading slashes
    const cleanBase = supabaseUrl.replace(/\/$/, "");
    const cleanBucket = bucket.replace(/\/$/, "");
    const cleanPath = urlOrPath.startsWith('/') ? urlOrPath.slice(1) : urlOrPath;
    return `${cleanBase}/storage/v1/object/public/${cleanBucket}/${cleanPath}`;
  }

  // Fallback (unlikely to be reached if env vars are set)
  try {
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      const { data } = supabase.storage.from(bucket).getPublicUrl(urlOrPath);
      return data.publicUrl;
    }
  } catch (e) {
    // Ignore client creation errors on server
  }

  return null;
}

// ============================================================================
// Specialized Upload Functions
// ============================================================================

/**
 * Upload a user avatar to the 'avatars' bucket
 * @param userId - The user's ID (used as folder name)
 * @param file - The image file to upload
 * @returns Promise with upload result containing public URL
 */
export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<UploadResult> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  // Use a consistent filename so it gets overwritten on updates
  return uploadFile(file, 'avatars', userId, `avatar.${fileExt}`);
}

/**
 * Upload a guide profile photo to the 'guide-photos' bucket
 * @param guideId - The guide's user ID (used as folder name)
 * @param file - The image file to upload
 * @returns Promise with upload result containing public URL
 */
export async function uploadGuidePhoto(
  guideId: string,
  file: File,
): Promise<UploadResult> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  return uploadFile(file, 'guide-photos', guideId, `photo.${fileExt}`);
}

/**
 * Upload a traveler profile photo to the 'avatars' bucket
 * Supports multiple photos (up to 4)
 * @param userId - The traveler's user ID (used as folder name)
 * @param file - The image file to upload
 * @param index - The photo index (0-3) for organizing multiple photos
 * @returns Promise with upload result containing public URL
 */
export async function uploadTravelerPhoto(
  userId: string,
  file: File,
  index: number,
): Promise<UploadResult> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();
  return uploadFile(file, 'avatars', userId, `photo_${index}_${timestamp}.${fileExt}`);
}

/**
 * Upload an image to the 'blog-images' bucket (admin only)
 * @param file - The image file to upload
 * @param slug - Optional slug/identifier for organizing images
 * @returns Promise with upload result containing public URL
 */
export async function uploadBlogImage(
  file: File,
  slug?: string,
): Promise<UploadResult> {
  const timestamp = Date.now();
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const folder = slug || 'general';
  return uploadFile(file, 'blog-images', folder, `${timestamp}.${fileExt}`);
}

/**
 * Get avatar URL for display, with fallback handling
 * @param avatarUrl - The stored avatar URL or path
 * @returns Public URL or null
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string | null {
  return getStoragePublicUrl(avatarUrl, 'avatars');
}

/**
 * Get guide photo URL for display, with fallback handling
 * @param photoUrl - The stored photo URL or path
 * @returns Public URL or null
 */
export function getGuidePhotoUrl(photoUrl: string | null | undefined): string | null {
  return getStoragePublicUrl(photoUrl, 'guide-photos');
}
