'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { GuideCard } from './guide-card';
import { EmptyState } from '@/components/ui/empty-state';
import type { Guide } from '@/lib/mock-data';
import Link from 'next/link';

interface CityFiltersProps {
  guides: Guide[];
  cityName: string;
  country?: string;
  fetchError?: string;
}

export function CityFilters({
  guides,
  cityName,
  country,
  fetchError,
}: CityFiltersProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [theme, setTheme] = useState('all');
  const [duration, setDuration] = useState('any');

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 200);
    return () => clearTimeout(id);
  }, [query]);

  const themeOptions = useMemo(() => {
    const tags = new Set<string>();
    guides.forEach((g) => {
      (g.experience_tags || []).forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [guides]);

  const filtered = useMemo(() => {
    return guides.filter((guide) => {
      const matchesQuery =
        !debouncedQuery ||
        guide.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        (guide.tagline || '')
          .toLowerCase()
          .includes(debouncedQuery.toLowerCase()) ||
        (guide.experience_tags || []).some((tag) =>
          tag.toLowerCase().includes(debouncedQuery.toLowerCase()),
        );

      const matchesTheme =
        theme === 'all' ||
        (guide.experience_tags || []).some(
          (tag) => tag.toLowerCase() === theme.toLowerCase(),
        );

      const matchesDuration =
        duration === 'any' ||
        (duration === '4' && (guide.price_4h || 0) > 0) ||
        (duration === '6' && (guide.price_6h || 0) > 0) ||
        (duration === '8' && (guide.price_8h || 0) > 0);

      return matchesQuery && matchesTheme && matchesDuration;
    });
  }, [guides, debouncedQuery, theme, duration]);

  const hasActiveFilters =
    debouncedQuery.length > 0 || theme !== 'all' || duration !== 'any';

  return (
    <section className="space-y-8">
      {/* Filter bar */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-md p-4 sm:p-6 space-y-4">
        {fetchError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            We had trouble reaching our guides database. Showing any cached or
            fallback data. ({fetchError})
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="col-span-1 lg:col-span-2">
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1 block">
              Search guides
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or interests..."
                className="pl-10 h-11 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1 block">
              Theme
            </label>
            <Select
              value={theme}
              onChange={setTheme}
              options={[
                { value: 'all', label: 'All themes' },
                ...themeOptions.map((tag) => ({
                  value: tag,
                  label: tag.replace(/-/g, ' '),
                })),
              ]}
              placeholder="All themes"
              className="h-11"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider mb-1 block">
              Duration
            </label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Any duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any duration</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-ink-soft mt-1">
              Uses available 4h/6h/8h pricing. Longer trips coming soon.
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('');
                setTheme('all');
                setDuration('any');
              }}
              className="text-brand hover:text-brand"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Guides grid */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-2xl font-bold text-ink">Available Guides</h2>
            <p className="text-sm text-ink-soft">
              {filtered.length} guide{filtered.length === 1 ? '' : 's'} in{' '}
              {cityName}
              {country ? `, ${country}` : ''}
            </p>
          </div>
        </div>

        {guides.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <EmptyState
              title={`No verified guides yet in ${cityName}`}
              description="We're onboarding locals now. Browse all guides or explore other cities."
              icon="users"
              variant="default"
            />
            <div className="mt-4 flex gap-3">
              <Button asChild>
                <Link href="/guides">View all guides</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/cities">Browse cities</Link>
              </Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
            <EmptyState
              title="No guides match your filters"
              description="Try clearing filters or exploring nearby cities."
              icon="users"
              variant="default"
            />
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery('');
                  setTheme('all');
                  setDuration('any');
                }}
              >
                Clear filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((guide) => (
              <GuideCard key={guide.slug || guide.id} guide={guide} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
