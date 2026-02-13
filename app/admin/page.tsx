import { requireRole } from '@/lib/auth-helpers';
import {
  Users,
  ShieldCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

/**
 * Admin Dashboard — landing page at /admin.
 *
 * Fetches high-level stats from the database and displays them in a
 * card grid. The heavy analytics will be filled in later; for now
 * every card is live-wired to a real count where possible.
 */
export default async function AdminDashboardPage() {
  const { supabase, profile } = await requireRole('admin');

  // Fetch counts in parallel — all lightweight HEAD queries
  const [usersResult, guidesResult, pendingGuidesResult, bookingsResult] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('guides')
        .select('*', { count: 'exact', head: true }),
      supabase
        .from('guides')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true }),
    ]);

  const totalUsers = usersResult.count ?? 0;
  const totalGuides = guidesResult.count ?? 0;
  const pendingGuides = pendingGuidesResult.count ?? 0;
  const totalBookings = bookingsResult.count ?? 0;

  const firstName = profile.full_name?.split(' ')[0] ?? 'Admin';

  const stats = [
    {
      label: 'Total Users',
      value: totalUsers,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Guides',
      value: totalGuides,
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Pending Verification',
      value: pendingGuides,
      icon: AlertCircle,
      color: pendingGuides > 0 ? 'text-orange-600' : 'text-slate-400',
      bg: pendingGuides > 0 ? 'bg-orange-50' : 'bg-slate-50',
    },
    {
      label: 'Total Bookings',
      value: totalBookings,
      icon: Calendar,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-ink">
          Welcome back, {firstName}
        </h1>
        <p className="text-ink-soft mt-1">
          Here&apos;s what&apos;s happening across the platform.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-card p-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-soft">
                  {stat.label}
                </span>
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <p className="mt-3 text-3xl font-display font-bold text-ink">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Placeholder sections for future content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-ink-soft" />
            <h2 className="text-lg font-display font-semibold text-ink">Recent Activity</h2>
          </div>
          <p className="text-sm text-ink-soft">
            Activity feed coming soon — new bookings, guide sign-ups, and
            platform events will appear here.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-ink-soft" />
            <h2 className="text-lg font-display font-semibold text-ink">Revenue Overview</h2>
          </div>
          <p className="text-sm text-ink-soft">
            Revenue charts and payout summaries will be displayed here once
            payment processing is live.
          </p>
        </div>
      </div>
    </div>
  );
}
