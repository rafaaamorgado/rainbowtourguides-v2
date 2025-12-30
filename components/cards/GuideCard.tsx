import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Languages as LanguagesIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getStoragePublicUrl } from "@/lib/storage-helpers";

export interface GuideCardProps {
  id: string;
  slug?: string; // Optional slug for routing, falls back to id
  name: string;
  photo_url: string;
  city_name: string;
  bio: string;
  rating: number | null;
  review_count: number;
  price_4h: number;
  price_6h: number;
  price_8h: number;
  currency?: string;
  experience_tags: string[];
  languages: string[];
}

// Experience tag labels for display
const EXPERIENCE_LABELS: Record<string, string> = {
  daytime: "Daytime",
  nightlife: "Nightlife",
  food: "Food & Dining",
  "queer-history": "Queer History",
  "hidden-gems": "Hidden Gems",
};

export function GuideCard({
  id,
  slug,
  name,
  photo_url,
  city_name,
  bio,
  rating,
  review_count,
  price_4h,
  price_6h,
  price_8h,
  currency = "USD",
  experience_tags,
  languages,
}: GuideCardProps) {
  // Calculate the lowest price
  const prices = [price_4h, price_6h, price_8h].filter((p) => p > 0);
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : 0;

  // Generate tagline from bio (first 80 chars)
  const tagline = bio
    ? bio.length > 80
      ? `${bio.substring(0, 80)}...`
      : bio
    : "Local LGBTQ+ tour guide";

  // Format rating display
  const ratingDisplay = rating && review_count > 0
    ? `${rating.toFixed(1)} ★ (${review_count})`
    : "No reviews yet";

  // Get currency symbol
  const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : currency;

  // Use slug for routing if available, otherwise fall back to id
  const href = `/guides/${slug || id}`;
  
  // Get public URL for photo
  const photoUrl = getStoragePublicUrl(photo_url, "guide-photos") || "/placeholder-avatar.svg";

  return (
    <Link href={href} className="block group">
      <div className="bg-white rounded-2xl shadow-md hover:shadow-float transition-all duration-300 overflow-hidden hover:-translate-y-1">
        {/* Guide Photo */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          <Image
            src={photoUrl}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Price Badge */}
          {lowestPrice > 0 && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md">
              <p className="text-xs text-slate-500 font-medium">from</p>
              <p className="text-lg font-bold text-brand -mt-1">
                {currencySymbol}{lowestPrice}
              </p>
            </div>
          )}

          {/* Rating Badge */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
            <Star
              size={14}
              className={rating && review_count > 0 ? "fill-amber-400 text-amber-400" : "text-slate-300"}
            />
            <span className="text-xs font-semibold text-slate-700">
              {rating && review_count > 0 ? rating.toFixed(1) : "New"}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 space-y-3">
          {/* Name and City */}
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900 group-hover:text-brand transition-colors line-clamp-1">
              {name}
            </h3>
            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
              <MapPin size={14} className="text-slate-400 flex-shrink-0" />
              <span className="line-clamp-1">{city_name}</span>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-sm text-slate-600 font-light leading-relaxed line-clamp-2 min-h-[2.5rem]">
            {tagline}
          </p>

          {/* Experience Tags */}
          {experience_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {experience_tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100"
                >
                  {EXPERIENCE_LABELS[tag] || tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Languages */}
          {languages.length > 0 && (
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <LanguagesIcon size={14} className="text-slate-400 flex-shrink-0" />
              <p className="text-xs text-slate-500 line-clamp-1">
                {languages.join(", ")}
              </p>
            </div>
          )}

          {/* Review Count (if no reviews, show encouraging text) */}
          {review_count === 0 && (
            <p className="text-xs text-slate-400 italic pt-1">
              Be the first to review!
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
