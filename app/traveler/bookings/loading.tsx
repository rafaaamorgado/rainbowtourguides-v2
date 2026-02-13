import { ListSkeleton } from "@/components/ui/loading-skeleton";

export default function BookingsLoading() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header Skeleton */}
        <div className="animate-pulse space-y-2 mb-8">
          <div className="h-10 w-48 bg-surface-warm rounded-2xl" />
          <div className="h-5 w-80 bg-surface-warm rounded-2xl" />
        </div>

        {/* Bookings List Skeleton */}
        <ListSkeleton count={5} />
      </div>
    </div>
  );
}
