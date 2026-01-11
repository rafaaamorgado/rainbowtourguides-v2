import { Calendar, MapPin, MessageSquare, TrendingUp } from "lucide-react";

export default function TravelerDashboard() {
  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-ink-soft">
        <span className="text-ink font-medium">Dashboard</span>
      </nav>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink mb-2">
          Welcome back!
        </h1>
        <p className="text-ink-soft">
          Here's what's happening with your travels
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Upcoming Tours",
            value: "2",
            icon: Calendar,
            color: "bg-blue-500",
          },
          {
            label: "Cities Visited",
            value: "5",
            icon: MapPin,
            color: "bg-emerald-500",
          },
          {
            label: "Unread Messages",
            value: "3",
            icon: MessageSquare,
            color: "bg-brand",
          },
          {
            label: "Guides Met",
            value: "8",
            icon: TrendingUp,
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
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    stat.color
                  )}
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
        <h2 className="text-xl font-semibold text-ink mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/cities"
            className="p-4 border border-slate-200 rounded-xl hover:border-brand hover:bg-brand/5 transition-all group"
          >
            <MapPin className="h-6 w-6 text-brand mb-2" />
            <p className="font-medium text-ink group-hover:text-brand">
              Browse Cities
            </p>
            <p className="text-sm text-ink-soft mt-1">
              Discover new destinations
            </p>
          </a>

          <a
            href="/traveler/bookings"
            className="p-4 border border-slate-200 rounded-xl hover:border-brand hover:bg-brand/5 transition-all group"
          >
            <Calendar className="h-6 w-6 text-brand mb-2" />
            <p className="font-medium text-ink group-hover:text-brand">
              My Bookings
            </p>
            <p className="text-sm text-ink-soft mt-1">
              View your tours
            </p>
          </a>

          <a
            href="/traveler/messages"
            className="p-4 border border-slate-200 rounded-xl hover:border-brand hover:bg-brand/5 transition-all group"
          >
            <MessageSquare className="h-6 w-6 text-brand mb-2" />
            <p className="font-medium text-ink group-hover:text-brand">
              Messages
            </p>
            <p className="text-sm text-ink-soft mt-1">
              Chat with your guides
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
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-ink font-medium">
                Tour confirmed in Barcelona
              </p>
              <p className="text-sm text-ink-soft mt-1">
                Your tour with Marco Silva has been confirmed for Feb 15
              </p>
              <p className="text-xs text-ink-soft mt-2">2 days ago</p>
            </div>
          </div>

          <div className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-ink font-medium">New message from João</p>
              <p className="text-sm text-ink-soft mt-1">
                João sent you details about your Lisbon tour
              </p>
              <p className="text-xs text-ink-soft mt-2">5 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

