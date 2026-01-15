import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { sendBookingPaidEmail } from '@/lib/email';
import { getBaseUrl } from '@/lib/url-helpers';
import type { Database } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session');

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'session parameter is required' },
        { status: 400 },
      );
    }

    // Initialize Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('[verify-session] STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { ok: false, error: 'Stripe is not configured' },
        { status: 500 },
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia',
    });

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ ok: false });
    }

    // Find booking by checkout session ID
    const supabase = await createSupabaseServerClient();
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .select('id, status, traveler_id, guide_id, city_id, start_at') // ⚠️ start_at, not starts_at
      .eq('stripe_checkout_session_id', sessionId)
      .single();

    if (bookingError || !bookingData) {
      return NextResponse.json(
        { ok: false, error: 'Booking not found' },
        { status: 404 },
      );
    }

    // Type assertion needed because select returns a narrowed type
    const booking = bookingData as {
      id: string;
      status: string;
      traveler_id: string;
      guide_id: string;
      city_id: string;
      start_at: string; // ⚠️ start_at, not starts_at
    } | null;

    if (!booking) {
      return NextResponse.json(
        { ok: false, error: 'Booking not found' },
        { status: 404 },
      );
    }

    // Update booking status to 'paid' after successful payment
    const bookingUpdate: Database['public']['Tables']['bookings']['Update'] = {
      status: 'paid',
    };

    // Type assertion needed for Supabase update operation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('bookings')
      .update(bookingUpdate)
      .eq('id', booking.id);

    // Send emails to both traveler and guide (fire-and-forget)
    try {
      // Get traveler and guide profiles
      const [travelerProfileResult, guideProfileResult, cityResult] =
        await Promise.all([
          supabase
            .from('profiles')
            .select('full_name') // ⚠️ full_name, not display_name
            .eq('id', booking.traveler_id)
            .single(),
          supabase
            .from('profiles')
            .select('full_name') // ⚠️ full_name, not display_name
            .eq('id', booking.guide_id)
            .single(),
          supabase
            .from('cities')
            .select('name')
            .eq('id', booking.city_id)
            .single(),
        ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const travelerName =
        (travelerProfileResult.data as any)?.full_name || 'Traveler'; // ⚠️ full_name, not display_name
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const guideName = (guideProfileResult.data as any)?.full_name || 'Guide'; // ⚠️ full_name, not display_name
      const cityName =
        (cityResult.data as { name: string } | null)?.name || 'the city';

      const formattedDate = new Date(booking.start_at).toLocaleDateString(
        'en-US',
        {
          // ⚠️ start_at, not starts_at
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
        travelerUserId: booking.traveler_id,
        guideUserId: booking.guide_id,
        travelerName,
        guideName,
        cityName,
        date: formattedDate,
        link: `${baseUrl}/traveler/bookings`,
      }).catch((error) => {
        console.error('[verify-session] Failed to send email:', error);
      });
    } catch (error) {
      console.error('[verify-session] Failed to prepare email data:', error);
      // Don't fail the payment verification if email prep fails
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[verify-session] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to verify session' },
      { status: 500 },
    );
  }
}
