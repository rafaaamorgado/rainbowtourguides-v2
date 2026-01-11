import { CardSkeleton } from "@/components/ui/loading-skeleton";

export default function CitiesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero Skeleton */}
      <section className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-64 bg-white/20 rounded-xl mx-auto" />
            <div className="h-6 w-96 bg-white/20 rounded-lg mx-auto" />
          </div>
        </div>
      </section>

      {/* Cities Grid Skeleton */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </section>
    </div>
  );
}
