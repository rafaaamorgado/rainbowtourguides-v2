/**
 * Client-side Cloudinary signed upload helper
 *
 * This module provides type-safe image upload functionality using Cloudinary's
 * signed upload API. It handles validation, signature generation, and upload.
 *
 * ⚠️ CLIENT ONLY - Do not import in server components or API routes
 */

'use client';

// ============================================================================
// Types
// ============================================================================

/**
 * Allowed upload presets for image uploads
 */
export type UploadPreset =
  | 'avatar_preset'
  | 'cover_preset'
  | 'profile_images_preset'
  | 'verification_docs_preset';

/**
 * Signature response from /api/cloudinary/sign
 */
interface SignaturePayload {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Successful upload result from Cloudinary
 */
export interface UploadResult {
  success: true;
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
}

/**
 * Failed upload result
 */
export interface UploadError {
  success: false;
  error: string;
  code?: string;
}

/**
 * Union type for upload responses
 */
export type UploadResponse = UploadResult | UploadError;

/**
 * Upload options
 */
export interface UploadOptions {
  file: File;
  preset: UploadPreset;
}

/**
 * Cloudinary error response
 */
interface CloudinaryErrorResponse {
  error?: {
    message: string;
  };
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Size limits per preset (in bytes)
 */
const SIZE_LIMITS: Record<UploadPreset, number> = {
  avatar_preset: 5 * 1024 * 1024, // 5MB for avatars
  cover_preset: 10 * 1024 * 1024, // 10MB for covers
  profile_images_preset: 10 * 1024 * 1024, // 10MB for profile images
  verification_docs_preset: 10 * 1024 * 1024, // 10MB for verification docs
};

/**
 * Human-readable size limit labels
 */
const SIZE_LIMIT_LABELS: Record<UploadPreset, string> = {
  avatar_preset: '5MB',
  cover_preset: '10MB',
  profile_images_preset: '10MB',
  verification_docs_preset: '10MB',
};

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates that a file is a valid image
 * @throws Error if validation fails
 */
function validateImage(file: File, preset: UploadPreset): void {
  // Check if file exists
  if (!file) {
    throw new Error('No file provided');
  }

  // Check MIME type
  if (!file.type.startsWith('image/')) {
    throw new Error(
      `Invalid file type: ${file.type}. Only images are allowed.`,
    );
  }

  // Check file size
  const maxSize = SIZE_LIMITS[preset];
  if (file.size > maxSize) {
    const maxSizeLabel = SIZE_LIMIT_LABELS[preset];
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(
      `File size (${fileSizeMB}MB) exceeds maximum allowed size of ${maxSizeLabel}`,
    );
  }

  // Check if file has a name
  if (!file.name) {
    throw new Error('File must have a name');
  }
}

/**
 * Validates upload preset
 * @throws Error if preset is invalid
 */
function validatePreset(preset: string): asserts preset is UploadPreset {
  const validPresets: UploadPreset[] = [
    'avatar_preset',
    'cover_preset',
    'profile_images_preset',
    'verification_docs_preset',
  ];

  if (!validPresets.includes(preset as UploadPreset)) {
    throw new Error(
      `Invalid preset: ${preset}. Must be one of: ${validPresets.join(', ')}`,
    );
  }
}

// ============================================================================
// API Communication
// ============================================================================

/**
 * Fetches upload signature from server
 * @throws Error if signature request fails
 */
async function getUploadSignature(
  preset: UploadPreset,
): Promise<SignaturePayload> {
  let response: Response;

  try {
    response = await fetch('/api/cloudinary/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ preset }),
    });
  } catch (error) {
    // Network or fetch error
    throw new Error(
      `Failed to connect to signature server: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }

  // Handle HTTP errors
  if (!response.ok) {
    let errorMessage = `Server returned ${response.status}`;

    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // Failed to parse error, use status message
    }

    throw new Error(`Failed to get upload signature: ${errorMessage}`);
  }

  // Parse successful response
  let data: SignaturePayload;
  try {
    data = await response.json();
  } catch {
    throw new Error('Invalid response from signature server');
  }

  // Validate signature payload
  if (
    !data.signature ||
    !data.timestamp ||
    !data.apiKey ||
    !data.cloudName ||
    !data.folder
  ) {
    throw new Error('Incomplete signature payload received');
  }

  return data;
}

/**
 * Uploads file to Cloudinary using signed upload
 * @throws Error if upload fails
 */
async function uploadToCloudinary(
  file: File,
  signature: SignaturePayload,
  preset: UploadPreset,
): Promise<UploadResult> {
  // Prepare form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', signature.timestamp.toString());
  formData.append('signature', signature.signature);
  formData.append('folder', signature.folder);
  // Note: upload_preset is NOT included because it's not part of the signed parameters
  // The folder is determined by the signature instead

  // Construct Cloudinary upload URL
  const uploadUrl = `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`;

  let response: Response;

  try {
    response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
  } catch (error) {
    // Network or fetch error
    throw new Error(
      `Failed to connect to Cloudinary: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    );
  }

  // Parse response
  let responseData: any;
  try {
    responseData = await response.json();
  } catch {
    throw new Error('Invalid response from Cloudinary');
  }

  // Handle Cloudinary errors
  if (!response.ok) {
    const errorData = responseData as CloudinaryErrorResponse;
    const errorMessage =
      errorData.error?.message ||
      `Upload failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  // Validate required fields in response
  if (
    !responseData.public_id ||
    !responseData.secure_url ||
    typeof responseData.width !== 'number' ||
    typeof responseData.height !== 'number'
  ) {
    throw new Error('Incomplete response from Cloudinary');
  }

  return {
    success: true,
    public_id: responseData.public_id,
    secure_url: responseData.secure_url,
    width: responseData.width,
    height: responseData.height,
  };
}

// ============================================================================
// Main Export
// ============================================================================

/**
 * Uploads an image to Cloudinary using signed uploads
 *
 * This function handles the complete upload flow:
 * 1. Validates the file (type, size)
 * 2. Requests an upload signature from your API
 * 3. Uploads the file to Cloudinary
 * 4. Returns the upload result
 *
 * @param options - Upload options
 * @param options.file - The image file to upload
 * @param options.preset - Upload preset determining folder and validation rules
 * @returns Upload result with image details or error
 *
 * @example
 * ```tsx
 * const result = await uploadImageSigned({
 *   file: selectedFile,
 *   preset: 'avatar_preset'
 * });
 *
 * if (result.success) {
 *   console.log('Uploaded:', result.secure_url);
 *   console.log('Dimensions:', result.width, 'x', result.height);
 * } else {
 *   console.error('Upload failed:', result.error);
 * }
 * ```
 */
export async function uploadImageSigned({
  file,
  preset,
}: UploadOptions): Promise<UploadResponse> {
  try {
    // Step 1: Validate preset
    validatePreset(preset);

    // Step 2: Validate file
    validateImage(file, preset);

    // Step 3: Get upload signature
    const signature = await getUploadSignature(preset);

    // Step 4: Upload to Cloudinary
    const result = await uploadToCloudinary(file, signature, preset);

    return result;
  } catch (error) {
    // Convert any error to a standardized error response
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
      code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
    };
  }
}

// ============================================================================
// Convenience Exports
// ============================================================================

/**
 * Upload an avatar image (max 5MB)
 */
export async function uploadAvatar(file: File): Promise<UploadResponse> {
  return uploadImageSigned({ file, preset: 'avatar_preset' });
}

/**
 * Upload a cover image (max 10MB)
 */
export async function uploadCover(file: File): Promise<UploadResponse> {
  return uploadImageSigned({ file, preset: 'cover_preset' });
}

/**
 * Upload a profile image (max 10MB)
 */
export async function uploadProfileImage(file: File): Promise<UploadResponse> {
  return uploadImageSigned({ file, preset: 'profile_images_preset' });
}

/**
 * Upload a verification document (max 10MB)
 */
export async function uploadVerificationDoc(file: File): Promise<UploadResponse> {
  return uploadImageSigned({ file, preset: 'verification_docs_preset' });
}
