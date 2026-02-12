"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import type { City } from "@/lib/mock-data";
import { getCityImageSrc } from "@/lib/city-images";

interface ExploreCitiesSectionProps {
  cities: City[];
}

export function ExploreCitiesSection({ cities }: ExploreCitiesSectionProps) {
  const hasCities = cities.length > 0;

  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-brand font-semibold">
            Explore top cities
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-ink">Plan your next adventure</h2>
          <p className="text-ink-soft max-w-2xl mx-auto">
            LGBTQ+ friendly neighborhoods, culture, and hidden gems curated by locals who live and love their cities.
          </p>
        </div>

        {!hasCities ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center space-y-3">
            <h3 className="text-xl font-semibold text-ink">Cities loading soon</h3>
            <p className="text-ink-soft">
              Our team is adding destinations right now. Browse guides or check back shortly.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link href="/guides" className="text-brand font-semibold inline-flex items-center gap-2">
                View guides
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/cities" className="text-ink font-medium underline">
                All cities
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cities.slice(0, 5).map((city) => (
              <Link
                key={city.id}
                href={`/cities/${city.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-900 shadow-lg transition-transform duration-300 hover:-translate-y-1 aspect-[16/9]"
              >
                <div className="absolute inset-0">
                  <Image
                    src={getCityImageSrc(city.slug, city.image_url)}
                    alt={city.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />
                </div>

                <div className="relative p-6 flex flex-col h-full justify-end space-y-2 text-white">
                  <div className="flex items-center gap-2 text-sm text-white/80">
                    <MapPin className="h-4 w-4" />
                    <span>{city.country_name}</span>
                  </div>
                  <h3 className="text-2xl font-semibold">{city.name}</h3>
                  <p className="text-sm text-white/80">
                    {city.guide_count} {city.guide_count === 1 ? "guide" : "guides"} available
                  </p>
                  <div className="flex items-center justify-between pt-2 text-sm text-white/80">
                    <span>From $140 / 4hrs</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-white">
                      Explore <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* View All Card */}
            <Link
              href="/cities"
              className="border border-dashed border-slate-300 rounded-2xl flex items-center justify-center text-center p-6 bg-slate-50 hover:bg-white transition-colors"
            >
              <div className="space-y-2">
                <p className="text-sm font-semibold text-brand uppercase tracking-[0.2em]">Browse</p>
                <h3 className="text-xl font-semibold text-ink">View all cities</h3>
                <p className="text-ink-soft text-sm max-w-xs">
                  See every destination and pick the guide who matches your vibe.
                </p>
              </div>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
