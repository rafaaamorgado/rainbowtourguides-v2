'use server';

import { v2 as cloudinary } from 'cloudinary';

/**
 * Validates that all required Cloudinary environment variables are set.
 * @throws Error if any required env var is missing
 */
function validateCloudinaryEnv() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    const missing = [];
    if (!cloudName) missing.push('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missing.push('NEXT_PUBLIC_CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');

    const message = `Cloudinary is not configured. Missing: ${missing.join(', ')}`;
    if (process.env.NODE_ENV === 'development') {
      console.error(message);
    }
    throw new Error(message);
  }

  return { cloudName, apiKey, apiSecret };
}

/**
 * Initializes and returns the Cloudinary instance.
 * Configures with credentials from environment variables.
 * @returns Configured Cloudinary instance
 */
export function getCloudinaryInstance() {
  const { cloudName, apiKey, apiSecret } = validateCloudinaryEnv();

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

/**
 * Generates a signature for Cloudinary signed uploads.
 * This must be called server-side to keep the API secret secure.
 *
 * @param paramsToSign - Upload parameters that need to be signed
 * @returns Object with signature and timestamp
 */
export async function generateCloudinarySignature(
  paramsToSign: Record<string, string | number>,
): Promise<{ signature: string; timestamp: number }> {
  const { apiSecret } = validateCloudinaryEnv();

  // Add timestamp if not provided
  const timestamp = paramsToSign.timestamp
    ? Number(paramsToSign.timestamp)
    : Math.round(Date.now() / 1000);

  // Create a copy with timestamp (explicitly type for delete operation)
  const params: Record<string, string | number> = {
    ...paramsToSign,
    timestamp,
  };

  // Remove signature if present (shouldn't sign the signature)
  delete params.signature;

  // Sort parameters alphabetically and create signature string
  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  // Generate signature using Cloudinary's utility
  const cloudinaryInstance = getCloudinaryInstance();
  const signature = cloudinaryInstance.utils.api_sign_request(
    params as Record<string, string>,
    apiSecret,
  );

  return { signature, timestamp };
}

/**
 * Check if Cloudinary is configured (server-side).
 * @returns boolean indicating if all required env vars are set
 */
export function isCloudinaryConfigured(): boolean {
  try {
    validateCloudinaryEnv();
    return true;
  } catch {
    return false;
  }
}
