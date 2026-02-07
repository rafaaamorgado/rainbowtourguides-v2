'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface AvatarUploadProps {
  /** Current avatar URL */
  value?: string | null;
  /** Callback when avatar is uploaded */
  onChange: (url: string | null) => void;
  /** Upload function that takes the file and returns the URL */
  onUpload: (
    file: File,
  ) => Promise<{ success: boolean; url?: string; error?: string }>;
  /** Size of the avatar preview */
  size?: 'sm' | 'md' | 'lg';
  /** Whether the upload is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
}

const sizeClasses = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

const iconSizes = {
  sm: 'h-6 w-6',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
};

export function AvatarUpload({
  value,
  onChange,
  onUpload,
  size = 'md',
  disabled = false,
  className,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }

      setError(null);
      setIsUploading(true);

      // Show preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      try {
        const result = await onUpload(file);

        if (result.success && result.url) {
          onChange(result.url);
          setPreview(null);
        } else {
          setError(result.error || 'Upload failed');
          setPreview(null);
        }
      } catch (err) {
        setError('Upload failed. Please try again.');
        setPreview(null);
      } finally {
        setIsUploading(false);
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [onUpload, onChange],
  );

  const handleRemove = useCallback(() => {
    onChange(null);
    setPreview(null);
    setError(null);
  }, [onChange]);

  const displayUrl = preview || value;

  return (
    <div className={cn('flex items-center gap-4', className)}>
      {/* Avatar Preview */}
      <div
        className={cn(
          'relative rounded-full bg-gradient-to-br from-pride-lilac to-pride-mint flex items-center justify-center flex-shrink-0 overflow-hidden',
          sizeClasses[size],
        )}
      >
        {displayUrl ? (
          <>
            <img
              src={displayUrl}
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
          <User className={cn('text-white', iconSizes[size])} />
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="bordered"
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
                <Upload className="h-4 w-4 mr-2" />
                {value ? 'Change' : 'Upload'}
              </>
            )}
          </Button>

          {value && !isUploading && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <p className="text-xs text-muted-foreground">
          JPG, PNG, WebP or GIF. Max 2MB.
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || isUploading}
      />
    </div>
  );
}
