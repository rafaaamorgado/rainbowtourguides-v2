import type { Metadata } from 'next';
import { getCitiesWithMeta } from '@/lib/data-service';
import { EmptyState } from '@/components/ui/empty-state';
import { ClientDebug } from '@/components/dev-debug';
import { CitiesContent } from '@/app/cities/cities-content';

export const metadata: Metadata = {
  title: 'Explore Cities - Rainbow Tour Guides',
  description:
    'Discover trusted LGBTQ+ local guides in cities worldwide. Safe, authentic travel experiences in curated destinations.',
  openGraph: {
    title: 'Explore Cities - Rainbow Tour Guides',
    description: 'Discover trusted LGBTQ+ local guides in cities worldwide.',
    type: 'website',
  },
};

// Supabase usage requires dynamic rendering so cookies/env are available at runtime
export const dynamic = 'force-dynamic';

/**
 * CitiesPage - Server Component for cities listing
 */
export default async function CitiesPage() {
  // Fetch cities from data service
  const { data: cities, error, debug } = await getCitiesWithMeta();
  const showDebugText = process.env.NODE_ENV !== 'production';
  const enableClientDebug = process.env.NODE_ENV !== 'production';

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 space-y-3">
          <h2 className="text-2xl font-semibold text-red-700">
            Unable to load cities
          </h2>
          <p className="text-sm text-red-700">{error}</p>
          {showDebugText && (
            <p className="text-xs text-red-600">
              Supabase URL present: {debug?.hasUrl ? 'yes' : 'no'} | Anon key
              present: {debug?.hasAnonKey ? 'yes' : 'no'}
            </p>
          )}
        </div>
        {enableClientDebug && (
          <ClientDebug label="CitiesPageError" payload={{ error, debug }} />
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
          variant="solid"
        />
      </div>
    );
  }

  return (
    <>
      <CitiesContent cities={cities} />
      {enableClientDebug && (
        <ClientDebug
          label="CitiesPageDebug"
          payload={{ rows: cities.length, debug }}
        />
      )}
    </>
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
        <div className="h-12 w-2/3 bg-surface-warm rounded-2xl animate-pulse mx-auto" />
        <div className="h-6 w-4/5 bg-surface-warm rounded-2xl animate-pulse mx-auto" />
      </header>

      {/* Search Bar Skeleton */}
      <div className="max-w-2xl mx-auto">
        <div className="h-12 w-full bg-surface-warm rounded-full animate-pulse" />
      </div>

      {/* Cities Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="aspect-video rounded-2xl bg-surface-warm animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
