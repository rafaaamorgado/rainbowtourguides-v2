import Link from 'next/link';
import { format, startOfDay } from 'date-fns';
import {
  Activity,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  AlertCircle,
  Users,
  XCircle,
} from 'lucide-react';
import { requireRole } from '@/lib/auth-helpers';
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge';
import { CancelBookingModal } from '@/components/booking/CancelBookingModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { GuideStatus } from '@/types/database';

type GuideDashboardBooking = {
  id: string;
  status: string;
  start_at: string;
  duration_hours: number | null;
  price_total: string;
  currency: string | null;
  traveler?: {
    full_name?: string | null;
  } | null;
  city?: {
    name?: string | null;
  } | null;
};

const CANCELLABLE_STATUSES = new Set([
  'pending',
  'approved_pending_payment',
  'accepted',
  'awaiting_payment',
  'confirmed',
]);

function isCancellable(status: string): boolean {
  return CANCELLABLE_STATUSES.has(status);
}

function EmptyTabState() {
  return (
    <div className="rounded-lg border bg-muted/20 py-12 text-center text-sm text-muted-foreground">
      No bookings in this tab yet.
    </div>
  );
}

export default async function GuideDashboardPage() {
  const { supabase, user, profile } = await requireRole('guide');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data: guide } = await db
    .from('guides')
    .select('status, admin_notes')
    .eq('id', user.id)
    .single();

  const { data: bookingRows } = await db
    .from('bookings')
    .select(
      `
      id,
      status,
      start_at,
      duration_hours,
      price_total,
      currency,
      traveler:profiles!bookings_traveler_id_fkey(full_name),
      city:cities!bookings_city_id_fkey(name)
    `,
    )
    .eq('guide_id', user.id)
    .order('start_at', { ascending: true });

  const bookings = (bookingRows || []) as GuideDashboardBooking[];
  const today = startOfDay(new Date());
  const upcomingBookings = bookings.filter(
    (booking) => new Date(booking.start_at) >= today,
  );
  const pastBookings = bookings.filter((booking) => new Date(booking.start_at) < today);

  const guideStatus: GuideStatus = guide?.status ?? 'draft';
  const adminNotes: string | null = guide?.admin_notes ?? null;
  const firstName = profile.full_name?.split(' ')[0] ?? 'Guide';

  const renderBookingCards = (list: GuideDashboardBooking[]) => {
    if (list.length === 0) {
      return <EmptyTabState />;
    }

    return (
      <div className="grid gap-4">
        {list.map((booking) => {
          const startsAt = new Date(booking.start_at);
          const allowCancel =
            startsAt.getTime() > Date.now() && isCancellable(booking.status);

          return (
            <Card key={booking.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {booking.traveler?.full_name || 'Traveler'} in{' '}
                    {booking.city?.name || 'Unknown City'}
                  </CardTitle>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <CalendarClock className="h-4 w-4" />
                    {format(startsAt, 'PPP p')} • {booking.duration_hours || 4}h
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {booking.city?.name || 'Unknown City'}
                  </div>
                </div>
                <BookingStatusBadge status={booking.status} />
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">
                  Total:{' '}
                  <span className="font-semibold">
                    {booking.price_total} {booking.currency || 'USD'}
                  </span>
                </p>
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button asChild size="sm" variant="bordered">
                    <Link href={`/guide/bookings/${booking.id}`}>View Details</Link>
                  </Button>
                  {allowCancel && (
                    <CancelBookingModal
                      bookingId={booking.id}
                      bookingStartAt={booking.start_at}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
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
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">Total bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold">+0</div>
            <p className="text-xs text-muted-foreground">+0% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Tour</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-display font-bold">
              {upcomingBookings.length > 0 ? format(new Date(upcomingBookings[0].start_at), 'MMM d') : '--'}
            </div>
            <p className="text-xs text-muted-foreground">
              {upcomingBookings.length > 0 ? 'Upcoming booking scheduled' : 'No upcoming tours'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bookings Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">
                {`Upcoming (${upcomingBookings.length})`}
              </TabsTrigger>
              <TabsTrigger value="past">{`Past (${pastBookings.length})`}</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="pt-4">
              {renderBookingCards(upcomingBookings)}
            </TabsContent>
            <TabsContent value="past" className="pt-4">
              {renderBookingCards(pastBookings)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
