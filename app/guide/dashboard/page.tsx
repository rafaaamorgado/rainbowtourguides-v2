import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function GuideDashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // TODO: restrict to verified guides.
  return (
    <div className="space-y-3 py-12">
      <h1 className="text-3xl font-semibold">Guide dashboard</h1>
      <p className="text-muted-foreground">Dashboard placeholder for payouts, bookings, and stats.</p>
    </div>
  );
}

