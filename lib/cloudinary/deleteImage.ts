/**
 * Client-side helper for deleting Cloudinary images
 *
 * This helper calls the /api/cloudinary/delete endpoint which:
 * - Verifies authentication
 * - Verifies asset ownership
 * - Deletes from Cloudinary
 *
 * ⚠️ CLIENT ONLY - Do not import in server components
 */

'use client';

/**
 * Deletes an image from Cloudinary by public_id
 *
 * @param publicId - Cloudinary public_id to delete
 * @returns Promise with success status
 */
export async function deleteCloudinaryImage(
  publicId: string,
): Promise<{ success: boolean; error?: string }> {
  if (!publicId) {
    return {
      success: false,
      error: 'No public_id provided',
    };
  }

  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `Delete failed with status ${response.status}`,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete image',
    };
  }
}

/**
 * Safely attempts to delete a Cloudinary image without throwing
 * Logs errors but doesn't fail the operation
 *
 * Use this for non-critical deletions (e.g., cleanup after upload)
 *
 * @param publicId - Cloudinary public_id to delete
 * @param context - Description for logging (e.g., "old avatar")
 */
export async function safeDeleteCloudinaryImage(
  publicId: string | null | undefined,
  context: string = 'image',
): Promise<void> {
  if (!publicId) {
    return;
  }

  try {
    const result = await deleteCloudinaryImage(publicId);

    if (result.success) {
      console.log(`[Cloudinary] Successfully deleted ${context}: ${publicId}`);
    } else {
      console.warn(
        `[Cloudinary] Failed to delete ${context}: ${publicId}`,
        result.error,
      );
    }
  } catch (error) {
    console.error(`[Cloudinary] Error deleting ${context}: ${publicId}`, error);
  }
}
