import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CheckCircle2, Receipt, AlertTriangle } from 'lucide-react';
import { requireRole } from '@/lib/auth-helpers';
import { verifyCheckoutSession } from '@/lib/checkout-verification';
import { resolveGuideTimezone } from '@/lib/guide-timezone';
import { BookingDetailsCard } from '@/components/booking/BookingDetailsCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string; session?: string; booking_id?: string }>;
};

type SuccessBookingRow = {
  id: string;
  traveler_id: string;
  price_total: string;
  currency: string | null;
  start_at: string;
  city?: {
    name?: string | null;
  } | null;
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default async function BookingSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { supabase, user } = await requireRole('traveler');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const params = await searchParams;
  const sessionId = params.session_id || params.session;

  if (!sessionId) {
    redirect('/traveler/bookings');
  }

  const verification = await verifyCheckoutSession(sessionId);
  if (!verification.ok) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Payment Verification Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We could not verify this payment session. If your card was
              charged, contact support.
            </p>
            <Button asChild>
              <Link href="/traveler/bookings">Back to My Bookings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bookingId = params.booking_id || verification.bookingId;

  const { data: bookingData } = await db
    .from('bookings')
    .select(
      `
      id,
      traveler_id,
      price_total,
      currency,
      start_at,
      city:cities!bookings_city_id_fkey(name)
    `,
    )
    .eq('id', bookingId)
    .eq('traveler_id', user.id)
    .single();

  const booking = bookingData as SuccessBookingRow | null;

  if (!booking) {
    redirect('/traveler/bookings');
  }

  const totalPaid =
    verification.amountTotal > 0
      ? verification.amountTotal
      : parseFloat(booking.price_total || '0');
  const receiptCurrency = verification.currency || booking.currency || 'USD';
  const guideTimezone = resolveGuideTimezone(booking.city?.name || null);

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-10">
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-6 w-6" />
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">Booking ID</p>
            <p className="font-mono text-sm">{booking.id}</p>
          </div>

          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-xl font-semibold">
              {formatCurrency(totalPaid, receiptCurrency)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/traveler/bookings/${booking.id}`}>
                <Receipt className="mr-2 h-4 w-4" />
                View Booking Details
              </Link>
            </Button>
            <Button asChild variant="bordered">
              <Link href="/traveler/bookings">Back to My Bookings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <BookingDetailsCard
        bookingDateUtc={booking.start_at}
        guideTimezone={guideTimezone}
      />
    </div>
  );
}
