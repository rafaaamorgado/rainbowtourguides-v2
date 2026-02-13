import { requireRole } from '@/lib/auth-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Activity,
  CreditCard,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { GuideStatus } from '@/types/database';

/**
 * Guide Dashboard — shows a status banner for non-approved guides
 * and basic stat cards.
 */
export default async function GuideDashboardPage() {
  const { supabase, user, profile } = await requireRole('guide');

  // Fetch guide record for status
  const { data: guide } = await (supabase as any)
    .from('guides')
    .select('status, admin_notes')
    .eq('id', user.id)
    .single();

  const guideStatus: GuideStatus = guide?.status ?? 'draft';
  const adminNotes: string | null = guide?.admin_notes ?? null;
  const firstName = profile.full_name?.split(' ')[0] ?? 'Guide';

  return (
    <div className="space-y-8">
      {/* Status banners */}
      {guideStatus === 'pending' && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <div>
            <h3 className="font-display font-semibold text-amber-900">
              Your application is being reviewed
            </h3>
            <p className="mt-1 text-sm text-amber-800">
              Our team is verifying your documents. This usually takes 1–2
              business days. We&apos;ll email you once a decision is made.
            </p>
          </div>
        </div>
      )}

      {guideStatus === 'draft' && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div>
            <h3 className="font-display font-semibold text-blue-900">
              Complete your application
            </h3>
            <p className="mt-1 text-sm text-blue-800">
              You haven&apos;t submitted your guide application yet.{' '}
              <Link
                href="/guide/onboarding"
                className="font-medium underline hover:text-blue-900"
              >
                Continue onboarding
              </Link>{' '}
              to get verified and start receiving bookings.
            </p>
          </div>
        </div>
      )}

      {guideStatus === 'rejected' && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
          <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
          <div>
            <h3 className="font-display font-semibold text-red-900">
              Application needs changes
            </h3>
            <p className="mt-1 text-sm text-red-800">
              {adminNotes ||
                'Your application was not approved. Please update your profile and resubmit.'}{' '}
              <Link
                href="/guide/onboarding"
                className="font-medium underline hover:text-red-900"
              >
                Edit & resubmit
              </Link>
            </p>
          </div>
        </div>
      )}

      {guideStatus === 'approved' && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />
          <div>
            <h3 className="font-display font-semibold text-emerald-900">
              Welcome, {firstName}! You&apos;re verified.
            </h3>
            <p className="mt-1 text-sm text-emerald-800">
              Your profile is live and travelers can book you.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your performance and upcoming activities.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold">+0</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold">+0</div>
            <p className="text-xs text-muted-foreground">
              +0% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Tour</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold">--</div>
            <p className="text-xs text-muted-foreground">
              No upcoming tours
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Booking Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center text-muted-foreground text-sm">
              No recent requests.
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {guideStatus === 'approved'
                      ? 'No upcoming tours'
                      : 'Complete your profile'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {guideStatus === 'approved'
                      ? 'New bookings will appear here.'
                      : 'Finish onboarding to get verified.'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
