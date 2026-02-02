'use client';

/**
 * Helper functions for working with Cloudinary URLs and uploads.
 * These are client-safe utilities that don't require API secrets.
 */

import { uploadToCloudinary } from './cloudinary-client';

/**
 * Gets a signature from the server for Cloudinary uploads.
 * This is the callback function you pass to uploadToCloudinary().
 */
export async function getCloudinarySignature(
  params: Record<string, string>,
): Promise<{ signature: string; timestamp: number }> {
  const response = await fetch('/api/cloudinary/signature', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paramsToSign: params }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get signature');
  }

  return response.json();
}

/**
 * Upload a user avatar to Cloudinary.
 * @param userId - The user's ID (used as folder name)
 * @param file - The image file to upload
 * @returns Upload result with secure_url
 */
export async function uploadCloudinaryAvatar(
  userId: string,
  file: File,
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const result = await uploadToCloudinary(
    file,
    `avatars/${userId}`,
    getCloudinarySignature,
  );

  return {
    success: result.success,
    url: result.secure_url,
    error: result.error,
  };
}

/**
 * Upload a guide photo to Cloudinary.
 * @param guideId - The guide's user ID (used as folder name)
 * @param file - The image file to upload
 * @returns Upload result with secure_url
 */
export async function uploadCloudinaryGuidePhoto(
  guideId: string,
  file: File,
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const timestamp = Date.now();
  const result = await uploadToCloudinary(
    file,
    `guide-photos/${guideId}`,
    getCloudinarySignature,
  );

  return {
    success: result.success,
    url: result.secure_url,
    error: result.error,
  };
}

/**
 * Extract public_id from a Cloudinary URL.
 * Useful for transformations or deletions.
 */
export function extractCloudinaryPublicId(url: string): string | null {
  // Example URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/filename.jpg
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
  return match ? match[1] : null;
}

/**
 * Get a transformed Cloudinary URL (e.g., resize, crop, format).
 * @param url - Original Cloudinary URL
 * @param transformations - Cloudinary transformation string (e.g., "w_200,h_200,c_fill")
 */
export function getCloudinaryTransformedUrl(
  url: string,
  transformations: string,
): string {
  if (!url.includes('cloudinary.com/')) {
    return url; // Not a Cloudinary URL
  }

  // Insert transformations after /upload/
  return url.replace('/upload/', `/upload/${transformations}/`);
}

/**
 * Get a thumbnail version of a Cloudinary image.
 * @param url - Original Cloudinary URL
 * @param size - Thumbnail size (default: 200)
 */
export function getCloudinaryThumbnail(
  url: string,
  size: number = 200,
): string {
  return getCloudinaryTransformedUrl(url, `w_${size},h_${size},c_fill,q_auto`);
}
