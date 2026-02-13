import { ProfileSkeleton } from "@/components/ui/loading-skeleton";

export default function GuidesLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Skeleton */}
      <section className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 w-64 bg-white/20 rounded-2xl mx-auto" />
            <div className="h-6 w-96 bg-white/20 rounded-2xl mx-auto" />
          </div>
        </div>
      </section>

      {/* Guides Grid Skeleton */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ProfileSkeleton />
          <ProfileSkeleton />
          <ProfileSkeleton />
          <ProfileSkeleton />
          <ProfileSkeleton />
          <ProfileSkeleton />
        </div>
      </section>
    </div>
  );
}
