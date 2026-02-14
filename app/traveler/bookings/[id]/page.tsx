import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Users,
} from 'lucide-react';
import { requireRole } from '@/lib/auth-helpers';
import { getUserEmailById } from '@/lib/admin-user-email';
import { HIDDEN_UNTIL_CONFIRMED } from '@/lib/booking-contact-visibility';
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isMessagingEnabled } from '@/lib/messaging-rules';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
}

type TravelerBookingDetail = {
  id: string;
  guide_id: string;
  status: string;
  price_total: string;
  currency: string | null;
  start_at: string;
  duration_hours: number | null;
  party_size: number | null;
  traveler_note: string | null;
  created_at: string;
  guide?: {
    phone?: string | null;
    phone_number?: string | null;
    social_whatsapp?: string | null;
    profile?: {
      full_name?: string | null;
    } | null;
  } | null;
  city?: {
    name?: string | null;
  } | null;
};

function getFirstNonEmpty(values: Array<unknown>): string | null {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

export default async function TravelerBookingDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { supabase, user } = await requireRole('traveler');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { id } = await params;
  const query = await searchParams;

  const { data: bookingData } = await db
    .from('bookings')
    .select(
      `
      id,
      guide_id,
      status,
      price_total,
      currency,
      start_at,
      duration_hours,
      party_size,
      traveler_note,
      created_at,
      guide:guides!bookings_guide_id_fkey(
        phone,
        phone_number,
        social_whatsapp,
        profile:profiles!guides_id_fkey(full_name)
      ),
      city:cities!bookings_city_id_fkey(name)
    `,
    )
    .eq('id', id)
    .eq('traveler_id', user.id)
    .single();

  const booking = bookingData as TravelerBookingDetail | null;

  if (!booking) {
    notFound();
  }

  const guideName = booking.guide?.profile?.full_name || 'Guide';
  const cityName = booking.city?.name || 'Unknown City';
  const startDate = new Date(booking.start_at);
  const canShowPrivateContact = ['confirmed', 'completed', 'paid'].includes(
    booking.status,
  );
  const guidePhoneRaw = getFirstNonEmpty([
    booking.guide?.phone,
    booking.guide?.phone_number,
  ]);
  const guideWhatsappRaw = getFirstNonEmpty([booking.guide?.social_whatsapp]);
  const guideEmail = (await getUserEmailById(booking.guide_id)) || 'Not provided';

  const guidePhone = canShowPrivateContact
    ? guidePhoneRaw || 'Not provided'
    : HIDDEN_UNTIL_CONFIRMED;
  const guideWhatsapp = canShowPrivateContact
    ? guideWhatsappRaw || 'Not provided'
    : HIDDEN_UNTIL_CONFIRMED;

  return (
    <div className="space-y-6">
      {query.success === 'request_sent' && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <p className="font-semibold text-emerald-900">
            Request sent! Waiting for guide approval.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/traveler/bookings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-ink">Booking Details</h1>
            <p className="text-ink-soft">Tour with {guideName}</p>
          </div>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tour Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-ink-soft" />
                <div>
                  <p className="font-semibold text-ink">Date & Time</p>
                  <p className="text-ink-soft">
                    {startDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-ink-soft">
                    {startDate.toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 text-ink-soft" />
                <div>
                  <p className="font-semibold text-ink">Duration</p>
                  <p className="text-ink-soft">{booking.duration_hours || 4} hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-ink-soft" />
                <div>
                  <p className="font-semibold text-ink">Location</p>
                  <p className="text-ink-soft">{cityName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="mt-0.5 h-5 w-5 text-ink-soft" />
                <div>
                  <p className="font-semibold text-ink">Party Size</p>
                  <p className="text-ink-soft">
                    {booking.party_size || 1}{' '}
                    {booking.party_size === 1 ? 'person' : 'people'}
                  </p>
                </div>
              </div>

              {booking.traveler_note && (
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-ink-soft" />
                  <div className="flex-1">
                    <p className="mb-1 font-semibold text-ink">Your Note</p>
                    <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-ink-soft">
                      {booking.traveler_note}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink">Total Price</span>
                  <span className="text-2xl font-bold text-ink">
                    {booking.currency === 'EUR' ? '€' : '$'}
                    {parseFloat(booking.price_total).toFixed(0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guide Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="flex items-center gap-2 text-ink-soft">
                <Mail className="h-4 w-4" />
                <span className="font-semibold text-ink">Email:</span>{' '}
                {guideEmail}
              </p>
              <p className="flex items-center gap-2 text-ink-soft">
                <Phone className="h-4 w-4" />
                <span className="font-semibold text-ink">Phone:</span>{' '}
                {guidePhone}
              </p>
              <p className="flex items-center gap-2 text-ink-soft">
                <MessageSquare className="h-4 w-4" />
                <span className="font-semibold text-ink">WhatsApp:</span>{' '}
                {guideWhatsapp}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isMessagingEnabled(booking.status) && (
                <Button asChild variant="bordered" className="w-full">
                  <Link href={`/traveler/messages?booking=${booking.id}`}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Guide
                  </Link>
                </Button>
              )}
              <div className="border-t border-slate-200 pt-4 text-sm text-ink-soft">
                Created:{' '}
                {new Date(booking.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
