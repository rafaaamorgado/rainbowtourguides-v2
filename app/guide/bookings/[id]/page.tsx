"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Check,
  X,
  Loader2,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

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
  accepted_at: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  traveler?: {
    full_name: string;
    avatar_url: string | null;
    languages: string[] | null;
    bio: string | null;
  };
  city?: {
    name: string;
  };
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GuideBookingDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [bookingId, setBookingId] = useState<string>("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setBookingId(p.id));
  }, [params]);

  useEffect(() => {
    if (!bookingId) return;

    async function fetchBooking() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError("Unable to connect to database");
        setIsLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/sign-in");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("bookings")
        .select(
          `
          *,
          traveler:profiles!bookings_traveler_id_fkey(full_name, avatar_url, languages, bio),
          city:cities!bookings_city_id_fkey(name)
        `
        )
        .eq("id", bookingId)
        .eq("guide_id", user.id)
        .single();

      if (fetchError || !data) {
        setError("Booking not found or you don't have access");
        setIsLoading(false);
        return;
      }

      setBooking(data as Booking);
      setIsLoading(false);
    }

    fetchBooking();
  }, [bookingId, router]);

  const handleAccept = async () => {
    if (!booking) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      });

      if (!response.ok) {
        throw new Error("Failed to accept booking");
      }

      // Refresh booking
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("bookings")
        .select(
          `
          *,
          traveler:profiles!bookings_traveler_id_fkey(full_name, avatar_url, languages, bio),
          city:cities!bookings_city_id_fkey(name)
        `
        )
        .eq("id", booking.id)
        .single();

      if (data) {
        setBooking(data as Booking);
      }
    } catch (error) {
      console.error("Error accepting booking:", error);
      alert("Failed to accept booking. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineConfirm = async () => {
    if (!booking) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "declined" }),
      });

      if (!response.ok) {
        throw new Error("Failed to decline booking");
      }

      // Redirect back to bookings page
      router.push("/guide/bookings");
    } catch (error) {
      console.error("Error declining booking:", error);
      alert("Failed to decline booking. Please try again.");
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/guide/bookings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/guide/bookings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || "Booking not found"}</p>
              <Button onClick={() => router.push("/guide/bookings")}>
                Return to Bookings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const startDate = new Date(booking.start_at);
  const travelerName = booking.traveler?.full_name || "Unknown Traveler";
  const cityName = booking.city?.name || "Unknown City";
  const isPending = booking.status === "pending";

  const statusColors = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    accepted: "bg-blue-100 text-blue-700 border-blue-200",
    paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    completed: "bg-slate-100 text-slate-700 border-slate-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
    declined: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/guide/bookings">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-ink">Booking Details</h1>
            <p className="text-ink-soft">Request from {travelerName}</p>
          </div>
        </div>
        <Badge
          className={
            statusColors[booking.status as keyof typeof statusColors] ||
            "bg-slate-100 text-slate-700"
          }
        >
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tour Details */}
          <Card>
            <CardHeader>
              <CardTitle>Tour Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-ink-soft mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">Date & Time</p>
                  <p className="text-ink-soft">
                    {startDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-ink-soft">
                    {startDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-ink-soft mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">Duration</p>
                  <p className="text-ink-soft">{booking.duration_hours || 4} hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-ink-soft mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">Location</p>
                  <p className="text-ink-soft">{cityName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-ink-soft mt-0.5" />
                <div>
                  <p className="font-semibold text-ink">Party Size</p>
                  <p className="text-ink-soft">
                    {booking.party_size || 1} {booking.party_size === 1 ? "person" : "people"}
                  </p>
                </div>
              </div>

              {booking.traveler_note && (
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-ink-soft mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-ink mb-1">Traveler's Note</p>
                    <p className="text-ink-soft whitespace-pre-wrap bg-slate-50 p-3 rounded-lg">
                      {booking.traveler_note}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-ink">Total Price</span>
                  <span className="text-2xl font-bold text-ink">
                    {booking.currency === "EUR" ? "€" : "$"}
                    {parseFloat(booking.price_total).toFixed(0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Traveler Profile */}
          <Card>
            <CardHeader>
              <CardTitle>About the Traveler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-pink-500 flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0">
                  {travelerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-ink mb-2">{travelerName}</h3>
                  
                  {booking.traveler?.languages && booking.traveler.languages.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-ink-soft mb-1">Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.traveler.languages.map((lang, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {booking.traveler?.bio && (
                    <div>
                      <p className="text-sm font-semibold text-ink-soft mb-1">Bio</p>
                      <p className="text-ink-soft">{booking.traveler.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Actions */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isPending ? (
                <>
                  <Button
                    onClick={handleAccept}
                    disabled={actionLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    size="lg"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Check className="h-4 w-4 mr-2" />
                    )}
                    Accept Booking
                  </Button>
                  <Button
                    onClick={() => setDeclineDialogOpen(true)}
                    disabled={actionLoading}
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    size="lg"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Decline
                  </Button>
                </>
              ) : (
                <Button asChild variant="outline" className="w-full" size="lg">
                  <Link href={`/guide/messages?booking=${booking.id}`}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message Traveler
                  </Link>
                </Button>
              )}

              <div className="pt-4 border-t border-slate-200 text-sm text-ink-soft space-y-2">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>
                    {new Date(booking.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {booking.accepted_at && (
                  <div className="flex justify-between">
                    <span>Accepted:</span>
                    <span>
                      {new Date(booking.accepted_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Decline Dialog */}
      <AlertDialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Decline Booking Request?</AlertDialogTitle>
            <AlertDialogDescription>
              This will notify {travelerName} that you cannot accommodate this booking.
              This action cannot be undone.
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
