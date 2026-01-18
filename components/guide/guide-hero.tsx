"use client";

import Image from "next/image";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getStoragePublicUrl } from "@/lib/storage-helpers";

interface GuideHeroProps {
  name: string;
  city?: string;
  country?: string;
  avatarUrl?: string | null;
  coverImage: string;
  rating?: number;
  reviews?: number;
  verified?: boolean;
  headline?: string | null;
}

export function GuideHero({
  name,
  city,
  country,
  avatarUrl,
  coverImage,
  rating,
  reviews,
  verified,
  headline,
}: GuideHeroProps) {
  const photo =
    getStoragePublicUrl(avatarUrl || "") ||
    avatarUrl ||
    "/images/guides/default.svg";
  const ratingLabel =
    rating && rating > 0 ? `${rating.toFixed(1)} (${reviews ?? 0} reviews)` : "New";

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl ring-1 ring-black/5">
      <div className="absolute inset-0">
        <Image
          src={coverImage}
          alt={`${name} cover`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-transparent" />
      </div>

      <div className="relative px-6 sm:px-10 lg:px-14 py-10 sm:py-16 flex flex-col justify-end text-white gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-5">
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border-4 border-white/20 shadow-lg bg-white/10">
            <Avatar className="h-full w-full">
              <AvatarImage src={photo} alt={name} />
              <AvatarFallback className="bg-brand text-white text-xl font-semibold">
                {name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight">{name}</h1>
              {verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold">
                  <BadgeCheck className="h-4 w-4" />
                  Verified
                </span>
              )}
            </div>
            {headline && (
              <p className="text-white/80 text-sm sm:text-base max-w-2xl">
                {headline}
              </p>
            )}
            <div className="flex items-center gap-3 text-sm text-white/80 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {city}
                {country ? `, ${country}` : ""}
              </span>
              {rating && rating > 0 && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/60" />
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {ratingLabel}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
