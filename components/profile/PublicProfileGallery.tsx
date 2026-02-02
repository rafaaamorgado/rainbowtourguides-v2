'use client';

import { useState } from 'react';
import type { Database } from '@/types/database';

type ProfileImage = Database['public']['Tables']['profile_images']['Row'];

interface PublicProfileGalleryProps {
  images: ProfileImage[];
  userName?: string;
}

export function PublicProfileGallery({
  images,
  userName = 'Guide',
}: PublicProfileGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ProfileImage | null>(null);

  if (!images || images.length === 0) {
    return null; // Don't show empty gallery section
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Photo Gallery</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 hover:border-brand transition-colors group"
            >
              <img
                src={image.url}
                alt={image.caption || `${userName}'s photo`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-white text-xs truncate">{image.caption}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        {images.length >= 30 && (
          <p className="text-sm text-muted-foreground text-center">
            Showing {images.length} photos
          </p>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl font-light hover:text-slate-300 z-10"
            onClick={() => setSelectedImage(null)}
            aria-label="Close"
          >
            ×
          </button>

          <div
            className="relative max-w-5xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.caption || 'Photo'}
              className="w-full h-full object-contain"
            />
            {selectedImage.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-4">
                <p className="text-white text-center">
                  {selectedImage.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
