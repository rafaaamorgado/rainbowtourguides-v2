import { revalidatePath } from "next/cache";
import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Database, GuideStatus, BookingStatus, ProfileRole } from "@/types/database";

type Guide = Database["public"]["Tables"]["guides"]["Row"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type GuideWithDetails = Guide & {
  profile: { display_name: string } | null;
  city: { name: string } | null;
};

type BookingWithDetails = Booking & {
  traveler: { display_name: string } | null;
  guide: { display_name: string } | null;
  city: { name: string } | null;
};

type AdminPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

const guideStatusConfig: Record<GuideStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  pending: { label: "Pending", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
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

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { supabase, profile } = await requireRole("admin");
  const params = await searchParams;
  const activeTab = params.tab || "guides";

  // Load guides with profiles and cities
  const { data: guides } = await supabase
    .from("guides")
    .select(`
      *,
      profile:id(display_name),
      city:city_id(name)
    `)
    .order("created_at", { ascending: false });

  // Load recent bookings (last 50)
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      traveler:traveler_id(display_name),
      guide:guide_id(display_name),
      city:city_id(name)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  // Load all users
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const typedGuides = (guides ?? []) as GuideWithDetails[];
  const typedBookings = (bookings ?? []) as BookingWithDetails[];
  const typedUsers = (users ?? []) as Profile[];

  // Server action: Update guide status
  async function updateGuideStatus(formData: FormData): Promise<void> {
    "use server";

    const { supabase } = await requireRole("admin");
    const guideId = formData.get("guide_id") as string;
    const newStatus = formData.get("status") as GuideStatus;

    if (!guideId || !newStatus) return;

    const guideUpdate: Database["public"]["Tables"]["guides"]["Update"] = {
      status: newStatus,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("guides")
      .update(guideUpdate)
      .eq("id", guideId);

    revalidatePath("/admin");
  }

  // Server action: Update booking status
  async function updateBookingStatus(formData: FormData): Promise<void> {
    "use server";

    const { supabase } = await requireRole("admin");
    const bookingId = formData.get("booking_id") as string;
    const newStatus = formData.get("status") as BookingStatus;

    if (!bookingId || !newStatus) return;

    const bookingUpdate: Database["public"]["Tables"]["bookings"]["Update"] = {
      status: newStatus,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("bookings")
      .update(bookingUpdate)
      .eq("id", bookingId);

    revalidatePath("/admin");
  }

  // Server action: Update user role
  async function updateUserRole(formData: FormData): Promise<void> {
    "use server";

    const { supabase } = await requireRole("admin");
    const userId = formData.get("user_id") as string;
    const newRole = formData.get("role") as ProfileRole;

    if (!userId || !newRole) return;

    const profileUpdate: Database["public"]["Tables"]["profiles"]["Update"] = {
      role: newRole,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("profiles")
      .update(profileUpdate)
      .eq("id", userId);

    revalidatePath("/admin");
  }

  return (
    <div className="py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">Admin Console</h1>
        <p className="text-muted-foreground mt-1">
          Logged in as {profile.display_name}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          asChild
          variant={activeTab === "guides" ? "default" : "ghost"}
        >
          <Link href="/admin?tab=guides">Guides</Link>
        </Button>
        <Button
          asChild
          variant={activeTab === "bookings" ? "default" : "ghost"}
        >
          <Link href="/admin?tab=bookings">Bookings</Link>
        </Button>
        <Button
          asChild
          variant={activeTab === "users" ? "default" : "ghost"}
        >
          <Link href="/admin?tab=users">Users</Link>
        </Button>
      </div>

      {/* Guides Tab */}
      {activeTab === "guides" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Guides Management</h2>
            <p className="text-sm text-muted-foreground">
              {typedGuides.length} total guides
            </p>
          </div>

          {typedGuides.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No guides found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {typedGuides.map((guide) => {
                const statusInfo = guideStatusConfig[guide.status];
                const createdDate = new Date(guide.created_at);

                return (
                  <Card key={guide.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">
                              {guide.profile?.display_name || "Unknown"}
                            </p>
                            <Badge variant={statusInfo.variant}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {guide.city?.name || "No city"} •{" "}
                            {guide.hourly_rate ? `$${guide.hourly_rate}/hr` : "No rate"} •{" "}
                            Joined {createdDate.toLocaleDateString()}
                          </p>
                          {guide.headline && (
                            <p className="text-sm text-muted-foreground italic">
                              {guide.headline}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {guide.status !== "approved" && (
                            <form action={updateGuideStatus}>
                              <input type="hidden" name="guide_id" value={guide.id} />
                              <input type="hidden" name="status" value="approved" />
                              <Button type="submit" size="sm" variant="default">
                                Approve
                              </Button>
                            </form>
                          )}
                          {guide.status !== "rejected" && (
                            <form action={updateGuideStatus}>
                              <input type="hidden" name="guide_id" value={guide.id} />
                              <input type="hidden" name="status" value="rejected" />
                              <Button type="submit" size="sm" variant="destructive">
                                Reject
                              </Button>
                            </form>
                          )}
                          {guide.status !== "pending" && (
                            <form action={updateGuideStatus}>
                              <input type="hidden" name="guide_id" value={guide.id} />
                              <input type="hidden" name="status" value="pending" />
                              <Button type="submit" size="sm" variant="outline">
                                Reset
                              </Button>
                            </form>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Bookings Management</h2>
            <p className="text-sm text-muted-foreground">
              {typedBookings.length} recent bookings
            </p>
          </div>

          {typedBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No bookings found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {typedBookings.map((booking) => {
                const statusInfo = bookingStatusConfig[booking.status];
                const startDate = new Date(booking.starts_at);

                return (
                  <Card key={booking.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {booking.traveler?.display_name || "Unknown"} →{" "}
                                {booking.guide?.display_name || "Unknown"}
                              </p>
                              <Badge variant={statusInfo.variant}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {booking.city?.name || "Unknown city"} •{" "}
                              {startDate.toLocaleDateString("en-US", {
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
                            <p className="text-sm text-muted-foreground">
                              {booking.duration_hours}h •{" "}
                              {booking.currency || "USD"} {booking.price_total}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground self-center">
                            Override status:
                          </p>
                          {(["pending", "accepted", "confirmed", "declined", "cancelled", "paid"] as BookingStatus[]).map(
                            (status) => (
                              <form key={status} action={updateBookingStatus}>
                                <input type="hidden" name="booking_id" value={booking.id} />
                                <input type="hidden" name="status" value={status} />
                                <Button
                                  type="submit"
                                  size="sm"
                                  variant={booking.status === status ? "default" : "outline"}
                                  disabled={booking.status === status}
                                >
                                  {status}
                                </Button>
                              </form>
                            )
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Users Management</h2>
            <p className="text-sm text-muted-foreground">
              {typedUsers.length} total users
            </p>
          </div>

          {typedUsers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No users found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {typedUsers.map((user) => {
                const createdDate = new Date(user.created_at);

                return (
                  <Card key={user.id}>
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{user.display_name}</p>
                              <Badge
                                variant={
                                  user.role === "admin"
                                    ? "default"
                                    : user.role === "guide"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {user.role}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ID: {user.id.substring(0, 8)}... •{" "}
                              Joined {createdDate.toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground self-center">
                            Change role:
                          </p>
                          {(["traveler", "guide", "admin"] as ProfileRole[]).map((role) => (
                            <form key={role} action={updateUserRole}>
                              <input type="hidden" name="user_id" value={user.id} />
                              <input type="hidden" name="role" value={role} />
                              <Button
                                type="submit"
                                size="sm"
                                variant={user.role === role ? "default" : "outline"}
                                disabled={user.role === role}
                              >
                                {role}
                              </Button>
                            </form>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
