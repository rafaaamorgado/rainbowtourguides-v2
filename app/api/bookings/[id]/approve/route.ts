import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';
import { getBaseUrl } from '@/lib/url-helpers';
import { sendBookingApprovalPaymentEmail } from '@/lib/email';
import type { Database } from '@/types/database';

type BookingRow = {
  id: string;
  guide_id: string;
  traveler_id: string;
  status: string;
  price_total: string;
  currency: string | null;
};

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
      .select('id, guide_id, traveler_id, status, price_total, currency')
      .eq('id', bookingId)
      .single();

    if (bookingError || !bookingData) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const booking = bookingData as BookingRow;

    if (booking.guide_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: `Booking cannot be approved from status: ${booking.status}` },
        { status: 400 },
      );
    }

    const amount = Number(booking.price_total);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid booking amount' },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe is not configured' },
        { status: 500 },
      );
    }

    const [guideProfileResult, travelerProfileResult] = await Promise.all([
      db
        .from('profiles')
        .select('full_name')
        .eq('id', booking.guide_id)
        .single(),
      db
        .from('profiles')
        .select('full_name')
        .eq('id', booking.traveler_id)
        .single(),
    ]);

    const guideName = guideProfileResult.data?.full_name || 'Guide';
    const travelerName = travelerProfileResult.data?.full_name || 'Traveler';

    const baseUrl = getBaseUrl();
    const successUrl = `${baseUrl}/traveler/bookings/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`;
    const cancelUrl = `${baseUrl}/traveler/bookings/${booking.id}?payment=cancelled`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: (booking.currency || 'USD').toLowerCase(),
            product_data: {
              name: `Rainbow Tour Guides - Tour with ${guideName}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        booking_id: booking.id,
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout URL' },
        { status: 500 },
      );
    }

    const bookingUpdate: Database['public']['Tables']['bookings']['Update'] = {
      status: 'approved_pending_payment',
      accepted_at: new Date().toISOString(),
      stripe_checkout_session_id: session.id,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await db
      .from('bookings')
      .update(bookingUpdate)
      .eq('id', booking.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update booking status' },
        { status: 500 },
      );
    }

    sendBookingApprovalPaymentEmail({
      travelerUserId: booking.traveler_id,
      travelerName,
      guideName,
      paymentLink: session.url,
    }).catch(() => {
      // Email failure should not rollback booking approval.
    });

    return NextResponse.json({
      success: true,
      status: 'approved_pending_payment',
      checkoutUrl: session.url,
      message: 'Traveler notified with payment link',
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to approve booking request' },
      { status: 500 },
    );
  }
}
