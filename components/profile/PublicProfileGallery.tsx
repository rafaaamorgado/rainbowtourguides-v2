'use client';

import { useState } from 'react';
import type { Database } from '@/types/database';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Pagination } from 'swiper/modules';
import Lightbox from 'yet-another-react-lightbox';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'yet-another-react-lightbox/styles.css';

type ProfileImage = Database['public']['Tables']['profile_images']['Row'];

interface PublicProfileGalleryProps {
  images: ProfileImage[];
  userName?: string;
}

export function PublicProfileGallery({
  images,
  userName = 'Guide',
}: PublicProfileGalleryProps) {
  const [index, setIndex] = useState(-1);

  if (!images || images.length === 0) {
    return null;
  }

  const slides = images.map((img) => ({
    src: img.url,
    alt: img.caption || `${userName}'s photo`,
  }));

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Photo Gallery</h2>

        <Swiper
          modules={[FreeMode, Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView="auto"
          freeMode={true}
          loop={true}
          grabCursor={true}
          navigation
          pagination={{ clickable: true }}
          className="w-full h-[300px] sm:h-[400px] rounded-lg"
        >
          {images.map((image, i) => (
            <SwiperSlide
              key={image.id}
              className="!w-auto !h-full"
            >
              <button
                type="button"
                onClick={() => setIndex(i)}
                className="h-full cursor-zoom-in relative block select-none"
              >
                <img
                  src={image.url}
                  alt={image.caption || `${userName}'s photo`}
                  className="h-full w-auto max-w-none rounded-lg shadow-sm object-contain"
                  draggable={false}
                />
                {image.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
                    <p className="text-white text-xs truncate">
                      {image.caption}
                    </p>
                  </div>
                )}
              </button>
            </SwiperSlide>
          ))}
        </Swiper>

        {images.length >= 30 && (
          <p className="text-sm text-muted-foreground text-center">
            Showing {images.length} photos
          </p>
        )}
      </div>

      <Lightbox
        open={index >= 0}
        close={() => setIndex(-1)}
        index={index}
        slides={slides}
      />
    </>
  );
}
