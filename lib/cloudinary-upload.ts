'use client';

/**
 * Client-side utilities for uploading to Cloudinary using the /api/cloudinary/sign endpoint.
 * Uses preset-based uploads with automatic folder organization.
 */

type UploadPreset = 'avatar_preset' | 'cover_preset' | 'profile_images_preset';

interface SignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

interface UploadResult {
  success: boolean;
  url?: string;
  public_id?: string;
  error?: string;
}

/**
 * Gets a signature from the server for Cloudinary uploads.
 *
 * @param preset - The upload preset (determines folder structure)
 * @param customFolder - Optional custom folder (must match allowed patterns)
 * @returns Signature data needed for upload
 */
async function getUploadSignature(
  preset: UploadPreset,
  customFolder?: string,
): Promise<SignatureResponse> {
  const response = await fetch('/api/cloudinary/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ preset, folder: customFolder }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get signature');
  }

  return response.json();
}

/**
 * Uploads a file to Cloudinary using signed upload.
 *
 * @param file - The file to upload
 * @param preset - Upload preset determining folder structure
 * @param customFolder - Optional custom folder override
 * @returns Upload result with URL or error
 */
export async function uploadToCloudinary(
  file: File,
  preset: UploadPreset,
  customFolder?: string,
): Promise<UploadResult> {
  try {
    // Step 1: Get signature from server
    const signatureData = await getUploadSignature(preset, customFolder);

    // Step 2: Prepare form data for Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('timestamp', signatureData.timestamp.toString());
    formData.append('signature', signatureData.signature);
    formData.append('api_key', signatureData.apiKey);
    formData.append('folder', signatureData.folder);

    // Step 3: Upload to Cloudinary
    const uploadUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json();
      return {
        success: false,
        error: errorData.error?.message || 'Upload failed',
      };
    }

    const data = await uploadResponse.json();
    return {
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Upload a user avatar to Cloudinary.
 * Uses avatar_preset which stores in users/avatars/{userId}
 *
 * @param file - The image file to upload
 * @returns Upload result with URL
 */
export async function uploadAvatar(file: File): Promise<UploadResult> {
  return uploadToCloudinary(file, 'avatar_preset');
}

/**
 * Upload a cover image to Cloudinary.
 * Uses cover_preset which stores in users/covers/{userId}
 *
 * @param file - The image file to upload
 * @returns Upload result with URL
 */
export async function uploadCover(file: File): Promise<UploadResult> {
  return uploadToCloudinary(file, 'cover_preset');
}

/**
 * Upload a profile image to Cloudinary.
 * Uses profile_images_preset which stores in users/profile_images/{userId}
 *
 * @param file - The image file to upload
 * @returns Upload result with URL
 */
export async function uploadProfileImage(file: File): Promise<UploadResult> {
  return uploadToCloudinary(file, 'profile_images_preset');
}

/**
 * Get a thumbnail version of a Cloudinary image.
 *
 * @param url - Original Cloudinary URL
 * @param width - Thumbnail width
 * @param height - Thumbnail height
 * @returns Transformed URL
 */
export function getCloudinaryThumbnail(
  url: string,
  width: number = 200,
  height: number = 200,
): string {
  if (!url.includes('cloudinary.com/')) {
    return url; // Not a Cloudinary URL
  }

  // Insert transformations after /upload/
  const transformation = `w_${width},h_${height},c_fill,q_auto,f_auto`;
  return url.replace('/upload/', `/upload/${transformation}/`);
}

/**
 * Apply custom transformations to a Cloudinary URL.
 *
 * @param url - Original Cloudinary URL
 * @param transformations - Transformation string (e.g., "w_200,h_200,c_fill")
 * @returns Transformed URL
 */
export function transformCloudinaryUrl(
  url: string,
  transformations: string,
): string {
  if (!url.includes('cloudinary.com/')) {
    return url;
  }

  return url.replace('/upload/', `/upload/${transformations}/`);
}
