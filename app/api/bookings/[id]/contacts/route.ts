import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import {
  HIDDEN_UNTIL_CONFIRMED,
  isBookingContactVisible,
} from '@/lib/booking-contact-visibility';
import { getUserEmailById } from '@/lib/admin-user-email';

type PersonaShape = {
  phone?: string;
  phone_number?: string;
  whatsapp?: string;
  whatsapp_number?: string;
};

function getFirstNonEmpty(values: Array<unknown>): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

export async function GET(
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

    const { data: booking, error: bookingError } = await db
      .from('bookings')
      .select('id, status, guide_id, traveler_id')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const isGuide = booking.guide_id === user.id;
    const isTraveler = booking.traveler_id === user.id;

    if (!isGuide && !isTraveler) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [{ data: guide }, { data: traveler }, guideEmail, travelerEmail] =
      await Promise.all([
        db
          .from('guides')
          .select('phone, phone_number, social_whatsapp')
          .eq('id', booking.guide_id)
          .single(),
        db
          .from('travelers')
          .select('persona')
          .eq('id', booking.traveler_id)
          .single(),
        getUserEmailById(booking.guide_id),
        getUserEmailById(booking.traveler_id),
      ]);

    const travelerPersona = (traveler?.persona || null) as PersonaShape | null;
    const travelerPhone = getFirstNonEmpty([
      travelerPersona?.phone,
      travelerPersona?.phone_number,
      travelerPersona?.whatsapp,
      travelerPersona?.whatsapp_number,
    ]);
    const guidePhone = getFirstNonEmpty([guide?.phone, guide?.phone_number]);
    const guideWhatsapp = getFirstNonEmpty([guide?.social_whatsapp]);
    const canShowTravelerContact = isBookingContactVisible(booking.status);
    const canShowGuideContact = ['confirmed', 'completed', 'paid'].includes(
      booking.status,
    );

    return NextResponse.json({
      status: booking.status,
      canShowPrivateContact: canShowTravelerContact,
      hiddenLabel: HIDDEN_UNTIL_CONFIRMED,
      traveler: {
        email: canShowTravelerContact
          ? travelerEmail || 'Not provided'
          : HIDDEN_UNTIL_CONFIRMED,
        phone: canShowTravelerContact
          ? travelerPhone || 'Not provided'
          : HIDDEN_UNTIL_CONFIRMED,
      },
      guide: {
        email: guideEmail || 'Not provided',
        phone: canShowGuideContact
          ? guidePhone || 'Not provided'
          : HIDDEN_UNTIL_CONFIRMED,
        whatsapp: canShowGuideContact
          ? guideWhatsapp || 'Not provided'
          : HIDDEN_UNTIL_CONFIRMED,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
