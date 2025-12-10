import Link from "next/link";
import { Calendar, Clock, User, DollarSign, MapPin } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PayButton } from "@/components/traveler/PayButton";
import { VerifySession } from "@/components/traveler/VerifySession";
import type { BookingStatus } from "@/types/database";

// Booking with joined data
type BookingWithDetails = {
  id: string;
  status: BookingStatus;
  starts_at: string;
  ends_at: string;
  duration_hours: number | null;
  price_total: string;
  currency: string | null;
  notes: string | null;
  special_requests: string | null;
  stripe_checkout_session_id: string | null;
  created_at: string;
  guide: { display_name: string } | null;
  city: { name: string } | null;
};

const bookingStatusConfig: Record<BookingStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  accepted: { label: "Accepted", variant: "default" },
  confirmed: { label: "Confirmed", variant: "default" },
  declined: { label: "Declined", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "outline" },
  completed: { label: "Completed", variant: "default" },
  paid: { label: "Paid", variant: "default" },
};

type TravelerBookingsPageProps = {
  searchParams: Promise<{ session?: string; cancelled?: string }>;
};

export default async function TravelerBookingsPage({ searchParams }: TravelerBookingsPageProps) {
  const { supabase, profile } = await requireUser();
  const params = await searchParams;

  // Load bookings for this traveler with guide and city info
  // Note: Supabase types don't handle nested selects well, so we use a type assertion
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      starts_at,
      ends_at,
      duration_hours,
      price_total,
      currency,
      notes,
      special_requests,
      stripe_checkout_session_id,
      created_at,
      guide:guide_id(display_name),
      city:city_id(name)
    `)
    .eq("traveler_id", profile.id)
    .order("created_at", { ascending: false });

  // Type assertion for bookings with joined data (Supabase types don't handle nested selects)
  const typedBookings = (bookings ?? []) as BookingWithDetails[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Verify session if returning from Stripe */}
      {params.session && <VerifySession sessionId={params.session} />}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">
            Your Bookings
          </h1>
          <p className="text-slate-600 font-light mt-2">
            View and manage your tour bookings
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/cities">Browse Guides</Link>
        </Button>
      </div>

      {/* Bookings List */}
      <div className="space-y-6">
        {typedBookings.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-16 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Calendar size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-600 font-light text-lg">
                  You haven&apos;t made any bookings yet.
                </p>
                <p className="text-sm text-slate-500">
                  Browse our guides and request your first tour!
                </p>
                <Button asChild size="lg" className="mt-4">
                  <Link href="/cities">Explore Destinations</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {typedBookings.map((booking) => {
              const statusInfo = bookingStatusConfig[booking.status];
              const startDate = new Date(booking.starts_at);
              const canPay = booking.status === "accepted" && !booking.stripe_checkout_session_id;

              return (
                <Card key={booking.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <User size={20} className="text-slate-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg text-slate-900">
                              {booking.guide?.display_name || "Unknown Guide"}
                            </p>
                            <Badge variant={statusInfo.variant} className="mt-1">
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 pl-13">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <MapPin size={16} />
                            <span>{booking.city?.name || "Unknown City"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar size={16} />
                            <span>
                              {startDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock size={16} />
                            <span>
                              {startDate.toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}{" "}
                              ({booking.duration_hours || 0}h)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <DollarSign size={16} />
                            <span>
                              {booking.currency || "USD"} {booking.price_total}
                            </span>
                          </div>
                        </div>

                        {(booking.notes || booking.special_requests) && (
                          <div className="pl-13 pt-2 border-t">
                            <p className="text-sm text-slate-600">
                              <span className="font-semibold">Your notes:</span>{" "}
                              {booking.notes || booking.special_requests}
                            </p>
                          </div>
                        )}

                        {booking.status === "accepted" && (
                          <div className="pl-13 pt-2">
                            <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                              <span className="text-sm text-green-700">
                                ✓ Booking accepted! Complete payment to confirm.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {canPay && (
                        <div className="lg:w-32">
                          <PayButton bookingId={booking.id} />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
