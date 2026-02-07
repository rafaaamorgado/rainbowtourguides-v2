"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Star, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStoragePublicUrl } from "@/lib/storage-helpers";
import type { Guide } from "@/lib/mock-data";

interface CityGuideCardProps {
  guide: Guide;
}

export function GuideCard({ guide }: CityGuideCardProps) {
  const tags = (guide.experience_tags || []).slice(0, 3);
  const price =
    guide.price_4h ||
    guide.price_6h ||
    guide.price_8h ||
    0;
  const avatarSource = guide.avatar_url || guide.photo_url || null;
  const photo =
    (avatarSource ? getStoragePublicUrl(avatarSource, "guide-photos") : null) ||
    "/placeholder-avatar.svg";
  const ratingDisplay =
    guide.rating && guide.rating > 0 ? guide.rating.toFixed(1) : "New";

  return (
    <Link
      href={`/guides/${guide.slug || guide.id}`}
      className="group block rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
    >
      <div className="relative h-56 bg-slate-100">
        <Image
          src={photo}
          alt={guide.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {guide.verified && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/90 text-emerald-700 text-xs font-semibold px-3 py-1 shadow-sm">
            <BadgeCheck className="h-4 w-4" />
            Verified
          </span>
        )}
      </div>

      <div className="p-5 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-ink group-hover:text-brand transition-colors">
            {guide.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <MapPin className="h-4 w-4" />
            <span>
              {guide.city_name}
              {guide.country_name ? `, ${guide.country_name}` : ""}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-ink">
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="h-4 w-4 fill-amber-400" />
            <span className="font-semibold">{ratingDisplay}</span>
          </div>
          <span className="text-ink-soft">
            {guide.review_count > 0 ? `(${guide.review_count})` : "No reviews yet"}
          </span>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full text-xs px-3 py-1">
                {tag.replace(/-/g, " ")}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-ink-soft">From</div>
          <div className="text-lg font-semibold text-ink">
            {price ? `$${Number(price).toFixed(0)}` : "$120"}
          </div>
        </div>
      </div>
    </Link>
  );
}
