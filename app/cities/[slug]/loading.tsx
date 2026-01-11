import { ProfileSkeleton } from "@/components/ui/loading-skeleton";

export default function CityDetailLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero Skeleton */}
      <section className="relative aspect-[21/9] w-full overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto w-full px-6 pb-12 space-y-4">
            <div className="animate-pulse space-y-3">
              <div className="h-8 w-48 bg-white/20 rounded-lg" />
              <div className="h-12 w-64 bg-white/20 rounded-xl" />
              <div className="h-6 w-40 bg-white/20 rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* About Section Skeleton */}
        <section className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-slate-200 rounded-lg" />
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
          </div>
        </section>

        {/* Guides Section Skeleton */}
        <section className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded-lg mb-6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProfileSkeleton />
            <ProfileSkeleton />
            <ProfileSkeleton />
          </div>
        </section>
      </div>
    </div>
  );
}
