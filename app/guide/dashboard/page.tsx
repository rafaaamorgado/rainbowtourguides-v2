import { Calendar, DollarSign, Star, TrendingUp } from "lucide-react";

export default function GuideDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink mb-2">Dashboard</h1>
        <p className="text-ink-soft">Welcome to your guide dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Pending Requests",
            value: "3",
            icon: Calendar,
            color: "bg-amber-500",
          },
          {
            label: "This Month's Tours",
            value: "12",
            icon: Calendar,
            color: "bg-emerald-500",
          },
          {
            label: "Total Earnings",
            value: "$2,450",
            icon: DollarSign,
            color: "bg-brand",
          },
          {
            label: "Average Rating",
            value: "4.8",
            icon: Star,
            color: "bg-purple-500",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-ink">{stat.value}</p>
                <p className="text-sm text-ink-soft mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-ink mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/guide/bookings"
            className="p-4 border border-slate-200 rounded-xl hover:border-brand hover:bg-brand/5 transition-all group"
          >
            <Calendar className="h-6 w-6 text-brand mb-2" />
            <p className="font-medium text-ink group-hover:text-brand">
              View Bookings
            </p>
            <p className="text-sm text-ink-soft mt-1">
              Manage your tour requests
            </p>
          </a>

          <a
            href="/guide/profile"
            className="p-4 border border-slate-200 rounded-xl hover:border-brand hover:bg-brand/5 transition-all group"
          >
            <Star className="h-6 w-6 text-brand mb-2" />
            <p className="font-medium text-ink group-hover:text-brand">
              Edit Profile
            </p>
            <p className="text-sm text-ink-soft mt-1">
              Update your guide profile
            </p>
          </a>

          <a
            href="/guide/payouts"
            className="p-4 border border-slate-200 rounded-xl hover:border-brand hover:bg-brand/5 transition-all group"
          >
            <DollarSign className="h-6 w-6 text-brand mb-2" />
            <p className="font-medium text-ink group-hover:text-brand">
              Payouts
            </p>
            <p className="text-sm text-ink-soft mt-1">
              View your earnings
            </p>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-ink mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-ink font-medium">New booking request</p>
              <p className="text-sm text-ink-soft mt-1">
                Sarah Chen requested a 4-hour tour for Feb 15
              </p>
              <p className="text-xs text-ink-soft mt-2">2 hours ago</p>
            </div>
          </div>

          <div className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Star className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-ink font-medium">New 5-star review</p>
              <p className="text-sm text-ink-soft mt-1">
                Michael Brown left you a great review
              </p>
              <p className="text-xs text-ink-soft mt-2">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
