"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";

interface CityHeroProps {
  name: string;
  country?: string;
  guideCount: number;
  imageSrc: string;
  /** Photographer name (e.g. from Unsplash) */
  attribution?: string | null;
  /** Link to photographer profile */
  attributionUrl?: string | null;
  /** Image source (e.g. "Unsplash") */
  imageSource?: string | null;
}

export function CityHero({
  name,
  country,
  guideCount,
  imageSrc,
  attribution,
  attributionUrl,
  imageSource,
}: CityHeroProps) {
  const guideLabel = guideCount === 1 ? "guide" : "guides";

  return (
    <section className="relative w-full overflow-hidden rounded-3xl bg-slate-900 shadow-2xl ring-1 ring-black/5">
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={`${name} city skyline`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      <div className="relative px-6 sm:px-10 lg:px-14 py-16 sm:py-24 flex flex-col justify-end text-white max-w-4xl space-y-4">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-white/80">
          <MapPin className="h-4 w-4" />
          {country || "Destination"}
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight">
          {name}
        </h1>
        <p className="text-lg text-white/80">
          {guideCount} {guideLabel} available
        </p>
      </div>

      {/* Unsplash attribution (required by Unsplash guidelines) */}
      {attribution && (
        <div className="absolute bottom-3 right-4 text-[10px] text-white/50">
          Photo by{" "}
          {attributionUrl ? (
            <a
              href={attributionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/70 transition-colors"
            >
              {attribution}
            </a>
          ) : (
            attribution
          )}
          {imageSource && (
            <>
              {" "}
              on{" "}
              <a
                href="https://unsplash.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white/70 transition-colors"
              >
                {imageSource}
              </a>
            </>
          )}
        </div>
      )}
    </section>
  );
}
