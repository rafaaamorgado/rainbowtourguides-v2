"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";

interface CityHeroProps {
  name: string;
  country?: string;
  guideCount: number;
  imageSrc: string;
}

export function CityHero({ name, country, guideCount, imageSrc }: CityHeroProps) {
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
        <p className="inline-flex items-center gap-2 text-sm font-medium text-white/80">
          <MapPin className="h-4 w-4" />
          {country || "Destination"}
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          {name}
        </h1>
        <p className="text-lg text-white/80">
          {guideCount} {guideLabel} available
        </p>
      </div>
    </section>
  );
}
