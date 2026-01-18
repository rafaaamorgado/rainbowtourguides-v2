import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { getCitiesWithMeta } from "@/lib/data-service";
import { EmptyState } from "@/components/ui/empty-state";
import { ClientDebug } from "@/components/dev-debug";
import { getCityImageUrl } from "@/lib/city-images";

export const metadata: Metadata = {
  title: "Explore Cities - Rainbow Tour Guides",
  description:
    "Discover trusted LGBTQ+ local guides in cities worldwide. Safe, authentic travel experiences in curated destinations.",
  openGraph: {
    title: "Explore Cities - Rainbow Tour Guides",
    description:
      "Discover trusted LGBTQ+ local guides in cities worldwide.",
    type: "website",
  },
};

// Supabase usage requires dynamic rendering so cookies/env are available at runtime
export const dynamic = "force-dynamic";

/**
 * CityCard - Premium city card with cinematic photo and overlay
 */
function CityCard({
  city,
}: {
  city: {
    slug: string;
    name: string;
    country_name: string;
    image_url: string;
    guide_count: number;
  };
}) {
  const imageSrc = getCityImageUrl(city.slug, city.image_url);

  return (
    <Link
      href={`/cities/${city.slug}`}
      className="group block relative aspect-video rounded-2xl overflow-hidden cursor-pointer"
    >
      {/* City Photo Background */}
      <div className="absolute inset-0">
        <Image
          src={imageSrc}
          alt={`${city.name}, ${city.country_name}`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-bold mb-1 group-hover:text-brand transition-colors">
          {city.name}
        </h3>
        <p className="text-sm text-white/80 mb-2">{city.country_name}</p>
        <p className="text-sm text-white/90">
          {city.guide_count} {city.guide_count === 1 ? "guide" : "guides"}{" "}
          available
        </p>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand/50 rounded-2xl transition-colors duration-300" />
    </Link>
  );
}

/**
 * SearchBar - UI-only search component (no logic yet)
 */
function SearchBar() {
  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-soft pointer-events-none" />
        <input
          type="text"
          placeholder="Search cities..."
          className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-ink placeholder:text-ink-soft"
          disabled
        />
      </div>
      <p className="text-xs text-ink-soft text-center mt-2">
        Search coming soon
      </p>
    </div>
  );
}

/**
 * CitiesPage - Server Component for cities listing
 */
export default async function CitiesPage() {
  // Fetch cities from data service
  const { data: cities, error, debug } = await getCitiesWithMeta();
  const showDebugText = process.env.NODE_ENV !== "production";
  const enableClientDebug = true;

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 space-y-3">
          <h2 className="text-2xl font-semibold text-red-700">
            Unable to load cities
          </h2>
          <p className="text-sm text-red-700">
            {error}
          </p>
          {showDebugText && (
            <p className="text-xs text-red-600">
              Supabase URL present: {debug?.hasUrl ? "yes" : "no"} | Anon key present: {debug?.hasAnonKey ? "yes" : "no"}
            </p>
          )}
        </div>
        {enableClientDebug && (
          <ClientDebug
            label="CitiesPageError"
            payload={{ error, debug }}
          />
        )}
      </div>
    );
  }

  // Empty state
  if (cities.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          title="No cities yet"
          description="We're building our network of destinations. Check back soon!"
          icon="map"
          variant="default"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Section */}
      <header className="space-y-6 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-ink tracking-tight">
          Explore Cities
        </h1>
        <p className="text-lg text-ink-soft leading-relaxed">
          Discover trusted LGBTQ+ local guides in {cities.length} cities
          worldwide
        </p>
      </header>

      {/* Search Bar */}
      <SearchBar />

      {/* Cities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map((city) => {
          const image_url = getCityImageUrl(city.slug, city.image_url);
          return <CityCard key={city.id} city={{ ...city, image_url }} />;
        })}
      </div>
      {enableClientDebug && (
        <ClientDebug
          label="CitiesPageDebug"
          payload={{ rows: cities.length, debug }}
        />
      )}
    </div>
  );
}

/**
 * Loading Component - Shown during data fetching
 */
export function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Skeleton */}
      <header className="space-y-6 text-center max-w-3xl mx-auto">
        <div className="h-12 w-2/3 bg-slate-200 rounded-lg animate-pulse mx-auto" />
        <div className="h-6 w-4/5 bg-slate-200 rounded animate-pulse mx-auto" />
      </header>

      {/* Search Bar Skeleton */}
      <div className="max-w-2xl mx-auto">
        <div className="h-12 w-full bg-slate-200 rounded-full animate-pulse" />
      </div>

      {/* Cities Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-video rounded-2xl bg-slate-200 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
