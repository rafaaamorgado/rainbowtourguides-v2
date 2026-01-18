'use client';

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search } from "lucide-react";
import { getCityImageUrl } from "@/lib/city-images";

type City = {
  id: string;
  slug: string;
  name: string;
  country_name: string;
  image_url: string;
  guide_count: number;
};

/**
 * CityCard - Premium city card with cinematic photo and overlay
 */
function CityCard({ city }: { city: City }) {
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
 * SearchBar - Client-side search component with filtering
 */
function SearchBar({
  searchQuery,
  onSearchChange,
  resultCount,
  totalCount,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount: number;
  totalCount: number;
}) {
  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-soft pointer-events-none" />
        <input
          type="text"
          placeholder="Search cities..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-full border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all text-ink placeholder:text-ink-soft"
        />
      </div>
      {searchQuery && (
        <p className="text-xs text-ink-soft text-center mt-2">
          Found {resultCount} of {totalCount}{" "}
          {resultCount === 1 ? "city" : "cities"}
        </p>
      )}
    </div>
  );
}

/**
 * CitiesContent - Client component with search functionality
 */
export function CitiesContent({ cities }: { cities: City[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    if (!searchQuery.trim()) {
      return cities;
    }

    const query = searchQuery.toLowerCase().trim();
    return cities.filter(
      (city) =>
        city.name.toLowerCase().includes(query) ||
        city.country_name.toLowerCase().includes(query)
    );
  }, [cities, searchQuery]);

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
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        resultCount={filteredCities.length}
        totalCount={cities.length}
      />

      {/* Cities Grid */}
      {filteredCities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCities.map((city) => {
            const image_url = getCityImageUrl(city.slug, city.image_url);
            return <CityCard key={city.id} city={{ ...city, image_url }} />;
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-ink-soft">
            No cities found matching "{searchQuery}"
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-4 text-brand hover:text-brand-dark underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
