import Link from "next/link";
import { revalidatePath } from "next/cache";
import { Calendar, Clock, User, DollarSign, CheckCircle2, XCircle } from "lucide-react";
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">
            Guide Dashboard
          </h1>
          <p className="text-slate-600 font-light mt-2">
            Welcome back, {profile.display_name}
          </p>
        </div>
        <Button asChild size="lg" variant="outline">
          <Link href="/guide/onboarding">Edit Profile</Link>
        </Button>
      </div>

      {/* Guide Status Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-serif">Profile Status</CardTitle>
            {typedGuide && <GuideStatusBadge status={typedGuide.status} />}
          </div>
          <CardDescription className="text-base">
            {!typedGuide && (
              <span className="text-amber-600">
                You haven&apos;t completed your guide profile yet.{" "}
                <Link href="/guide/onboarding" className="underline font-semibold">
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
          <CardContent className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <User size={16} />
                Headline
              </p>
              <p className="font-medium text-slate-900">{typedGuide.headline || "—"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Calendar size={16} />
                Languages
              </p>
              <p className="font-medium text-slate-900">
                {typedGuide.languages?.join(", ") || "—"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <DollarSign size={16} />
                Hourly Rate
              </p>
              <p className="font-medium text-slate-900">
                {typedGuide.hourly_rate ? `$${typedGuide.hourly_rate}/hr` : "—"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-500">Themes</p>
              <div className="flex flex-wrap gap-1">
                {typedGuide.themes?.length ? (
                  typedGuide.themes.slice(0, 2).map((theme) => (
                    <Badge key={theme} variant="outline" className="text-xs">
                      {theme}
                    </Badge>
                  ))
                ) : (
                  <span className="font-medium text-slate-900">—</span>
                )}
                {typedGuide.themes && typedGuide.themes.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{typedGuide.themes.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Bookings Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-serif font-bold text-slate-900">Your Bookings</h2>
          {typedBookings.length > 0 && (
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {typedBookings.length} total
            </Badge>
          )}
        </div>

        {typedBookings.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="py-16 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Calendar size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-600 font-light text-lg">No bookings yet.</p>
                <p className="text-sm text-slate-500">
                  {typedGuide?.status === "approved"
                    ? "When travelers book with you, they'll appear here."
                    : "Complete your profile and get approved to start receiving bookings."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {typedBookings.map((booking) => {
              const statusInfo = bookingStatusConfig[booking.status];
              const startDate = new Date(booking.starts_at);
              const canRespond = booking.status === "pending";

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
                              {booking.traveler?.display_name || "Unknown Traveler"}
                            </p>
                            <Badge variant={statusInfo.variant} className="mt-1">
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 pl-13">
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
                              <span className="font-semibold">Notes:</span>{" "}
                              {booking.notes || booking.special_requests}
                            </p>
                          </div>
                        )}
                      </div>

                      {canRespond && (
                        <div className="flex gap-3 lg:flex-col">
                          <form action={updateBookingStatus} className="flex-1 lg:flex-none">
                            <input type="hidden" name="booking_id" value={booking.id} />
                            <input type="hidden" name="status" value="accepted" />
                            <Button type="submit" size="lg" className="w-full lg:w-32 gap-2">
                              <CheckCircle2 size={18} />
                              Accept
                            </Button>
                          </form>
                          <form action={updateBookingStatus} className="flex-1 lg:flex-none">
                            <input type="hidden" name="booking_id" value={booking.id} />
                            <input type="hidden" name="status" value="declined" />
                            <Button type="submit" size="lg" variant="outline" className="w-full lg:w-32 gap-2">
                              <XCircle size={18} />
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
