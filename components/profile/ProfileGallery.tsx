'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Loader2, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadProfileImage } from '@/lib/cloudinary';
import { safeDeleteCloudinaryImage } from '@/lib/cloudinary/deleteImage';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { Database } from '@/types/database';

type ProfileImage = Database['public']['Tables']['profile_images']['Row'];

interface ProfileGalleryProps {
  userId: string;
  isOwner: boolean;
  initialImages?: ProfileImage[];
}

export function ProfileGallery({
  userId,
  isOwner,
  initialImages = [],
}: ProfileGalleryProps) {
  const [images, setImages] = useState<ProfileImage[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images on mount
  useEffect(() => {
    loadImages();
  }, [userId]);

  const loadImages = async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from('profile_images')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (!error && data) {
      setImages(data);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError(null);
    setUploading(true);
    setUploadProgress(`Uploading 0/${files.length} images...`);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError('Supabase client not available');
      setUploading(false);
      return;
    }

    // Check if user has any primary image
    const { data: existingPrimary } = await supabase
      .from('profile_images')
      .select('id')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .single();

    const hasPrimary = !!existingPrimary;
    const newImages: ProfileImage[] = [];
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress(`Uploading ${i + 1}/${files.length} images...`);

      try {
        // Upload to Cloudinary
        const uploadResult = await uploadProfileImage(file);

        if (!uploadResult.success) {
          console.error(`Failed to upload ${file.name}:`, uploadResult.error);
          continue;
        }

        // Insert into database
        // Set first image as primary if user has no primary image yet
        const isPrimary = !hasPrimary && i === 0;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: insertedImage, error: insertError } = await (
          supabase as any
        )
          .from('profile_images')
          .insert({
            user_id: userId,
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
            caption: null,
            is_primary: isPrimary,
            sort_order: null,
          })
          .select()
          .single();

        if (insertError) {
          console.error(`Failed to save ${file.name}:`, insertError);
          continue;
        }

        newImages.push(insertedImage);
        successCount++;
      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
      }
    }

    if (successCount > 0) {
      setImages((prev) => [...newImages, ...prev]);
    }

    if (successCount < files.length) {
      setError(
        `${files.length - successCount} image(s) failed to upload. Please try again.`,
      );
    }

    setUploading(false);
    setUploadProgress('');

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    // Optimistic update
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      })),
    );

    try {
      // Transaction: Set all to false, then set target to true
      // First, unset all primary flags
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('profile_images')
        .update({ is_primary: false })
        .eq('user_id', userId)
        .eq('is_primary', true);

      // Then set the target image as primary
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('profile_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) {
        // Revert optimistic update
        await loadImages();
        setError('Failed to set primary image');
      }
    } catch (err) {
      // Revert optimistic update
      await loadImages();
      setError('Failed to set primary image');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    // Get the image data before deleting (for Cloudinary cleanup)
    const imageToDelete = images.find((img) => img.id === imageId);
    const publicIdToDelete = imageToDelete?.public_id;

    // Optimistic update
    setImages((prev) => prev.filter((img) => img.id !== imageId));

    // Delete from database
    const { error } = await supabase
      .from('profile_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      // Revert optimistic update
      await loadImages();
      setError('Failed to delete image');
      return;
    }

    // Delete from Cloudinary (non-fatal)
    if (publicIdToDelete) {
      safeDeleteCloudinaryImage(publicIdToDelete, 'gallery image');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Profile Gallery</h3>
          <p className="text-sm text-muted-foreground">
            {images.length} image{images.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Upload Button (only for owner) */}
        {isOwner && (
          <div>
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
                  {uploadProgress}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </>
              )}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Help Text (only for owner) */}
      {isOwner && images.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          <p className="text-sm">
            Upload images to your profile gallery. The first image will be set
            as your primary image automatically.
          </p>
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden border border-slate-200"
            >
              {/* Image */}
              <div className="aspect-square relative bg-slate-100">
                <img
                  src={image.url}
                  alt="Profile image"
                  className="w-full h-full object-cover"
                />

                {/* Primary Badge */}
                {image.is_primary && (
                  <div className="absolute top-2 right-2 bg-yellow-500 text-white rounded-full p-1.5">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                )}

                {/* Actions Overlay (only for owner) */}
                {isOwner && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!image.is_primary && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetPrimary(image.id)}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Set Primary
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isOwner && (
          <div className="text-center py-12 text-slate-500">
            <p>No images in gallery</p>
          </div>
        )
      )}
    </div>
  );
}
