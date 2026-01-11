import { ListSkeleton } from "@/components/ui/loading-skeleton";

export default function BookingsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header Skeleton */}
        <div className="animate-pulse space-y-2 mb-8">
          <div className="h-10 w-48 bg-slate-200 rounded-lg" />
          <div className="h-5 w-80 bg-slate-200 rounded" />
        </div>

        {/* Bookings List Skeleton */}
        <ListSkeleton count={5} />
      </div>
    </div>
  );
}
