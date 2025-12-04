import { requireUser } from "@/lib/auth-helpers";

export default async function TravelerBookingsPage() {
  // TODO: Consider using requireAnyRole(["traveler", "admin"]) for stricter access
  const { profile } = await requireUser();

  return (
    <div className="space-y-3 py-12">
      <h1 className="text-3xl font-semibold">Your bookings</h1>
      <p className="text-sm text-muted-foreground">
        Signed in as {profile.display_name} ({profile.role})
      </p>
      <p className="text-muted-foreground">
        Booking management placeholder — will surface upcoming trips, payments, and support threads.
      </p>
    </div>
  );
}
