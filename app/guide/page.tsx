"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  DollarSign,
  AlertCircle,
  MessageSquare,
  User,
  Clock,
  CheckCircle,
  X,
  Settings,
} from "lucide-react";
import { getBookings } from "@/lib/data-service";
import type { Booking } from "@/lib/mock-data";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export default function GuideDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [bookingToDecline, setBookingToDecline] = useState<string | null>(null);

  // Mock guide data
  const guideName = "Marco Silva";
  const guideId = "g1";
  const isApproved = true; // Mock - would come from guide.status === "approved"

  useEffect(() => {
    getBookings(guideId, "guide").then((data) => {
      setBookings(data);
      setIsLoading(false);
    });
  }, []);

  // Calculate stats
  const newRequests = bookings.filter((b) => b.status === "pending");
  
  const upcomingTours = bookings.filter(
    (b) =>
      (b.status === "confirmed" || b.status === "accepted") &&
      new Date(b.date) >= new Date()
  );

  const completedThisMonth = bookings.filter((b) => {
    if (b.status !== "completed") return false;
    const bookingDate = new Date(b.date);
    const now = new Date();
    return (
      bookingDate.getMonth() === now.getMonth() &&
      bookingDate.getFullYear() === now.getFullYear()
    );
  });

  const thisMonthEarnings = completedThisMonth.reduce(
    (sum, b) => sum + b.price_total * 0.8,
    0
  );

  const handleAccept = async (bookingId: string) => {
    // TODO: Update via data-service
    // await updateBookingStatus(bookingId, "accepted");
    
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: "accepted" } : b))
    );
  };

  const handleDeclineClick = (bookingId: string) => {
    setBookingToDecline(bookingId);
    setDeclineDialogOpen(true);
  };

  const handleDeclineConfirm = async () => {
    if (!bookingToDecline) return;

    // TODO: Update via data-service
    // await updateBookingStatus(bookingToDecline, "declined");
    
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingToDecline ? { ...b, status: "declined" } : b
      )
    );

    setDeclineDialogOpen(false);
    setBookingToDecline(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2">
            Welcome back, {guideName}!
          </h1>
          <p className="text-ink-soft">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-ink mb-2">
          Welcome back, {guideName}!
        </h1>
        {!isApproved ? (
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="h-5 w-5" />
            <p>Your profile is under review</p>
          </div>
        ) : (
          <p className="text-ink-soft text-lg">
            Here's what's happening with your tours
          </p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-bold text-ink">{newRequests.length}</p>
            <p className="text-sm text-ink-soft mt-1">New requests</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-bold text-ink">
              {upcomingTours.length}
            </p>
            <p className="text-sm text-ink-soft mt-1">Upcoming tours</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-brand" />
            </div>
          </div>
          <div>
            <p className="text-4xl font-bold text-ink">
              ${Math.round(thisMonthEarnings)}
            </p>
            <p className="text-sm text-ink-soft mt-1">This month's earnings</p>
          </div>
        </div>
      </div>

      {/* New Booking Requests Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-ink">New Requests</h2>
          {newRequests.length > 0 && (
            <Badge className="bg-amber-100 text-amber-700 border-0">
              {newRequests.length} pending
            </Badge>
          )}
        </div>

        {newRequests.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12">
            <EmptyState
              title="No new requests"
              description="You're all caught up! New booking requests will appear here."
              icon="calendar"
              variant="minimal"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {newRequests.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border-2 border-amber-200 p-6 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Traveler Info */}
                  <div className="flex items-start gap-4">
                    {/* Traveler Photo */}
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-pride-lilac to-pride-mint flex-shrink-0">
                      <div className="w-full h-full flex items-center justify-center text-white font-semibold text-xl">
                        T
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2">
                      <div>
                        <p className="font-semibold text-ink text-lg">
                          New booking request
                        </p>
                        <p className="text-sm text-ink-soft">
                          From Traveler in {booking.city_name}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-ink-soft">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(booking.date).toLocaleDateString("en-US", {
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

                      {/* Mock message from traveler */}
                      <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm text-ink-soft italic">
                          "Hi! I'm visiting {booking.city_name} and would love
                          to explore with you. Looking forward to hearing back!"
                        </p>
                      </div>

                      <p className="text-lg font-bold text-ink">
                        ${booking.price_total}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-200">
                  <Button
                    onClick={() => handleAccept(booking.id)}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accept Request
                  </Button>
                  <Button
                    onClick={() => handleDeclineClick(booking.id)}
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Decline
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Link href={`/guide/bookings/${booking.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Tours Section */}
      {upcomingTours.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ink">Upcoming Tours</h2>
            {upcomingTours.length > 3 && (
              <Link
                href="/guide/bookings"
                className="text-brand hover:text-brand-dark flex items-center gap-1 text-sm font-medium"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="space-y-4">
            {upcomingTours.slice(0, 3).map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-glass transition-all"
              >
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 items-center">
                  {/* Traveler Photo */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-pride-lilac to-pride-mint flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center text-white font-semibold text-xl">
                      T
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-2">
                    <div>
                      <p className="font-semibold text-ink text-lg">
                        Tour in {booking.city_name}
                      </p>
                      <p className="text-sm text-ink-soft">
                        With traveler from abroad
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-ink-soft">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(booking.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {booking.duration} hours
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                        {booking.status.charAt(0).toUpperCase() +
                          booking.status.slice(1)}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="w-full"
                    >
                      <Link href={`/guide/bookings/${booking.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center gap-2"
                    >
                      <Link href={`/guide/messages?booking=${booking.id}`}>
                        <MessageSquare className="h-4 w-4" />
                        Message
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/guide/profile"
          className="bg-gradient-to-br from-brand to-pink-500 rounded-2xl p-8 text-white hover:shadow-xl transition-all group"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">Edit Profile</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Update your bio, photos, languages, and tour offerings to
                attract more travelers.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
              Manage profile
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </Link>

        <Link
          href="/guide/availability"
          className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-brand/50 hover:shadow-md transition-all group"
        >
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-brand/10 transition-colors">
              <Settings className="h-6 w-6 text-ink-soft group-hover:text-brand transition-colors" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-ink mb-2">
                Manage Availability
              </h3>
              <p className="text-ink-soft text-sm leading-relaxed">
                Set your available dates and times to help travelers find the
                perfect slot.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-soft group-hover:text-brand group-hover:gap-3 transition-all">
              Update calendar
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        </Link>
      </section>

      {/* Decline Confirmation Dialog */}
      <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle>Decline Booking Request?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to decline this booking request? The
              traveler will be notified, and this action cannot be undone. If
              you're unavailable, consider suggesting alternative dates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeclineDialogOpen(false)}>
              Keep Request
            </AlertDialogCancel>
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

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

