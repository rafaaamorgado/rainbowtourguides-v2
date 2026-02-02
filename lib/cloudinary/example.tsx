/**
 * Example Component - Cloudinary Upload
 *
 * This is a reference implementation showing how to use the uploadImage helper.
 * Copy and adapt this code for your own components.
 *
 * ⚠️ This file is for reference only and is not used in the application.
 */

'use client';

import { useState } from 'react';
import { uploadAvatar, type UploadResponse } from './uploadImage';

/**
 * Simple avatar uploader with progress and error handling
 */
export function SimpleAvatarUploader() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const result = await uploadAvatar(file);

    if (result.success) {
      setAvatarUrl(result.secure_url);
      setDimensions({ width: result.width, height: result.height });

      // TODO: Save to database
      // await saveAvatarToDatabase(result.secure_url, result.public_id);
    } else {
      setError(result.error);
    }

    setUploading(false);
  };

  return (
    <div className="space-y-4 p-6 max-w-md">
      <h2 className="text-xl font-bold">Upload Avatar</h2>

      {/* File Input */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Select an image (max 5MB)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-violet-50 file:text-violet-700
            hover:file:bg-violet-100
            disabled:opacity-50"
        />
      </div>

      {/* Loading State */}
      {uploading && (
        <div className="flex items-center gap-2 text-blue-600">
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span>Uploading...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-semibold">Upload failed</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Success - Show Avatar */}
      {avatarUrl && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-green-600">
            Upload successful!
          </p>
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover border-2 border-slate-200"
          />
          {dimensions && (
            <p className="text-xs text-slate-500">
              {dimensions.width} × {dimensions.height} pixels
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Advanced uploader with preview and validation
 */
export function AdvancedAvatarUploader({ userId }: { userId: string }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle file selection (show preview)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image must be less than 5MB');
      return;
    }

    // Clear previous error
    setError(null);

    // Store file
    setSelectedFile(file);

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    const result = await uploadAvatar(selectedFile);

    if (result.success) {
      setAvatarUrl(result.secure_url);

      // Save to database
      try {
        const response = await fetch(`/api/users/${userId}/avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            avatar_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save avatar');
        }

        // Clean up preview
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
      } catch (err) {
        setError('Uploaded but failed to save. Please try again.');
      }
    } else {
      setError(result.error);
    }

    setUploading(false);
  };

  // Handle cancel
  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="space-y-4 p-6 max-w-md">
      <h2 className="text-xl font-bold">Update Avatar</h2>

      {/* Current Avatar */}
      {avatarUrl && !previewUrl && (
        <div>
          <p className="text-sm text-slate-600 mb-2">Current avatar:</p>
          <img
            src={avatarUrl}
            alt="Current avatar"
            className="w-32 h-32 rounded-full object-cover border-2 border-slate-200"
          />
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div>
          <p className="text-sm text-slate-600 mb-2">Preview:</p>
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 rounded-full object-cover border-2 border-blue-500"
          />
          <p className="text-xs text-slate-500 mt-1">
            {selectedFile?.name} ({(selectedFile!.size / 1024).toFixed(1)} KB)
          </p>
        </div>
      )}

      {/* File Input */}
      {!previewUrl && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Select new avatar
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="block w-full text-sm"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Actions */}
      {previewUrl && (
        <div className="flex gap-2">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <button
            onClick={handleCancel}
            disabled={uploading}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Multiple image uploader (for profile galleries)
 */
export function MultipleImageUploader({ userId }: { userId: string }) {
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    // Upload all files in parallel
    const uploadPromises = files.map(async (file) => {
      const result = await uploadAvatar(file);
      return result.success ? result.secure_url : null;
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(
      (url): url is string => url !== null,
    );

    if (successfulUploads.length > 0) {
      setImages((prev) => [...prev, ...successfulUploads]);
    }

    if (successfulUploads.length < files.length) {
      setError(
        `${files.length - successfulUploads.length} file(s) failed to upload`,
      );
    }

    setUploading(false);
  };

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-xl font-bold">Upload Profile Images</h2>

      {/* File Input */}
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        disabled={uploading}
        className="block w-full text-sm"
      />

      {/* Loading */}
      {uploading && <div className="text-blue-600">Uploading...</div>}

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Upload ${index + 1}`}
                className="w-full h-32 object-cover rounded"
              />
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
