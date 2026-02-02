'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadCover } from '@/lib/cloudinary';
import { safeDeleteCloudinaryImage } from '@/lib/cloudinary/deleteImage';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

interface CoverUploaderProps {
  currentCoverUrl: string | null;
  userId: string;
  onSuccess?: (url: string) => void;
}

export function CoverUploader({
  currentCoverUrl,
  userId,
  onSuccess,
}: CoverUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverUrl, setCoverUrl] = useState(currentCoverUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Image must be less than 10MB');
      return;
    }

    setError(null);
    setUploading(true);

    try {
      // Upload to Cloudinary
      const uploadResult = await uploadCover(file);

      if (!uploadResult.success) {
        setError(uploadResult.error);
        setUploading(false);
        return;
      }

      // Update database
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError('Supabase client not available');
        setUploading(false);
        return;
      }

      // Get old public_id before updating
      const { data: oldProfile } = await supabase
        .from('profiles')
        .select('cover_public_id')
        .eq('id', userId)
        .single();

      const oldPublicId = (oldProfile as any)?.cover_public_id;

      // Update with new cover
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from('profiles')
        .update({
          cover_url: uploadResult.secure_url,
          cover_public_id: uploadResult.public_id,
        })
        .eq('id', userId);

      if (dbError) {
        setError('Failed to update profile: ' + dbError.message);
        setUploading(false);
        return;
      }

      // Success! Update UI
      setCoverUrl(uploadResult.secure_url);

      // Delete old cover from Cloudinary (non-fatal)
      if (oldPublicId && oldPublicId !== uploadResult.public_id) {
        safeDeleteCloudinaryImage(oldPublicId, 'old cover');
      }

      if (onSuccess) {
        onSuccess(uploadResult.secure_url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Cover Preview */}
      <div className="relative w-full h-48 rounded-lg bg-gradient-to-br from-pride-lilac to-pride-mint flex items-center justify-center overflow-hidden">
        {coverUrl ? (
          <>
            <img
              src={coverUrl}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
            )}
          </>
        ) : (
          <ImageIcon className="h-16 w-16 text-white opacity-50" />
        )}
      </div>

      {/* Upload Controls */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {coverUrl ? 'Change Cover' : 'Upload Cover'}
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          JPG, PNG, WebP or GIF. Max 10MB. Recommended: 1200x400px
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
