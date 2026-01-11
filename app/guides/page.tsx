import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getCities, getGuides } from "@/lib/data-service";
import { GuidesSearchBar } from "@/components/guides/search-bar";
import { GuideCard } from "@/components/cards/guide-card";
import { FilteredView } from "./filtered-view";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Find LGBTQ+ Tour Guides - Rainbow Tour Guides",
  description:
    "Browse verified LGBTQ+ friendly local guides worldwide. Safe, inclusive, authentic travel experiences with expert locals.",
  openGraph: {
    title: "Find LGBTQ+ Tour Guides - Rainbow Tour Guides",
    description:
      "Browse verified LGBTQ+ friendly local guides worldwide.",
    type: "website",
  },
};

export default async function GuidesPage() {
  // Fetch all guides and cities
  const [allGuides, cities] = await Promise.all([
    getGuides(),
    getCities(),
  ]);

  // Sort guides by rating for top-rated section
  const topRatedGuides = [...allGuides]
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.review_count - a.review_count;
    })
    .slice(0, 6);

  // Get newest guides (mock: use reverse order as "newest")
  const newGuides = [...allGuides].reverse().slice(0, 6);

  // Get all unique experience tags
  const allTags = Array.from(
    new Set(allGuides.flatMap((g) => g.experience_tags))
  ).sort();

  // Cities with low guide count (new destinations)
  const newDestinations = cities
    .filter((city) => city.guide_count <= 2 && city.guide_count > 0)
    .slice(0, 3);

  // Popular destinations (high guide count)
  const popularDestinations = [...cities]
    .sort((a, b) => b.guide_count - a.guide_count)
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-ink tracking-tight">
              Find Your Guide
            </h1>
            <p className="text-lg text-ink-soft leading-relaxed">
              Verified LGBTQ+ friendly locals. Safe, inclusive, authentic.
            </p>
          </div>

          {/* Search Bar */}
          <GuidesSearchBar cities={cities} />
        </div>
      </section>

      {/* Main Content - Curated Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Client-side Filtering */}
        <FilteredView allGuides={allGuides} allTags={allTags} />

        {/* Top-Rated Guides */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-ink mb-2">
              Top-Rated Guides
            </h2>
            <p className="text-ink-soft">
              Our most loved guides with excellent reviews
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topRatedGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </section>

        {/* New Guides */}
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-ink mb-2">New Guides</h2>
            <p className="text-ink-soft">
              Welcome our newest community members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </section>

        {/* New Destinations */}
        {newDestinations.length > 0 && (
          <section className="space-y-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-ink mb-2">
                New Destinations
              </h2>
              <p className="text-ink-soft">
                Explore cities where we've just launched
              </p>
            </div>

            <div className="space-y-8">
              {newDestinations.map((city) => {
                const cityGuides = allGuides.filter(
                  (g) => g.city_id === city.id
                );

                return (
                  <div key={city.id} className="space-y-4">
                    {/* City Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                          <Image
                            src={city.image_url}
                            alt={city.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-ink">
                            {city.name}
                          </h3>
                          <p className="text-sm text-ink-soft">
                            {city.guide_count}{" "}
                            {city.guide_count === 1 ? "guide" : "guides"}{" "}
                            available
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm">
                        <Link
                          href={`/cities/${city.slug}`}
                          className="flex items-center gap-1"
                        >
                          View City
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>

                    {/* City Guides */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {cityGuides.slice(0, 3).map((guide) => (
                        <GuideCard key={guide.id} guide={guide} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Popular Destinations */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-ink mb-2">
              Popular Destinations
            </h2>
            <p className="text-ink-soft">
              Cities with the most verified guides
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularDestinations.map((city) => (
              <Link
                key={city.id}
                href={`/cities/${city.slug}`}
                className="group block relative aspect-[4/3] rounded-2xl overflow-hidden"
              >
                {/* City Photo */}
                <div className="absolute inset-0">
                  <Image
                    src={city.image_url}
                    alt={city.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-lg font-bold mb-1 group-hover:text-brand transition-colors">
                    {city.name}
                  </h3>
                  <p className="text-sm text-white/80">{city.country_name}</p>
                  <p className="text-xs text-white/70 mt-1">
                    {city.guide_count} guides
                  </p>
                </div>

                {/* Hover Border */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand/50 rounded-2xl transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

