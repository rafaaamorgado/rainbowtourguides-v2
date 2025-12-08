import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-helpers";
import { sendBookingStatusEmail } from "@/lib/email";
import { GuideStatusBadge } from "@/components/guide/GuideStatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Database, BookingStatus } from "@/types/database";

type Guide = Database["public"]["Tables"]["guides"]["Row"];

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
  created_at: string;
  traveler: { display_name: string } | null;
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

export default async function GuideDashboardPage() {
  const { supabase, profile } = await requireRole("guide");

  // Load guide profile
  const { data: guide } = await supabase
    .from("guides")
    .select("*")
    .eq("id", profile.id)
    .single();

  // Load bookings for this guide with traveler and city info
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
      created_at,
      traveler:traveler_id(display_name),
      city:city_id(name)
    `)
    .eq("guide_id", profile.id)
    .order("created_at", { ascending: false });

  // Server action to update booking status
  async function updateBookingStatus(formData: FormData): Promise<void> {
    "use server";
    
    const { supabase, profile } = await requireRole("guide");
    const bookingId = formData.get("booking_id") as string;
    const newStatus = formData.get("status") as BookingStatus;

    if (!bookingId || !newStatus) return;

    // Verify the booking belongs to this guide
    const { data: bookingData } = await supabase
      .from("bookings")
      .select("guide_id")
      .eq("id", bookingId)
      .single();

    // Type assertion needed because select("guide_id") returns a narrowed type
    const booking = bookingData as { guide_id: string } | null;

    if (booking?.guide_id !== profile.id) {
      console.error("[updateBookingStatus] Unauthorized attempt");
      return;
    }

    // Update booking status with typed update
    const bookingUpdate: Database["public"]["Tables"]["bookings"]["Update"] = {
      status: newStatus,
    };

    // Type assertion needed for Supabase update operation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("bookings")
      .update(bookingUpdate)
      .eq("id", bookingId);

    revalidatePath("/guide/dashboard");

    // Send email to traveler if status is accepted or declined (fire-and-forget)
    if (newStatus === "accepted" || newStatus === "declined") {
      // Get booking details for email
      const { data: bookingDetails } = await supabase
        .from("bookings")
        .select("traveler_id")
        .eq("id", bookingId)
        .single();

      const travelerId = (bookingDetails as { traveler_id: string } | null)?.traveler_id;

      if (travelerId) {
        // Get traveler profile
        const { data: travelerProfile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", travelerId)
          .single();

        const travelerName = (travelerProfile as { display_name: string } | null)?.display_name || "Traveler";

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                       (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                       "http://localhost:3000");

        sendBookingStatusEmail({
          travelerUserId: travelerId,
          travelerName,
          guideName: profile.display_name,
          status: newStatus as "accepted" | "declined",
          link: `${baseUrl}/traveler/bookings`,
        }).catch((error) => {
          console.error("[updateBookingStatus] Failed to send email:", error);
        });
      }
    }
  }

  // Type assertion for bookings with joined data (Supabase types don't handle nested selects)
  const typedBookings = (bookings ?? []) as BookingWithDetails[];
  const typedGuide = guide as Guide | null;

  return (
    <div className="py-12 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Guide Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {profile.display_name}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/guide/onboarding">Edit Profile</Link>
        </Button>
      </div>

      {/* Guide Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            Profile Status
            {typedGuide && <GuideStatusBadge status={typedGuide.status} />}
          </CardTitle>
          <CardDescription>
            {!typedGuide && (
              <span className="text-amber-600">
                You haven&apos;t completed your guide profile yet.{" "}
                <Link href="/guide/onboarding" className="underline">
                  Complete it now
                </Link>
                .
              </span>
            )}
            {typedGuide?.status === "pending" && (
              "Your profile is under review. You'll be notified once approved."
            )}
            {typedGuide?.status === "approved" && (
              "Your profile is live! Travelers can now book tours with you."
            )}
            {typedGuide?.status === "rejected" && (
              <span className="text-destructive">
                Your profile was not approved. Please update it and resubmit.
              </span>
            )}
          </CardDescription>
        </CardHeader>
        {typedGuide && (
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Headline</p>
              <p className="font-medium">{typedGuide.headline || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Languages</p>
              <p className="font-medium">
                {typedGuide.languages?.join(", ") || "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hourly Rate</p>
              <p className="font-medium">
                {typedGuide.hourly_rate
                  ? `$${typedGuide.hourly_rate}`
                  : "—"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Themes</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {typedGuide.themes?.length ? (
                  typedGuide.themes.map((theme) => (
                    <Badge key={theme} variant="outline" className="text-xs">
                      {theme}
                    </Badge>
                  ))
                ) : (
                  <span className="font-medium">—</span>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Bookings Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Bookings</h2>
        
        {typedBookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No bookings yet.</p>
              <p className="text-sm mt-1">
                {typedGuide?.status === "approved"
                  ? "When travelers book with you, they'll appear here."
                  : "Complete your profile and get approved to start receiving bookings."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {typedBookings.map((booking) => {
              const statusInfo = bookingStatusConfig[booking.status];
              const startDate = new Date(booking.starts_at);
              const canRespond = booking.status === "pending";

              return (
                <Card key={booking.id}>
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {booking.traveler?.display_name || "Unknown Traveler"}
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
                            <span className="font-medium">Notes:</span>{" "}
                            {booking.notes || booking.special_requests}
                          </p>
                        )}
                      </div>

                      {canRespond && (
                        <div className="flex gap-2">
                          <form action={updateBookingStatus}>
                            <input type="hidden" name="booking_id" value={booking.id} />
                            <input type="hidden" name="status" value="accepted" />
                            <Button type="submit" size="sm">
                              Accept
                            </Button>
                          </form>
                          <form action={updateBookingStatus}>
                            <input type="hidden" name="booking_id" value={booking.id} />
                            <input type="hidden" name="status" value="declined" />
                            <Button type="submit" size="sm" variant="outline">
                              Decline
                            </Button>
                          </form>
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
