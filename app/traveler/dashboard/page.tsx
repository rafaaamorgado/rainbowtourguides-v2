import Link from 'next/link';
import { format, startOfDay } from 'date-fns';
import { CalendarClock, MapPin } from 'lucide-react';
import { Tab, Tabs } from '@heroui/react';
import { requireRole } from '@/lib/auth-helpers';
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge';
import { CancelBookingModal } from '@/components/booking/CancelBookingModal';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type TravelerDashboardBooking = {
  id: string;
  status: string;
  start_at: string;
  duration_hours: number | null;
  price_total: string;
  currency: string | null;
  guide?: {
    profile?: {
      full_name?: string | null;
    } | null;
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

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-muted/20 py-12 text-center">
      <p className="text-lg font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default async function TravelerDashboardPage() {
  const { supabase, user } = await requireRole('traveler');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

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
      guide:guides!bookings_guide_id_fkey(
        profile:profiles!guides_id_fkey(full_name)
      ),
      city:cities!bookings_city_id_fkey(name)
    `,
    )
    .eq('traveler_id', user.id)
    .order('start_at', { ascending: true });

  const bookings = (bookingRows || []) as TravelerDashboardBooking[];
  const today = startOfDay(new Date());
  const upcomingBookings = bookings.filter(
    (booking) => new Date(booking.start_at) >= today,
  );
  const pastBookings = bookings.filter(
    (booking) => new Date(booking.start_at) < today,
  );

  const renderBookingCards = (list: TravelerDashboardBooking[]) => {
    if (list.length === 0) {
      return (
        <EmptyState
          title="No bookings in this tab"
          description="When bookings match this timeline, they will appear here."
        />
      );
    }

    return (
      <div className="grid gap-6">
        {list.map((booking) => {
          const startsAt = new Date(booking.start_at);
          const allowCancel =
            startsAt.getTime() > Date.now() && isCancellable(booking.status);

          return (
            <Card key={booking.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {booking.guide?.profile?.full_name || 'Guide'} in{' '}
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
              <CardContent>
                <div className="text-sm">
                  Total:{' '}
                  <span className="font-semibold">
                    {booking.price_total} {booking.currency || 'USD'}
                  </span>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button asChild size="sm" variant="bordered">
                  <Link href={`/traveler/bookings/${booking.id}`}>View Details</Link>
                </Button>
                {allowCancel && (
                  <CancelBookingModal
                    bookingId={booking.id}
                    bookingStartAt={booking.start_at}
                  />
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container space-y-8 py-10">
      <div>
        <h1 className="font-display text-3xl font-bold">My Trips</h1>
        <p className="text-muted-foreground">
          Manage your booking requests and upcoming tours.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-lg border bg-muted/20 py-12 text-center">
          <p className="text-lg font-medium">No bookings yet</p>
          <Button asChild className="mt-4">
            <Link href="/">Find a Guide</Link>
          </Button>
        </div>
      ) : (
        <Tabs
          aria-label="Traveler booking timeline"
          variant="underlined"
          color="primary"
        >
          <Tab
            key="upcoming"
            title={`Upcoming (${upcomingBookings.length})`}
            className="pt-4"
          >
            {renderBookingCards(upcomingBookings)}
          </Tab>
          <Tab key="past" title={`Past (${pastBookings.length})`} className="pt-4">
            {renderBookingCards(pastBookings)}
          </Tab>
        </Tabs>
      )}
    </div>
  );
}
