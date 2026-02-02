'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Upload,
  X,
  User,
  FileText,
  Loader2,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface PhotoUploadProps {
  /** Current photo URL(s) */
  value?: string | string[] | null;
  /** Callback when photo is uploaded or removed */
  onChange: (url: string | string[] | null) => void;
  /** Upload function that takes the file and returns the result */
  onUpload: (
    file: File,
  ) => Promise<{ success: boolean; url?: string; error?: string }>;
  /** Visual variant */
  variant?: 'avatar' | 'photo' | 'document' | 'gallery';
  /** Size of the upload area */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Whether the upload is disabled */
  disabled?: boolean;
  /** Maximum number of files (for gallery variant) */
  maxFiles?: number;
  /** Accept file types */
  accept?: string;
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Show preview */
  showPreview?: boolean;
  /** Additional class names */
  className?: string;
  /** Placeholder name/initials (for avatar variant) */
  placeholder?: string;
}

const sizeClasses = {
  avatar: {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  },
  photo: {
    sm: 'h-32',
    md: 'h-40',
    lg: 'h-48',
    xl: 'h-56',
  },
  document: {
    sm: 'h-32',
    md: 'h-40',
    lg: 'h-48',
    xl: 'h-56',
  },
  gallery: {
    sm: 'h-24',
    md: 'h-32',
    lg: 'h-40',
    xl: 'h-48',
  },
};

export function PhotoUpload({
  value,
  onChange,
  onUpload,
  variant = 'photo',
  size = 'md',
  disabled = false,
  maxFiles = 1,
  accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif',
  maxSizeMB = 5,
  label,
  helperText,
  showPreview = true,
  className,
  placeholder,
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isGallery = variant === 'gallery';
  const currentUrls = Array.isArray(value) ? value : value ? [value] : [];
  const canAddMore = isGallery && currentUrls.length < maxFiles;

  const validateFile = (file: File): string | null => {
    if (
      accept &&
      !accept.split(',').some((type) => file.type.match(type.trim()))
    ) {
      return `Please select a valid file type (${accept})`;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      setIsUploading(true);

      // Show preview immediately
      if (showPreview && file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
      }

      try {
        const result = await onUpload(file);

        if (result.success && result.url) {
          if (isGallery) {
            const newUrls = [...currentUrls, result.url];
            onChange(newUrls);
          } else {
            onChange(result.url);
          }
          setPreviewUrl(null);
        } else {
          setError(result.error || 'Upload failed');
          setPreviewUrl(null);
        }
      } catch (err) {
        setError('Upload failed. Please try again.');
        setPreviewUrl(null);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onUpload, onChange, isGallery, currentUrls, showPreview, validateFile],
  );

  const handleRemove = useCallback(
    (index?: number) => {
      if (isGallery && typeof index === 'number') {
        const newUrls = currentUrls.filter((_, i) => i !== index);
        onChange(newUrls.length > 0 ? newUrls : null);
      } else {
        onChange(null);
      }
      setPreviewUrl(null);
      setError(null);
    },
    [onChange, isGallery, currentUrls],
  );

  // Avatar variant
  if (variant === 'avatar') {
    const avatarUrl = previewUrl || (typeof value === 'string' ? value : null);

    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div
          className={cn(
            'relative rounded-full bg-gradient-to-br from-pride-lilac to-pride-mint flex items-center justify-center flex-shrink-0 overflow-hidden',
            sizeClasses.avatar[size],
          )}
        >
          {avatarUrl ? (
            <>
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </>
          ) : (
            <div className="text-white font-semibold text-2xl">
              {placeholder ? (
                placeholder.charAt(0).toUpperCase()
              ) : (
                <User className="h-8 w-8" />
              )}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          {label && (
            <p className="text-sm font-medium text-slate-900">{label}</p>
          )}

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled || isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                </>
              )}
            </Button>

            {avatarUrl && !isUploading && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => handleRemove()}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {helperText && !error && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>
    );
  }

  // Gallery variant
  if (variant === 'gallery') {
    return (
      <div className={cn('space-y-4', className)}>
        {label && (
          <div>
            <h3 className="text-lg font-medium">{label}</h3>
            {helperText && (
              <p className="text-sm text-muted-foreground mt-1">{helperText}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {currentUrls.map((url, index) => (
            <div
              key={index}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 group',
                sizeClasses.gallery[size],
              )}
            >
              <img
                src={url}
                alt={`Photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              >
                <X className="h-4 w-4 text-red-600" />
              </button>
            </div>
          ))}

          {canAddMore && (
            <label
              className={cn(
                'aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand hover:bg-slate-50 transition-colors',
                disabled && 'opacity-50 cursor-not-allowed',
                isUploading && 'border-brand bg-brand/5',
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-brand animate-spin mb-2" />
                  <p className="text-xs text-brand font-medium">Uploading...</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                    <Upload className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-600 font-medium">
                    Add Photo
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentUrls.length}/{maxFiles}
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || isUploading}
              />
            </label>
          )}
        </div>

        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
    );
  }

  // Document variant
  if (variant === 'document') {
    const documentUrl =
      previewUrl || (typeof value === 'string' ? value : null);
    const isImage = documentUrl?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    return (
      <div className={cn('space-y-3', className)}>
        {label && (
          <label className="text-sm font-medium text-slate-700">{label}</label>
        )}

        {isUploading ? (
          <div
            className={cn(
              'flex flex-col items-center justify-center w-full border-2 border-dashed border-brand rounded-2xl bg-brand/5',
              sizeClasses.document[size],
            )}
          >
            <Loader2 className="h-12 w-12 text-brand animate-spin mb-4" />
            <p className="text-sm font-medium text-slate-700">Uploading...</p>
          </div>
        ) : documentUrl ? (
          <div className="space-y-3">
            <div
              className={cn(
                'relative w-full rounded-2xl overflow-hidden border-2 border-slate-200',
                sizeClasses.document[size],
              )}
            >
              {isImage ? (
                <img
                  src={documentUrl}
                  alt="Document"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50">
                  <FileText className="h-12 w-12 text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600">Document uploaded</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemove()}
                disabled={disabled}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          </div>
        ) : (
          <label
            className={cn(
              'flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl transition-colors cursor-pointer',
              error
                ? 'border-red-300 bg-red-50'
                : 'border-slate-300 hover:border-brand hover:bg-slate-50',
              disabled && 'opacity-50 cursor-not-allowed',
              sizeClasses.document[size],
            )}
          >
            <div className="flex flex-col items-center space-y-3 px-6">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Upload className="h-8 w-8 text-slate-400" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-slate-700">
                  Click to upload
                </p>
                <p className="text-xs text-slate-500">
                  {helperText || `Max ${maxSizeMB}MB`}
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled || isUploading}
            />
          </label>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // Default photo variant
  const photoUrl = previewUrl || (typeof value === 'string' ? value : null);

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}

      {isUploading ? (
        <div
          className={cn(
            'flex flex-col items-center justify-center w-full border-2 border-dashed border-brand rounded-2xl bg-brand/5',
            sizeClasses.photo[size],
          )}
        >
          <Loader2 className="h-8 w-8 text-brand animate-spin mb-2" />
          <p className="text-sm font-medium text-slate-700">Uploading...</p>
        </div>
      ) : photoUrl ? (
        <div
          className={cn(
            'relative w-full rounded-2xl overflow-hidden border-2 border-slate-200 group',
            sizeClasses.photo[size],
          )}
        >
          <img
            src={photoUrl}
            alt="Photo preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Camera className="h-4 w-4 text-slate-600" />
            </button>
            <button
              type="button"
              onClick={() => handleRemove()}
              disabled={disabled}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="h-4 w-4 text-red-600" />
            </button>
          </div>
        </div>
      ) : (
        <label
          className={cn(
            'flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl transition-colors cursor-pointer',
            error
              ? 'border-red-300 bg-red-50'
              : 'border-slate-300 hover:border-brand hover:bg-slate-50',
            disabled && 'opacity-50 cursor-not-allowed',
            sizeClasses.photo[size],
          )}
        >
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700">
                Click to upload photo
              </p>
              <p className="text-xs text-slate-500">
                {helperText || `PNG, JPG up to ${maxSizeMB}MB`}
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled || isUploading}
          />
        </label>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
