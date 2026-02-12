'use client';

import Image from 'next/image';
import { MapPin, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getStoragePublicUrl } from '@/lib/storage-helpers';

interface TravelerPublicHeroProps {
  name: string;
  countryName?: string | null;
  joinedDate: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
}

export function TravelerPublicHero({
  name,
  countryName,
  joinedDate,
  avatarUrl,
  coverUrl,
}: TravelerPublicHeroProps) {
  const avatar =
    getStoragePublicUrl(avatarUrl || '', 'avatars') ||
    avatarUrl ||
    '/images/guides/default.svg';
  const cover =
    getStoragePublicUrl(coverUrl || '', 'covers') ||
    coverUrl ||
    '/images/covers/default.svg';

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl ring-1 ring-black/5">
      <div className="absolute inset-0">
        <Image
          src={cover}
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
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="bg-primary text-white text-xl font-semibold">
                {name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">{name}</h1>
            <div className="flex items-center gap-3 text-sm text-white/80 flex-wrap">
              {countryName && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {countryName}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Joined {joinedDate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
