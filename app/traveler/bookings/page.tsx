import { requireUser } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="py-12 space-y-8">
      {/* Verify session if returning from Stripe */}
      {params.session && <VerifySession sessionId={params.session} />}
      
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-semibold">Your Bookings</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your tour bookings
        </p>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {typedBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>You haven&apos;t made any bookings yet.</p>
              <p className="text-sm mt-1">
                Browse our guides and request your first tour!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {typedBookings.map((booking) => {
              const statusInfo = bookingStatusConfig[booking.status];
              const startDate = new Date(booking.starts_at);
              const canPay = booking.status === "accepted" && !booking.stripe_checkout_session_id;

              return (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {booking.guide?.display_name || "Unknown Guide"}
                          </p>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {booking.city?.name || "Unknown City"} •{" "}
                          {startDate.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}{" "}
                          at{" "}
                          {startDate.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                        {booking.duration_hours && (
                          <p className="text-sm text-muted-foreground">
                            Duration: {booking.duration_hours} hours •{" "}
                            {booking.currency || "USD"} {booking.price_total}
                          </p>
                        )}
                        {(booking.notes || booking.special_requests) && (
                          <p className="text-sm text-muted-foreground mt-2">
                            <span className="font-medium">Your notes:</span>{" "}
                            {booking.notes || booking.special_requests}
                          </p>
                        )}
                      </div>

                      {canPay && <PayButton bookingId={booking.id} />}
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
