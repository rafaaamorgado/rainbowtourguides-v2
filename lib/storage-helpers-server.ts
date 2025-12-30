import { createSupabaseServerClient } from './supabase-server';

/**
 * Get public URL for a Supabase Storage file (server-side)
 * Works with both full URLs and storage paths
 * @param urlOrPath - Full URL or storage path (e.g., "userId/filename.jpg")
 * @param bucket - Storage bucket name (default: "guide-photos")
 * @returns Promise with public URL string or null
 */
export async function getStoragePublicUrlServer(
  urlOrPath: string | null | undefined,
  bucket: string = 'guide-photos',
): Promise<string | null> {
  if (!urlOrPath) {
    return null;
  }

  // If it's already a full URL, return it
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }

  // If it's a storage path, construct the public URL
  try {
    const supabase = await createSupabaseServerClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(urlOrPath);
    return data.publicUrl;
  } catch (error) {
    console.error('[getStoragePublicUrlServer] Error:', error);
    // Fallback: construct URL manually if client not available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return null;
    }
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${urlOrPath}`;
  }
}
