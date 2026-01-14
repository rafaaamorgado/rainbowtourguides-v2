import { redirect } from "next/navigation";
import Link from "next/link";
import { Calendar, DollarSign, Star, Clock, MapPin, User, ArrowRight } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type Guide = Database["public"]["Tables"]["guides"]["Row"];

export default async function GuideDashboardPage() {
  const { supabase, user, profile } = await requireRole("guide");

  // Check if guide has completed onboarding
  const { data: guide } = await supabase
    .from("guides")
    .select("*")
    .eq("id", user.id)
    .single() as { data: Guide | null };

  if (!guide) {
    redirect("/guide/onboarding");
  }

  // Get guide's city info
  const { data: city } = await supabase
    .from("cities")
    .select("name, country_name")
    .eq("id", guide.city_id)
    .single();

  // Get bookings for this guide
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, profiles!bookings_traveler_id_fkey(display_name)")
    .eq("guide_id", user.id)
    .order("created_at", { ascending: false }) as { data: (Booking & { profiles: { display_name: string } | null })[] | null };

  const allBookings = bookings || [];

  // Calculate stats
  const pendingBookings = allBookings.filter((b) => b.status === "pending");
  const upcomingBookings = allBookings.filter(
    (b) =>
      (b.status === "confirmed" || b.status === "accepted") &&
      new Date(b.starts_at) >= new Date()
  );
  const completedBookings = allBookings.filter((b) => b.status === "completed");

  // Get reviews for this guide
  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating")
    .eq("guide_id", user.id) as { data: { rating: number }[] | null };

  const avgRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  // Calculate total earnings from completed bookings
  const totalEarnings = completedBookings.reduce(
    (sum, b) => sum + parseFloat(b.price_total || "0"),
    0
  );

  // Show max 5 recent bookings
  const recentBookings = allBookings.slice(0, 5);

  // Check guide status
  const isPending = guide.status === "pending";
  const isRejected = guide.status === "rejected";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink mb-2">Dashboard</h1>
        <p className="text-ink-soft">
          Welcome back, {profile.full_name}
        </p>
      </div>

      {/* Status Banner */}
      {isPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-900">Profile Under Review</h3>
              <p className="text-amber-700 text-sm mt-1">
                Your guide profile is being reviewed by our team. This usually takes 24-48 hours.
                You'll be notified once approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Profile Not Approved</h3>
              <p className="text-red-700 text-sm mt-1">
                Unfortunately, your profile wasn't approved. Please update your profile and resubmit for review.
              </p>
              <Link href="/guide/onboarding">
                <Button variant="outline" size="sm" className="mt-3">
                  Update Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-ink">{pendingBookings.length}</p>
            <p className="text-sm text-ink-soft mt-1">Pending Requests</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-ink">{upcomingBookings.length}</p>
            <p className="text-sm text-ink-soft mt-1">Upcoming Tours</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-ink">
              ${totalEarnings.toLocaleString()}
            </p>
            <p className="text-sm text-ink-soft mt-1">Total Earnings</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-ink">{avgRating || "—"}</p>
            <p className="text-sm text-ink-soft mt-1">
              {reviews && reviews.length > 0
                ? `Average Rating (${reviews.length} reviews)`
                : "No reviews yet"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-ink mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/guide/bookings"
            className="p-4 border border-slate-200 rounded-xl hover:border-brand hover:bg-brand/5 transition-all group"
          >
            <Calendar className="h-6 w-6 text-brand mb-2" />
            <p className="font-medium text-ink group-hover:text-brand">
              View Bookings
            </p>
            <p className="text-sm text-ink-soft mt-1">
              Manage your tour requests
            </p>
          </Link>

          <Link
            href="/guide/profile"
            className="p-4 border border-slate-200 rounded-xl hover:border-brand hover:bg-brand/5 transition-all group"
          >
            <User className="h-6 w-6 text-brand mb-2" />
            <p className="font-medium text-ink group-hover:text-brand">
              Edit Profile
            </p>
            <p className="text-sm text-ink-soft mt-1">
              Update your guide profile
            </p>
          </Link>

          <Link
            href="/guide/availability"
            className="p-4 border border-slate-200 rounded-xl hover:border-brand hover:bg-brand/5 transition-all group"
          >
            <Clock className="h-6 w-6 text-brand mb-2" />
            <p className="font-medium text-ink group-hover:text-brand">
              Set Availability
            </p>
            <p className="text-sm text-ink-soft mt-1">
              Manage your schedule
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Activity / Bookings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-ink">Recent Bookings</h2>
          {allBookings.length > 5 && (
            <Link
              href="/guide/bookings"
              className="text-brand hover:text-brand-dark flex items-center gap-1 text-sm font-medium"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>

        {recentBookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            description="Once your profile is approved and travelers book tours with you, they'll appear here."
            icon="calendar"
            variant="minimal"
          />
        ) : (
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                    booking.status === "pending" && "bg-amber-100",
                    booking.status === "confirmed" && "bg-emerald-100",
                    booking.status === "accepted" && "bg-blue-100",
                    booking.status === "completed" && "bg-slate-100",
                    booking.status === "cancelled" && "bg-red-100"
                  )}
                >
                  <Calendar
                    className={cn(
                      "h-5 w-5",
                      booking.status === "pending" && "text-amber-600",
                      booking.status === "confirmed" && "text-emerald-600",
                      booking.status === "accepted" && "text-blue-600",
                      booking.status === "completed" && "text-slate-600",
                      booking.status === "cancelled" && "text-red-600"
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-ink font-medium truncate">
                      {(booking as any).profiles?.display_name || "Traveler"}
                    </p>
                    <Badge
                      className={cn(
                        "text-xs capitalize",
                        booking.status === "pending" && "bg-amber-100 text-amber-700 border-0",
                        booking.status === "confirmed" && "bg-emerald-100 text-emerald-700 border-0",
                        booking.status === "accepted" && "bg-blue-100 text-blue-700 border-0",
                        booking.status === "completed" && "bg-slate-100 text-slate-700 border-0",
                        booking.status === "cancelled" && "bg-red-100 text-red-700 border-0"
                      )}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-ink-soft mt-1">
                    {new Date(booking.starts_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    • {booking.duration_hours || 4} hours • ${booking.price_total}
                  </p>
                </div>
                <Link href={`/guide/bookings/${booking.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* No Reviews Yet CTA */}
      {(!reviews || reviews.length === 0) && completedBookings.length === 0 && (
        <div className="bg-gradient-to-br from-pride-lilac/20 to-pride-mint/20 rounded-2xl p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto shadow-sm">
              <Star className="h-8 w-8 text-brand" />
            </div>
            <h3 className="text-xl font-bold text-ink">Build Your Reputation</h3>
            <p className="text-ink-soft">
              Complete tours to start receiving reviews. Great reviews help you attract more travelers!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
