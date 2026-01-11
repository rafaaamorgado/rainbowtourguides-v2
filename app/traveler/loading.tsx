import { DashboardSkeleton, ListSkeleton } from "@/components/ui/loading-skeleton";

export default function TravelerDashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Skeleton */}
        <div className="animate-pulse space-y-2 mb-8">
          <div className="h-10 w-64 bg-slate-200 rounded-lg" />
          <div className="h-5 w-96 bg-slate-200 rounded" />
        </div>

        {/* Stats Grid Skeleton */}
        <DashboardSkeleton count={3} className="mb-12" />

        {/* Content Sections Skeleton */}
        <div className="space-y-8">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-slate-200 rounded-lg mb-4" />
          </div>
          <ListSkeleton count={3} />
        </div>
      </div>
    </div>
  );
}
