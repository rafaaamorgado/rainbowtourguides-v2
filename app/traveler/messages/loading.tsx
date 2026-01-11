export default function MessagesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header Skeleton */}
        <div className="animate-pulse space-y-2 mb-8">
          <div className="h-10 w-48 bg-slate-200 rounded-lg" />
          <div className="h-5 w-80 bg-slate-200 rounded" />
        </div>

        {/* Messages Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List Skeleton */}
          <div className="lg:col-span-1 space-y-4">
            <div className="animate-pulse">
              <div className="h-6 w-40 bg-slate-200 rounded mb-4" />
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border p-4">
                <div className="animate-pulse flex items-center gap-3">
                  <div className="h-12 w-12 bg-slate-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Messages Skeleton */}
          <div className="lg:col-span-2 bg-white rounded-xl border p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-slate-200 rounded-lg" />
              <div className="space-y-3 pt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-10 w-10 bg-slate-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-16 bg-slate-200 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
