"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Guide } from "@/lib/mock-data";
import { getStoragePublicUrl } from "@/lib/storage-helpers";

interface TopGuidesSectionProps {
  guides: Guide[];
}

export function TopGuidesSection({ guides }: TopGuidesSectionProps) {
  const hasGuides = guides.length > 0;

  return (
    <section className="py-16 lg:py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.2em] text-brand font-semibold">
              Meet our top guides
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-ink">Travel with people who get you</h2>
            <p className="text-ink-soft max-w-2xl">
              Handpicked locals with verified backgrounds and glowing reviews.
            </p>
          </div>
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 text-brand font-semibold hover:text-brand/80"
          >
            View all guides
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {!hasGuides ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center space-y-3">
            <h3 className="text-xl font-semibold text-ink">Guides are being added</h3>
            <p className="text-ink-soft">
              We&apos;re onboarding locals right now. Browse cities to see who&apos;s available.
            </p>
            <Link href="/cities" className="text-brand font-semibold inline-flex items-center gap-2">
              Explore cities
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.slice(0, 4).map((guide) => {
              const price =
                guide.price_4h ??
                guide.price_6h ??
                guide.price_8h ??
                undefined;
              const tags = (guide.experience_tags || (guide as any).themes || []).slice(0, 3);
              const verified =
                guide.verified === true ||
                // @ts-expect-error legacy flag
                guide.is_verified === true;
              const countryName = (guide as any).country_name as string | undefined;
              const photo =
                getStoragePublicUrl(guide.avatar_url || guide.photo_url || '') ||
                guide.photo_url ||
                "/placeholder-avatar.svg";

              return (
                <Link
                  key={guide.id}
                  href={`/guides/${guide.slug || guide.id}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 rounded-full overflow-hidden bg-slate-100 ring-4 ring-white shadow-md">
                      <Image
                        src={photo}
                        alt={guide.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-ink group-hover:text-brand transition-colors">
                          {guide.name}
                        </h3>
                        {verified && (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-1">
                            <ShieldCheck className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-ink-soft">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {guide.city_name}
                          {countryName ? `, ${countryName}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-ink">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="h-4 w-4 fill-amber-400" />
                      <span className="font-semibold">
                        {guide.rating > 0 ? guide.rating.toFixed(1) : "New"}
                      </span>
                    </div>
                    <span className="text-ink-soft">
                      {guide.review_count > 0 ? `(${guide.review_count} reviews)` : "No reviews yet"}
                    </span>
                  </div>

                  {tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="rounded-full text-xs px-3 py-1">
                          {tag.replace(/-/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 flex items-center justify-between">
                    <div className="text-sm text-ink-soft">
                      From <span className="font-semibold text-ink">{price ? `$${price}` : '$120'}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-brand font-semibold">
                      View profile <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
