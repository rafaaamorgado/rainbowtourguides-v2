'use client';

import { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GuideCard } from '@/components/cards/GuideCard';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { CityComingSoon } from '@/components/city/city-coming-soon';
import type { Guide, City } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

interface FilteredViewProps {
  allGuides: Guide[];
  allTags: string[];
  cities?: City[];
}

export function FilteredView({ allGuides, allTags, cities = [] }: FilteredViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get('q') || '';
  const cityFilter = searchParams.get('city') || '';
  const interestFilter = searchParams.get('interest') || '';
  const durationFilter = searchParams.get('duration') || '';

  // Filter guides based on query params
  const filteredGuides = useMemo(() => {
    let result = [...allGuides];

    // Text search
    if (query) {
      const searchLower = query.toLowerCase();
      result = result.filter(
        (guide) =>
          guide.name.toLowerCase().includes(searchLower) ||
          guide.city_name.toLowerCase().includes(searchLower) ||
          guide.bio.toLowerCase().includes(searchLower) ||
          guide.tagline.toLowerCase().includes(searchLower) ||
          guide.experience_tags.some((tag) =>
            tag.toLowerCase().includes(searchLower),
          ),
      );
    }

    // City filter - match by name (search now sends city names, not slugs)
    if (cityFilter) {
      const filterLower = cityFilter.toLowerCase();
      result = result.filter((guide) => {
        const guideCityName = guide.city_name.toLowerCase();
        const guideCitySlug = guideCityName.replace(/\s+/g, '-');
        return (
          guideCityName.includes(filterLower) ||
          guideCitySlug.includes(filterLower)
        );
      });
    }

    // Interest filter
    if (interestFilter) {
      result = result.filter((guide) =>
        guide.experience_tags.some(
          (tag) => tag.toLowerCase() === interestFilter.toLowerCase(),
        ),
      );
    }

    // Duration filter
    if (durationFilter) {
      const durationMap: {
        [key: string]: keyof Pick<Guide, 'price_4h' | 'price_6h' | 'price_8h'>;
      } = {
        '4': 'price_4h',
        '6': 'price_6h',
        '8': 'price_8h',
      };
      const priceKey = durationMap[durationFilter];
      if (priceKey) {
        result = result.filter((guide) => guide[priceKey] > 0);
      }
    }

    return result;
  }, [allGuides, query, cityFilter, interestFilter, durationFilter]);

  const hasFilters = query || cityFilter || interestFilter || durationFilter;

  const handleInterestClick = (interest: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (interestFilter === interest) {
      params.delete('interest');
    } else {
      params.set('interest', interest);
    }
    router.push(`/guides?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push('/guides');
  };

  return (
    <>
      {/* Browse by Interest */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-ink mb-2">
            Browse by Interest
          </h2>
          <p className="text-ink-soft">
            Find guides who specialize in what you love
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {allTags.map((tag) => (
            <Chip
              key={tag}
              onClick={() => handleInterestClick(tag)}
              variant={interestFilter === tag ? 'solid' : 'bordered'}
              color={interestFilter === tag ? 'primary' : 'default'}
              size="md"
              className={cn(
                'cursor-pointer transition-all',
                interestFilter === tag
                  ? 'bg-brand text-white shadow-md'
                  : 'bg-white border-slate-200 text-ink-soft hover:border-brand hover:text-brand',
              )}
            >
              {tag}
            </Chip>
          ))}
        </div>
      </section>

      {/* Filtered Results or Message */}
      {hasFilters && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-ink mb-1">
                Search Results
              </h2>
              <p className="text-ink-soft">
                {filteredGuides.length}{' '}
                {filteredGuides.length === 1 ? 'guide' : 'guides'} found
              </p>
            </div>
            <Button onClick={clearFilters} variant="bordered">
              Clear Filters
            </Button>
          </div>

          {filteredGuides.length === 0 && cityFilter ? (
            <CityComingSoon cityName={cityFilter} cities={cities} />
          ) : filteredGuides.length === 0 ? (
            <EmptyState
              title="No guides match your filters"
              description="Try adjusting your search criteria or clearing filters to see more results."
              icon="search"
              actionLabel="Clear Filters"
              actionHref="/guides"
              secondaryActionLabel="Browse All Cities"
              secondaryActionHref="/cities"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGuides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
