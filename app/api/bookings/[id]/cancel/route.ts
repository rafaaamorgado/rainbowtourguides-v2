import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';
import type { Database } from '@/types/database';

const REFUND_POLICY_HOURS = 48;

type BookingCancelRow = {
  id: string;
  traveler_id: string;
  guide_id: string;
  status: string;
  start_at: string;
  currency: string | null;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
};

function getHoursUntilStart(startAt: string): number {
  const startMs = new Date(startAt).getTime();
  const nowMs = Date.now();
  return (startMs - nowMs) / (1000 * 60 * 60);
}

function getRefundPercent(hoursUntilStart: number): number {
  return hoursUntilStart > REFUND_POLICY_HOURS ? 100 : 50;
}

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bookingId } = await params;
    const supabase = await createSupabaseServerClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: bookingData, error: bookingError } = await db
      .from('bookings')
      .select(
        'id, traveler_id, guide_id, status, start_at, currency, stripe_checkout_session_id, stripe_payment_intent_id',
      )
      .eq('id', bookingId)
      .single();

    if (bookingError || !bookingData) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookingData as BookingCancelRow;
    const isTraveler = booking.traveler_id === user.id;
    const isGuide = booking.guide_id === user.id;

    if (!isTraveler && !isGuide) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (
      booking.status === 'cancelled_by_traveler' ||
      booking.status === 'cancelled_by_guide' ||
      booking.status === 'declined' ||
      booking.status === 'completed'
    ) {
      return NextResponse.json(
        { error: 'Booking is already cancelled' },
        { status: 400 },
      );
    }

    const hoursUntilStart = getHoursUntilStart(booking.start_at);
    if (hoursUntilStart <= 0) {
      return NextResponse.json(
        { error: 'This booking can no longer be cancelled' },
        { status: 400 },
      );
    }

    const actor = isTraveler ? 'traveler' : 'guide';
    const refundPercent =
      actor === 'guide' ? 100 : getRefundPercent(hoursUntilStart);

    let paymentIntentId = booking.stripe_payment_intent_id;
    let refundResult:
      | {
          id: string;
          status: string | null;
          amount: number;
          currency: string;
        }
      | null = null;

    if (paymentIntentId || booking.stripe_checkout_session_id) {
      const stripe = getStripe();
      if (!stripe) {
        return NextResponse.json(
          { error: 'Stripe is not configured' },
          { status: 500 },
        );
      }

      if (!paymentIntentId && booking.stripe_checkout_session_id) {
        const checkoutSession = await stripe.checkout.sessions.retrieve(
          booking.stripe_checkout_session_id,
        );
        if (typeof checkoutSession.payment_intent === 'string') {
          paymentIntentId = checkoutSession.payment_intent;
        }
      }

      if (paymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        const amountPaid = paymentIntent.amount_received || paymentIntent.amount || 0;

        if (amountPaid > 0) {
          const refundAmount =
            refundPercent === 100
              ? undefined
              : Math.max(1, Math.floor((amountPaid * refundPercent) / 100));

          const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            ...(typeof refundAmount === 'number' ? { amount: refundAmount } : {}),
            metadata: {
              booking_id: booking.id,
              cancelled_by: actor,
              refund_percent: String(refundPercent),
            },
          });

          refundResult = {
            id: refund.id,
            status: refund.status,
            amount: refund.amount / 100,
            currency: (refund.currency || booking.currency || 'USD').toUpperCase(),
          };
        }
      }
    }

    const nextStatus =
      actor === 'traveler' ? 'cancelled_by_traveler' : 'cancelled_by_guide';
    const now = new Date().toISOString();

    const bookingUpdate: Database['public']['Tables']['bookings']['Update'] = {
      status: nextStatus,
      cancelled_at: now,
      updated_at: now,
      ...(paymentIntentId ? { stripe_payment_intent_id: paymentIntentId } : {}),
    };

    const { error: updateError } = await db
      .from('bookings')
      .update(bookingUpdate)
      .eq('id', booking.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to cancel booking' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      status: 'cancelled',
      internalStatus: nextStatus,
      hoursUntilStart: Number(hoursUntilStart.toFixed(2)),
      refundPercent,
      refund: refundResult,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to cancel booking';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
