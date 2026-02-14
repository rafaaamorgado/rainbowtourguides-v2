'use client';

import { useEffect, useState, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BookingStatusBadge } from '@/components/bookings/BookingStatusBadge';
import { Calendar, Clock, MapPin, Check, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';

type Booking = {
  id: string;
  traveler_id: string;
  guide_id: string;
  city_id: string;
  status: string;
  price_total: string;
  currency: string | null;
  start_at: string;
  duration_hours: number | null;
  party_size: number | null;
  traveler_note: string | null;
  created_at: string;
  traveler?: {
    full_name: string;
    avatar_url: string | null;
  };
  city?: {
    name: string;
  };
};

export default function GuideBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [bookingToDecline, setBookingToDecline] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [guideId, setGuideId] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }
    setGuideId(user.id);

    const { data } = await supabase
      .from('bookings')
      .select(
        `
        *,
        traveler:profiles!bookings_traveler_id_fkey(full_name, avatar_url),
        city:cities!bookings_city_id_fkey(name)
      `,
      )
      .eq('guide_id', user.id)
      .order('created_at', { ascending: false });

    setBookings((data || []) as Booking[]);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Set up realtime subscription for booking updates
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase || !guideId) return;

    console.log(
      '[Realtime] Setting up bookings subscription for guide:',
      guideId,
    );

    const channel = supabase
      .channel(`guide_bookings:${guideId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `guide_id=eq.${guideId}`,
        },
        (payload) => {
          const oldBooking = (payload.old || null) as Partial<Booking> | null;
          const newBooking = (payload.new || null) as Partial<Booking> | null;

          console.log('[Realtime] Booking updated:', {
            bookingId: newBooking?.id,
            oldStatus: oldBooking?.status,
            newStatus: newBooking?.status,
            timestamp: new Date().toISOString(),
          });

          setBookings((prev) =>
            prev.map((b) => {
              if (b.id === newBooking?.id) {
                console.log('[Realtime] Updating booking in UI:', b.id);
                return {
                  ...b,
                  status: newBooking?.status || b.status,
                };
              }
              return b;
            }),
          );
        },
      )
      .subscribe((status) => {
        console.log('[Realtime] Bookings subscription status:', {
          channel: `guide_bookings:${guideId}`,
          status,
          timestamp: new Date().toISOString(),
        });

        if (status === 'SUBSCRIBED') {
          console.log(
            '[Realtime] ✅ Successfully subscribed to booking updates',
          );
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] ❌ Channel error - check RLS policies');
        } else if (status === 'CLOSED') {
          console.log('[Realtime] 🔌 Channel closed');
        }
      });

    return () => {
      console.log(
        '[Realtime] Cleaning up bookings subscription for guide:',
        guideId,
      );
      supabase.removeChannel(channel);
    };
  }, [guideId]);

  const handleAccept = async (bookingId: string) => {
    setActionLoading(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to accept booking');
      }

      // Refresh bookings
      await fetchBookings();
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert('Failed to accept booking. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineClick = (bookingId: string) => {
    setBookingToDecline(bookingId);
    setDeclineDialogOpen(true);
  };

  const handleDeclineConfirm = async () => {
    if (!bookingToDecline) return;

    setActionLoading(bookingToDecline);
    try {
      const response = await fetch(`/api/bookings/${bookingToDecline}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined' }),
      });

      if (!response.ok) {
        throw new Error('Failed to decline booking');
      }

      // Refresh bookings
      await fetchBookings();
    } catch (error) {
      console.error('Error declining booking:', error);
      alert('Failed to decline booking. Please try again.');
    } finally {
      setActionLoading(null);
      setDeclineDialogOpen(false);
      setBookingToDecline(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
          <p className="text-muted-foreground">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  // Filter bookings by status
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const upcomingBookings = bookings.filter(
    (b) =>
      (b.status === 'approved_pending_payment' ||
        b.status === 'accepted' ||
        b.status === 'confirmed') &&
      new Date(b.start_at) >= new Date(),
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'completed' || new Date(b.start_at) < new Date(),
  );
  const cancelledBookings = bookings.filter(
    (b) =>
      b.status === 'cancelled_by_traveler' ||
      b.status === 'cancelled_by_guide' ||
      b.status === 'declined',
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
        <p className="text-muted-foreground">
          Manage your booking requests and upcoming tours.
        </p>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList>
          <TabsTrigger value="requests">
            Requests{' '}
            {pendingBookings.length > 0 && `(${pendingBookings.length})`}
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming{' '}
            {upcomingBookings.length > 0 && `(${upcomingBookings.length})`}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>
                Respond to these requests within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingBookings.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  No pending requests.
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onAccept={handleAccept}
                      onDecline={handleDeclineClick}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tours</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingBookings.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  No upcoming tours scheduled.
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Past Tours</CardTitle>
            </CardHeader>
            <CardContent>
              {pastBookings.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  No past tours.
                </div>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cancelled Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {cancelledBookings.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  No cancelled bookings.
                </div>
              ) : (
                <div className="space-y-4">
                  {cancelledBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Decline Confirmation Dialog */}
      <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Booking Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will notify the traveler that you cannot accommodate this
              booking. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Request</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeclineConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Decline
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface BookingCardProps {
  booking: Booking;
  onAccept?: (bookingId: string) => void;
  onDecline?: (bookingId: string) => void;
  actionLoading?: string | null;
}

function BookingCard({
  booking,
  onAccept,
  onDecline,
  actionLoading,
}: BookingCardProps) {
  const startDate = new Date(booking.start_at);
  const travelerName = booking.traveler?.full_name || 'Unknown Traveler';
  const cityName = booking.city?.name || 'Unknown City';
  const isPending = booking.status === 'pending';
  const isLoading = actionLoading === booking.id;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-pink-500 flex items-center justify-center text-white font-semibold">
              {travelerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-ink">{travelerName}</h3>
              <p className="text-sm text-ink-soft flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {cityName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-ink-soft">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {startDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {startDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
              })}{' '}
              ({booking.duration_hours || 4}h)
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BookingStatusBadge status={booking.status} />
            <span className="text-lg font-bold text-ink">
              {booking.currency === 'EUR' ? '€' : '$'}
              {parseFloat(booking.price_total).toFixed(0)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {isPending && onAccept && onDecline ? (
            <>
              <Button
                onClick={() => onAccept(booking.id)}
                disabled={isLoading}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </>
                )}
              </Button>
              <Button
                onClick={() => onDecline(booking.id)}
                disabled={isLoading}
                variant="bordered"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </>
          ) : (
            <Button asChild variant="bordered" size="sm">
              <Link href={`/guide/bookings/${booking.id}`}>View Details</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
