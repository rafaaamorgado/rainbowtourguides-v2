/**
 * Client-side Cloudinary utilities.
 * NEVER import cloudinary-server.ts or reference CLOUDINARY_API_SECRET here.
 */

/**
 * Checks if Cloudinary is configured on the client (public env vars only).
 */
export function isCloudinaryConfiguredOnClient(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  );
}

/**
 * Gets the Cloudinary cloud name from public env var.
 */
export function getCloudinaryCloudName(): string | undefined {
  return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
}

/**
 * Gets the Cloudinary API key from public env var.
 */
export function getCloudinaryApiKey(): string | undefined {
  return process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
}

/**
 * Uploads a file to Cloudinary using a signed upload.
 * @param file - The file to upload
 * @param folder - The folder path in Cloudinary (e.g., "avatars", "guide-photos")
 * @param signatureCallback - Function that calls your API route to get signature
 * @returns Upload result with secure_url or error
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
  signatureCallback: (
    params: Record<string, string>,
  ) => Promise<{ signature: string; timestamp: number }>,
): Promise<{
  success: boolean;
  secure_url?: string;
  public_id?: string;
  error?: string;
}> {
  const cloudName = getCloudinaryCloudName();
  const apiKey = getCloudinaryApiKey();

  if (!cloudName || !apiKey) {
    return {
      success: false,
      error: 'Cloudinary is not configured',
    };
  }

  try {
    // Prepare upload parameters
    const uploadParams: Record<string, string> = {
      folder,
      upload_preset: '', // Can be empty for signed uploads
    };

    // Get signature from server
    const { signature, timestamp } = await signatureCallback(uploadParams);

    // Prepare form data for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('timestamp', timestamp.toString());
    formData.append('signature', signature);
    formData.append('api_key', apiKey);

    // Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error?.message || 'Upload failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      secure_url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}
