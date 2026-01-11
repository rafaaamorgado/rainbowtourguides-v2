import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface GuideCardProps {
  guide: {
    id: string;
    name: string;
    slug: string;
    city_name: string;
    country_name: string;
    photo_url: string;
    tagline: string;
    rating: number;
    review_count: number;
    price_4h: number;
    experience_tags: string[];
    verified: boolean;
    instant_book: boolean;
  };
  variant?: "default" | "compact";
}

/**
 * GuideCard - Premium guide card component matching Brand Style Guide V2
 * 
 * Features:
 * - Premium, minimal design with subtle pride details
 * - Smooth hover animations
 * - Verified and instant book badges
 * - Responsive and mobile-optimized
 * 
 * @example
 * <GuideCard guide={guide} />
 * <GuideCard guide={guide} variant="compact" />
 */
export const GuideCard = React.forwardRef<HTMLDivElement, GuideCardProps>(
  ({ guide, variant = "default" }, ref) => {
    const isCompact = variant === "compact";

    // Format rating display
    const ratingDisplay = `${guide.rating.toFixed(1)} (${guide.review_count})`;

    // Display max 3 tags
    const displayTags = guide.experience_tags.slice(0, 3);

    // Alternate tag colors for subtle visual interest
    const getTagBg = (index: number) => {
      const colors = ["bg-pride-lilac/30", "bg-pride-mint/30", "bg-pride-lilac/30"];
      return colors[index % colors.length];
    };

    return (
      <div ref={ref}>
        <Link
          href={`/guides/${guide.slug}`}
          className="block group cursor-pointer"
        >
          <div
            className={cn(
              "bg-panel-light border border-slate-200 rounded-2xl shadow-md hover:shadow-glass",
              "transition-all duration-300 overflow-hidden",
              "hover:-translate-y-0.5"
            )}
          >
            {/* Photo Section */}
            <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-slate-100">
              <Image
                src={guide.photo_url}
                alt={guide.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />

              {/* Verified Badge */}
              {guide.verified && (
                <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                  <Star className="h-3 w-3 fill-white" />
                  Verified
                </div>
              )}
            </div>

            {/* Content Section */}
            <div className={cn("p-6 space-y-3", isCompact && "p-4 space-y-2")}>
              {/* Name */}
              <h3
                className={cn(
                  "font-semibold text-ink mb-1 group-hover:text-brand transition-colors",
                  isCompact ? "text-lg" : "text-xl"
                )}
              >
                {guide.name}
              </h3>

              {/* Location */}
              <p className="text-sm text-ink-soft mb-2">
                {guide.city_name}, {guide.country_name}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i < Math.floor(guide.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-slate-300"
                    )}
                  />
                ))}
                <span className="text-sm text-ink-soft ml-1">
                  {ratingDisplay}
                </span>
              </div>

              {/* Tagline */}
              {!isCompact && (
                <p className="text-sm text-ink-soft line-clamp-2 mb-3 leading-relaxed">
                  {guide.tagline}
                </p>
              )}

              {/* Tags */}
              {displayTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {displayTags.map((tag, index) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className={cn(
                        "text-xs px-3 py-1 rounded-full border-0 font-medium text-slate-700",
                        getTagBg(index)
                      )}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Price and Instant Book */}
              <div className="flex items-end justify-between pt-2">
                <div>
                  <p className="text-xs text-ink-soft mb-0.5">From</p>
                  <p className="text-lg font-semibold text-ink">
                    ${guide.price_4h}
                  </p>
                </div>

                {guide.instant_book && (
                  <Badge
                    variant="secondary"
                    className="bg-brand/10 text-brand border-0 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1"
                  >
                    <Zap className="h-3 w-3 fill-brand" />
                    Instant Book
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  }
);

GuideCard.displayName = "GuideCard";

/**
 * GuideCardSkeleton - Loading skeleton for guide card
 */
export const GuideCardSkeleton = React.forwardRef<
  HTMLDivElement,
  { variant?: "default" | "compact" }
>(({ variant = "default" }, ref) => {
  const isCompact = variant === "compact";

  return (
    <div
      ref={ref}
      className="bg-panel-light border border-slate-200 rounded-2xl shadow-md overflow-hidden"
    >
      {/* Photo skeleton */}
      <div className="relative aspect-square bg-slate-200 animate-pulse rounded-t-2xl" />

      {/* Content skeleton */}
      <div className={cn("p-6 space-y-3", isCompact && "p-4 space-y-2")}>
        <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
        <div className="flex gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
        {!isCompact && (
          <>
            <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-slate-200 rounded animate-pulse" />
          </>
        )}
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
        </div>
        <div className="flex justify-between items-end pt-2">
          <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-slate-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
});

GuideCardSkeleton.displayName = "GuideCardSkeleton";

/**
 * GuideCardGrid - Grid container for guide cards
 */
export const GuideCardGrid = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
      className
    )}
    {...props}
  >
    {children}
  </div>
));

GuideCardGrid.displayName = "GuideCardGrid";

