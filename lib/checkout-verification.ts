import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';
import { sendBookingPaidEmail } from '@/lib/email';
import { getBaseUrl } from '@/lib/url-helpers';
import type { Database } from '@/types/database';

type BookingRow = {
  id: string;
  status: string;
  traveler_id: string;
  guide_id: string;
  city_id: string;
  start_at: string;
  price_total: string;
  currency: string | null;
};

export type VerifyCheckoutSessionResult =
  | {
      ok: true;
      bookingId: string;
      amountTotal: number;
      currency: string;
      status: string;
    }
  | {
      ok: false;
      error: string;
    };

export async function verifyCheckoutSession(
  sessionId: string,
): Promise<VerifyCheckoutSessionResult> {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return { ok: false, error: 'Stripe is not configured' };
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return { ok: false, error: 'Payment not completed' };
    }

    const supabase = await createSupabaseServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Primary lookup by stored Stripe session ID.
    let bookingData: BookingRow | null = null;
    const { data: bookingBySession } = await db
      .from('bookings')
      .select(
        'id, status, traveler_id, guide_id, city_id, start_at, price_total, currency',
      )
      .eq('stripe_checkout_session_id', sessionId)
      .single();

    if (bookingBySession) {
      bookingData = bookingBySession as BookingRow;
    } else {
      // Fallback to metadata booking_id if session id was not persisted.
      const bookingIdFromMetadata = session.metadata?.booking_id;
      if (bookingIdFromMetadata) {
        const { data: bookingById } = await db
          .from('bookings')
          .select(
            'id, status, traveler_id, guide_id, city_id, start_at, price_total, currency',
          )
          .eq('id', bookingIdFromMetadata)
          .single();

        if (bookingById) {
          bookingData = bookingById as BookingRow;
        }
      }
    }

    if (!bookingData) {
      return { ok: false, error: 'Booking not found' };
    }

    const alreadyConfirmed =
      bookingData.status === 'confirmed' || bookingData.status === 'completed';

    const bookingUpdate: Database['public']['Tables']['bookings']['Update'] = {
      stripe_checkout_session_id: session.id,
      updated_at: new Date().toISOString(),
    };

    if (!alreadyConfirmed) {
      bookingUpdate.status = 'confirmed';
      bookingUpdate.confirmed_at = new Date().toISOString();
    }

    const { error: updateError } = await db
      .from('bookings')
      .update(bookingUpdate)
      .eq('id', bookingData.id);

    if (updateError) {
      return { ok: false, error: 'Failed to update booking status' };
    }

    if (!alreadyConfirmed) {
      try {
        const [travelerProfileResult, guideProfileResult, cityResult] =
          await Promise.all([
            db
              .from('profiles')
              .select('full_name')
              .eq('id', bookingData.traveler_id)
              .single(),
            db
              .from('profiles')
              .select('full_name')
              .eq('id', bookingData.guide_id)
              .single(),
            db
              .from('cities')
              .select('name')
              .eq('id', bookingData.city_id)
              .single(),
          ]);

        const travelerName = travelerProfileResult.data?.full_name || 'Traveler';
        const guideName = guideProfileResult.data?.full_name || 'Guide';
        const cityName = cityResult.data?.name || 'the city';

        const formattedDate = new Date(bookingData.start_at).toLocaleDateString(
          'en-US',
          {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          },
        );

        const baseUrl = getBaseUrl();
        sendBookingPaidEmail({
          travelerUserId: bookingData.traveler_id,
          guideUserId: bookingData.guide_id,
          travelerName,
          guideName,
          cityName,
          date: formattedDate,
          link: `${baseUrl}/traveler/bookings/${bookingData.id}`,
        }).catch(() => {
          // Silent failure: do not break confirmation flow.
        });
      } catch {
        // Silent failure: do not break confirmation flow.
      }
    }

    const amountTotal =
      typeof session.amount_total === 'number'
        ? session.amount_total / 100
        : parseFloat(bookingData.price_total || '0');

    const currency = (
      session.currency ||
      bookingData.currency ||
      'USD'
    ).toUpperCase();

    return {
      ok: true,
      bookingId: bookingData.id,
      amountTotal,
      currency,
      status: alreadyConfirmed ? bookingData.status : 'confirmed',
    };
  } catch {
    return { ok: false, error: 'Failed to verify session' };
  }
}
