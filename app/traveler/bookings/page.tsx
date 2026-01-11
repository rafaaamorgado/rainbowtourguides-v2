"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  MessageSquare,
  Star,
  AlertTriangle,
} from "lucide-react";
import { getBookings } from "@/lib/data-service";
import type { Booking } from "@/lib/mock-data";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";

export default function TravelerBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);

  useEffect(() => {
    // Mock user ID - in production, get from auth
    const mockUserId = "u3";
    
    getBookings(mockUserId, "traveler").then((data) => {
      setBookings(data);
      setIsLoading(false);
    });
  }, []);

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
    if (!bookingToCancel) return;

    // TODO: Update booking status via data-service
    // await updateBookingStatus(bookingToCancel, "cancelled");
    
    // For now, update local state
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingToCancel ? { ...b, status: "cancelled" } : b
      )
    );

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
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink mb-2">My Bookings</h1>
        <p className="text-ink-soft">Manage your tour bookings and requests</p>
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
            <EmptyState
              title="No bookings yet"
              description="Start your adventure by booking a tour with one of our amazing guides."
              icon="calendar"
              actionLabel="Find a Guide"
              actionHref="/cities"
            />
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
            <EmptyState
              title="No upcoming tours"
              description="Start exploring! Browse our verified guides and book your next adventure."
              icon="calendar"
              actionLabel="Find a Guide"
              actionHref="/cities"
            />
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
            <EmptyState
              title="No pending requests"
              description="All your booking requests have been processed."
              icon="clock"
              variant="minimal"
            />
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
            <EmptyState
              title="No past tours yet"
              description="You haven't completed any tours yet. Book your first adventure!"
              icon="map"
              actionLabel="Browse Cities"
              actionHref="/cities"
            />
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
            <Badge
              className={cn(
                "text-xs font-medium border-0",
                booking.status === "pending" &&
                  "bg-amber-100 text-amber-700",
                booking.status === "accepted" &&
                  "bg-blue-100 text-blue-700",
                booking.status === "confirmed" &&
                  "bg-emerald-100 text-emerald-700",
                booking.status === "completed" &&
                  "bg-slate-100 text-slate-700",
                booking.status === "cancelled" &&
                  "bg-red-100 text-red-700"
              )}
            >
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Badge>

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

          <Button asChild variant="outline" size="sm" className="w-full">
            <Link
              href={`/traveler/messages?booking=${booking.id}`}
              className="flex items-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              Message
            </Link>
          </Button>

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
