import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { sendBookingRequestEmail } from '@/lib/email';
import { getBaseUrl } from '@/lib/url-helpers';
import type { BookingInsert } from '@/lib/db-types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      guideId,
      cityId,
      duration,
      date,
      time,
      travelers,
      location,
      notes,
      price,
      currency,
    } = body;

    // Validate required fields
    if (!guideId || !cityId || !duration || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Get authenticated user
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

    if (!user.email_confirmed_at) {
      return NextResponse.json(
        {
          error:
            'Please verify your email address before booking. Check your inbox.',
        },
        { status: 403 },
      );
    }

    // Calculate start timestamp (request-first: no payment/Stripe step here).
    const startDateTime = new Date(`${date}T${time}`);

    // Validate date is in the future
    if (startDateTime <= new Date()) {
      return NextResponse.json(
        { error: 'Date must be in the future' },
        { status: 400 },
      );
    }

    // Create booking
    const bookingData: BookingInsert = {
      traveler_id: user.id,
      guide_id: guideId,
      city_id: cityId,
      status: 'pending',
      price_total: price.toString(),
      currency: currency || 'USD',
      start_at: startDateTime.toISOString(),
      duration_hours: duration,
      party_size: travelers || 2,
      traveler_note: notes
        ? `Meeting location: ${location}\n${notes}`
        : `Meeting location: ${location}`,
    };

    const { data: booking, error: bookingError } = await db
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('Booking creation error:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 },
      );
    }

    // Get guide and traveler details for email
    try {
      const [guideResult, travelerResult, cityResult] = await Promise.all([
        db
          .from('profiles')
          .select('full_name')
          .eq('id', guideId)
          .single(),
        db
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single(),
        db.from('cities').select('name').eq('id', cityId).single(),
      ]);

      const guideName = guideResult.data?.full_name || 'Guide';
      const travelerName = travelerResult.data?.full_name || 'Traveler';
      const cityName = cityResult.data?.name || 'the city';

      const formattedDate = startDateTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

      const baseUrl = getBaseUrl();

      // Send email notification to guide (fire-and-forget)
      sendBookingRequestEmail({
        guideUserId: guideId,
        guideName,
        travelerName,
        cityName,
        date: formattedDate,
        link: `${baseUrl}/guide/bookings/${booking.id}`,
      }).catch((err) => {
        console.error('Failed to send email:', err);
        // Don't fail the booking if email fails
      });
    } catch (emailError) {
      console.error('Error preparing email:', emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      status: 'pending',
      message: 'Request sent! Waiting for guide approval.',
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
