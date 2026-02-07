'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadAvatar } from '@/lib/cloudinary';
import { safeDeleteCloudinaryImage } from '@/lib/cloudinary/deleteImage';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

interface AvatarUploaderProps {
  currentAvatarUrl: string | null;
  userId: string;
  onSuccess?: (url: string) => void;
}

export function AvatarUploader({
  currentAvatarUrl,
  userId,
  onSuccess,
}: AvatarUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setError(null);
    setUploading(true);

    try {
      // Upload to Cloudinary
      const uploadResult = await uploadAvatar(file);

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
        .select('avatar_public_id')
        .eq('id', userId)
        .single();

      const oldPublicId = (oldProfile as any)?.avatar_public_id;

      // Update with new avatar
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: dbError } = await (supabase as any)
        .from('profiles')
        .update({
          avatar_url: uploadResult.secure_url,
          avatar_public_id: uploadResult.public_id,
        })
        .eq('id', userId);

      if (dbError) {
        setError('Failed to update profile: ' + dbError.message);
        setUploading(false);
        return;
      }

      // Success! Update UI
      setAvatarUrl(uploadResult.secure_url);

      // Delete old avatar from Cloudinary (non-fatal)
      if (oldPublicId && oldPublicId !== uploadResult.public_id) {
        safeDeleteCloudinaryImage(oldPublicId, 'old avatar');
      }

      // Dispatch event to update header
      window.dispatchEvent(new Event('profile-updated'));

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
      <div className="flex items-center gap-4">
        {/* Avatar Preview */}
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-pride-lilac to-pride-mint flex items-center justify-center flex-shrink-0 overflow-hidden">
          {avatarUrl ? (
            <>
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </>
          ) : (
            <User className="h-12 w-12 text-white" />
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="bordered"
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
                  {avatarUrl ? 'Change Avatar' : 'Upload Avatar'}
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP or GIF. Max 5MB.
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
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
