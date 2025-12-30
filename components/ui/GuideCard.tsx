import Link from "next/link";
import { Star, ShieldCheck } from "lucide-react";
import Image from "next/image";
import type { GuideStatus } from "@/types/database";
import { getStoragePublicUrl } from "@/lib/storage-helpers";

type GuideCardProps = {
  guide: {
    id: string;
    slug: string;
    status: GuideStatus;
    headline: string | null;
    hourly_rate: string;
    currency: string | null;
    rating_avg: number | null;
    profile: {
      display_name: string;
      avatar_url: string | null;
    } | null;
    themes?: string[] | null;
  };
};

export function GuideCard({ guide }: GuideCardProps) {
  const isVerified = guide.status === "approved";
  const displayName = guide.profile?.display_name || "Guide";
  const avatarUrl = getStoragePublicUrl(guide.profile?.avatar_url, "guide-photos") || "/placeholder-avatar.svg";
  const rating = guide.rating_avg || 5.0;
  const price = parseFloat(guide.hourly_rate);
  const themes = guide.themes || [];

  return (
    <Link href={`/guides/${guide.slug}`} className="block group cursor-pointer">
      <div className="relative aspect-[3/4] overflow-hidden rounded-3xl mb-4 shadow-md group-hover:shadow-2xl transition-all duration-500">
        <Image
          src={avatarUrl}
          alt={displayName}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105 filter grayscale-[20%] group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>

        {isVerified && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[10px] font-bold text-slate-900 tracking-wider shadow-sm">
            <ShieldCheck size={12} className="text-brand" />
            VERIFIED
          </div>
        )}

        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-slate-900 shadow-sm">
          <Star size={12} className="fill-brand text-brand" />
          {rating.toFixed(1)}
        </div>
      </div>

      <div className="px-1">
        <div className="flex justify-between items-end mb-1">
          <h3 className="text-2xl font-serif font-bold text-slate-900 group-hover:text-brand transition-colors">
            {displayName}
          </h3>
          <span className="text-sm font-medium text-slate-500">
            from {guide.currency || "$"}
            {price}/hr
          </span>
        </div>
        <p className="text-slate-500 text-sm font-light leading-relaxed line-clamp-1">
          {guide.headline || "Local guide"}
        </p>

        {themes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {themes.slice(0, 2).map((theme) => (
              <span
                key={theme}
                className="text-[10px] font-bold border border-slate-200 text-slate-400 px-2 py-1 rounded-md uppercase tracking-wide"
              >
                {theme}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
