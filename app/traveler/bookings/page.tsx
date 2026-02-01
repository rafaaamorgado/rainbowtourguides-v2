"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Star,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { isMessagingEnabled } from "@/lib/messaging-rules";
import type { Booking } from "@/lib/mock-data";
import { EmptyState } from "@/components/ui/empty-state";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const isDev = process.env.NODE_ENV === "development";

export default function TravelerBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const fetchBookings = useCallback(async (uid: string) => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        guide:guides!bookings_guide_id_fkey(
          profile:profiles!guides_id_fkey(full_name)
        ),
        city:cities!bookings_city_id_fkey(name)
      `)
      .eq("traveler_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[TravelerBookings] Error fetching bookings:", error);
      return;
    }

    // Adapt to Booking type
    const adapted = (data || []).map((b: any) => ({
      id: b.id,
      traveler_id: b.traveler_id,
      guide_id: b.guide_id,
      city_id: b.city_id,
      guide_name: b.guide?.profile?.full_name || "Guide",
      city_name: b.city?.name || "City",
      date: b.start_at,
      duration: b.duration_hours || 4,
      status: b.status,
      price_total: parseFloat(b.price_total || "0"),
      notes: b.traveler_note || "",
    }));

    setBookings(adapted);
  }, []);

  useEffect(() => {
    async function init() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/sign-in?redirect=/traveler/bookings");
        return;
      }

      setUserId(user.id);
      await fetchBookings(user.id);
      setIsLoading(false);

      // Check for success message
      const params = new URLSearchParams(window.location.search);
      if (params.get("success") === "booking_created") {
        setShowSuccessMessage(true);
        // Clear the query param
        router.replace("/traveler/bookings", { scroll: false });
        // Hide message after 5 seconds
        setTimeout(() => setShowSuccessMessage(false), 5000);
      }
    }

    init();
  }, [router, fetchBookings]);

  // DEV ONLY: Create a demo booking
  const handleCreateDemoBooking = async () => {
    if (!isDev || !userId) return;

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    setIsCreatingDemo(true);

    try {
      // Get a random approved guide
      let availableGuides: { id: string; city_id: string; price_4h: string | null }[] = [];

      const { data: approvedGuides } = await supabase
        .from("guides")
        .select("id, city_id, price_4h")
        .eq("status", "approved")
        .limit(5);

      if (approvedGuides && approvedGuides.length > 0) {
        availableGuides = approvedGuides;
      } else {
        // Try without status filter
        const { data: allGuides } = await supabase
          .from("guides")
          .select("id, city_id, price_4h")
          .limit(5);

        if (!allGuides || allGuides.length === 0) {
          alert("No guides found. Seed some guide data first.");
          setIsCreatingDemo(false);
          return;
        }

        availableGuides = allGuides;
      }

      const randomGuide = availableGuides[Math.floor(Math.random() * availableGuides.length)];

      // Create a demo booking
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 14) + 1); // 1-14 days from now
      startDate.setHours(10, 0, 0, 0);

      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 4);

      const statuses = ["pending", "confirmed", "accepted"];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      const { error: insertError } = await (supabase as any)
        .from("bookings")
        .insert({
          traveler_id: userId,
          guide_id: randomGuide.id,
          city_id: randomGuide.city_id,
          start_at: startDate.toISOString(),
          duration_hours: 4,
          party_size: 2,
          price_total: randomGuide.price_4h || "120",
          currency: "USD",
          status: randomStatus,
          traveler_note: "Demo booking created for testing",
        });

      if (insertError) {
        alert(`Error: ${insertError.message}`);
        setIsCreatingDemo(false);
        return;
      }

      // Refresh bookings
      await fetchBookings(userId);
    } catch (err) {
      // Silent error
    } finally {
      setIsCreatingDemo(false);
    }
  };

  // Filter bookings by status
  const upcomingBookings = bookings.filter(
    (b) =>
      (b.status === "confirmed" || b.status === "accepted") &&
      new Date(b.date) >= new Date()
  );

  const pendingBookings = bookings.filter((b) => b.status === "pending");

  const pastBookings = bookings.filter(
    (b) =>
      (b.status === "completed" || b.status === "cancelled") &&
      new Date(b.date) < new Date()
  );

  const handleCancelClick = (bookingId: string) => {
    setBookingToCancel(bookingId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!bookingToCancel || !userId) return;

    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    // Update booking status
    const { error } = await (supabase as any)
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingToCancel)
      .eq("traveler_id", userId); // Ensure user owns the booking

    if (error) {
      // Silent error
    } else {
      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingToCancel ? { ...b, status: "cancelled" } : b
        )
      );
    }

    setCancelDialogOpen(false);
    setBookingToCancel(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2">My Bookings</h1>
          <p className="text-ink-soft">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white flex-shrink-0">
            ✓
          </div>
          <div>
            <p className="font-semibold text-emerald-900">Booking request sent!</p>
            <p className="text-sm text-emerald-700">The guide will review your request and respond within 24 hours.</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2">My Bookings</h1>
          <p className="text-ink-soft">Manage your tour bookings and requests</p>
        </div>

        {/* DEV ONLY: Demo booking button */}
        {isDev && (
          <Button
            onClick={handleCreateDemoBooking}
            disabled={isCreatingDemo}
            variant="outline"
            size="sm"
            className="border-dashed border-amber-500 text-amber-700 hover:bg-amber-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCreatingDemo ? "Creating..." : "DEV: Add Demo Booking"}
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All ({bookings.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastBookings.length})
          </TabsTrigger>
        </TabsList>

        {/* All Tab */}
        <TabsContent value="all">
          {bookings.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="No bookings yet"
                description="Ready for an adventure? Browse our verified local guides and book your first experience."
                icon="calendar"
                actionLabel="Browse Guides"
                actionHref="/cities"
                secondaryActionLabel="Explore Cities"
                secondaryActionHref="/cities"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelClick}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Upcoming Tab */}
        <TabsContent value="upcoming">
          {upcomingBookings.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="No upcoming tours"
                description="Start exploring! Browse our verified guides and book your next adventure."
                icon="calendar"
                actionLabel="Find a Guide"
                actionHref="/cities"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelClick}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Tab */}
        <TabsContent value="pending">
          {pendingBookings.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="No pending requests"
                description="All your booking requests have been processed."
                icon="clock"
                variant="minimal"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelClick}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Past Tab */}
        <TabsContent value="past">
          {pastBookings.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="No past tours yet"
                description="You haven't completed any tours yet. Book your first adventure!"
                icon="map"
                actionLabel="Browse Cities"
                actionHref="/cities"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancelClick}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle>Cancel Booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? Our cancellation
              policy applies, and you may be charged a fee depending on how
              close to the tour date you are cancelling.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCancelDialogOpen(false)}>
              Keep Booking
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Cancel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface BookingCardProps {
  booking: Booking;
  onCancel: (bookingId: string) => void;
}

function BookingCard({ booking, onCancel }: BookingCardProps) {
  const isPending = booking.status === "pending";
  const isUpcoming =
    (booking.status === "confirmed" || booking.status === "accepted") &&
    new Date(booking.date) >= new Date();
  const isCompleted = booking.status === "completed";
  const isCancelled = booking.status === "cancelled";

  // Mock: Check if reviewed (in production, check reviews table)
  const hasReview = false;

  return (
    <div className="bg-panel-light border border-slate-200 rounded-2xl p-6 hover:shadow-glass transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6">
        {/* Guide Photo */}
        <div className="flex items-start">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-pride-lilac to-pride-mint flex-shrink-0">
            <div className="w-full h-full flex items-center justify-center text-white font-semibold text-2xl">
              {booking.guide_name.charAt(0)}
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-semibold text-ink mb-1">
              {booking.guide_name}
            </h3>
            <p className="text-ink-soft flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {booking.city_name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-ink-soft">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(booking.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {booking.duration} hours
            </div>
          </div>

          <div className="flex items-center gap-3">
            <BookingStatusBadge status={booking.status} />

            <span className="text-2xl font-bold text-ink">
              ${booking.price_total}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 lg:min-w-[160px]">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={`/traveler/bookings/${booking.id}`}>
              View Details
            </Link>
          </Button>

          {isMessagingEnabled(booking.status) && (
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link
                href={`/traveler/messages?booking=${booking.id}`}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Message
              </Link>
            </Button>
          )}

          {(isPending || isUpcoming) && !isCancelled && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(booking.id)}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Cancel {isPending ? "Request" : "Booking"}
            </Button>
          )}

          {isCompleted && !hasReview && (
            <Button asChild variant="default" size="sm" className="w-full">
              <Link
                href={`/traveler/bookings/${booking.id}/review`}
                className="flex items-center gap-2"
              >
                <Star className="h-4 w-4" />
                Leave Review
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
