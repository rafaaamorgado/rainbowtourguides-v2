"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { GuideCard } from "@/components/cards/GuideCard";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Guide } from "@/lib/mock-data";

interface GuidesSectionProps {
  guides: Guide[];
  cityName: string;
}

type SortOption = "recommended" | "price_low" | "price_high" | "rating";

export function GuidesSection({ guides, cityName }: GuidesSectionProps) {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState("all");
  const [duration, setDuration] = useState("any");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");

  // Filter and sort guides
  const filteredGuides = useMemo(() => {
    let result = [...guides];

    // Search filter
    if (query.trim()) {
      const searchLower = query.toLowerCase();
      result = result.filter(
        (guide) =>
          guide.name.toLowerCase().includes(searchLower) ||
          guide.tagline.toLowerCase().includes(searchLower) ||
          guide.experience_tags.some((tag) =>
            tag.toLowerCase().includes(searchLower)
          )
      );
    }

    // Theme filter
    if (theme !== "all") {
      result = result.filter((guide) =>
        guide.experience_tags.some(
          (tag) => tag.toLowerCase() === theme.toLowerCase()
        )
      );
    }

    // Duration filter (based on available prices)
    if (duration !== "any") {
      const durationMap: { [key: string]: keyof Pick<Guide, "price_4h" | "price_6h" | "price_8h"> } = {
        "4": "price_4h",
        "6": "price_6h",
        "8": "price_8h",
      };
      const priceKey = durationMap[duration];
      if (priceKey) {
        result = result.filter((guide) => guide[priceKey] > 0);
      }
    }

    // Sort
    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => a.price_4h - b.price_4h);
        break;
      case "price_high":
        result.sort((a, b) => b.price_4h - a.price_4h);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "recommended":
      default:
        // Default sort: verified first, then by rating
        result.sort((a, b) => {
          if (a.verified !== b.verified) return a.verified ? -1 : 1;
          return b.rating - a.rating;
        });
    }

    return result;
  }, [guides, query, theme, duration, sortBy]);

  const clearFilters = () => {
    setQuery("");
    setTheme("all");
    setDuration("any");
    setSortBy("recommended");
  };

  const hasActiveFilters = query || theme !== "all" || duration !== "any" || sortBy !== "recommended";

  return (
    <section className="space-y-8">
      {/* Filter Bar */}
      <div className="sticky top-20 z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-md">
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft pointer-events-none" />
            <Input
              type="text"
              placeholder="Search guides by name, specialty..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Theme Filter */}
            <div>
              <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-2 block">
                Theme
              </label>
              <Select
                value={theme}
                onValueChange={setTheme}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Themes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Themes</SelectItem>
                  <SelectItem value="nightlife">Nightlife</SelectItem>
                  <SelectItem value="daytime culture">Daytime Culture</SelectItem>
                  <SelectItem value="food & drink">Food & Drink</SelectItem>
                  <SelectItem value="queer history">Queer History</SelectItem>
                  <SelectItem value="art scene">Art Scene</SelectItem>
                  <SelectItem value="hidden gems">Hidden Gems</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-2 block">
                Duration
              </label>
              <Select
                value={duration}
                onValueChange={setDuration}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Duration</SelectItem>
                  <SelectItem value="4">4 Hours</SelectItem>
                  <SelectItem value="6">6 Hours</SelectItem>
                  <SelectItem value="8">8 Hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-2 block">
                Sort By
              </label>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as SortOption)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Recommended" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-ink-soft">
          <span className="font-semibold text-ink">{filteredGuides.length}</span>{" "}
          {filteredGuides.length === 1 ? "guide" : "guides"} in {cityName}
        </p>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-brand hover:text-brand-dark transition-colors"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Guides Grid or Empty State */}
      {filteredGuides.length === 0 ? (
        <EmptyState
          title="No guides match your filters"
          description="Try adjusting your search criteria or clearing some filters to see more results."
          icon="search"
          variant="card"
          actionLabel="Clear filters"
          actionHref="#"
          secondaryActionLabel="Browse all cities"
          secondaryActionHref="/cities"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      )}
    </section>
  );
}

