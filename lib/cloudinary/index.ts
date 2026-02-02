/**
 * Cloudinary client-side utilities
 *
 * This module exports all Cloudinary upload and delete helpers for use in client components.
 *
 * @example
 * ```tsx
 * import { uploadAvatar, deleteCloudinaryImage } from '@/lib/cloudinary';
 *
 * const result = await uploadAvatar(file);
 * if (result.success) {
 *   console.log('Uploaded:', result.secure_url);
 * }
 *
 * await deleteCloudinaryImage(oldPublicId);
 * ```
 */

export {
  uploadImageSigned,
  uploadAvatar,
  uploadCover,
  uploadProfileImage,
  type UploadPreset,
  type UploadResult,
  type UploadError,
  type UploadResponse,
  type UploadOptions,
} from './uploadImage';

export {
  deleteCloudinaryImage,
  safeDeleteCloudinaryImage,
} from './deleteImage';
