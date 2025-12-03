import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function TravelerBookingsPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // TODO: enforce traveler-specific role when RLS is enabled.
  return (
    <div className="space-y-3 py-12">
      <h1 className="text-3xl font-semibold">Traveler bookings</h1>
      <p className="text-muted-foreground">
        Booking management placeholder — will surface upcoming trips, payments, and support threads.
      </p>
    </div>
  );
}

