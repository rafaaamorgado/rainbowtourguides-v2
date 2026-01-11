export default function GuideProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Hero Skeleton */}
      <section className="bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-6">
              <div className="h-32 w-32 bg-white/20 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-10 w-64 bg-white/20 rounded-xl" />
                <div className="h-6 w-48 bg-white/20 rounded-lg" />
                <div className="flex gap-2">
                  <div className="h-8 w-24 bg-white/20 rounded-full" />
                  <div className="h-8 w-24 bg-white/20 rounded-full" />
                  <div className="h-8 w-24 bg-white/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Skeleton */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-slate-200 rounded-lg" />
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-full bg-slate-200 rounded" />
              <div className="h-4 w-3/4 bg-slate-200 rounded" />
            </div>

            <div className="animate-pulse space-y-4">
              <div className="h-8 w-40 bg-slate-200 rounded-lg" />
              <div className="flex gap-2 flex-wrap">
                <div className="h-8 w-24 bg-slate-200 rounded-full" />
                <div className="h-8 w-28 bg-slate-200 rounded-full" />
                <div className="h-8 w-20 bg-slate-200 rounded-full" />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="animate-pulse bg-white rounded-2xl border p-6 space-y-4">
              <div className="h-6 w-32 bg-slate-200 rounded" />
              <div className="h-8 w-full bg-slate-200 rounded-lg" />
              <div className="h-12 w-full bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
