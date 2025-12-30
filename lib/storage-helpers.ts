import { createSupabaseBrowserClient } from "./supabase-browser";

export type UploadResult = {
  success: boolean;
  url?: string;
  error?: string;
};

/**
 * Upload a file to Supabase Storage
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
  fileName?: string
): Promise<UploadResult> {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return {
      success: false,
      error: "Supabase client not configured",
    };
  }

  try {
    // Generate unique file name with timestamp to prevent collisions
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const finalFileName = fileName || `${timestamp}.${fileExt}`;
    const filePath = `${folder}/${finalFileName}`;

    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("[uploadFile] Upload error:", error);
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
    console.error("[uploadFile] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Upload failed",
    };
  }
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param filePath - The full path to the file in storage
 * @returns Promise with deletion result
 */
export async function deleteFile(
  bucket: string,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return {
      success: false,
      error: "Supabase client not configured",
    };
  }

  try {
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("[deleteFile] Delete error:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (err) {
    console.error("[deleteFile] Unexpected error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Delete failed",
    };
  }
}

/**
 * Get the user ID from the Supabase session
 * @returns Promise with user ID or null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    return null;
  }

  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}
