import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function GuideOnboardingPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  // TODO: enforce guide-only access once role-based onboarding is ready.
  return (
    <div className="space-y-3 py-12">
      <h1 className="text-3xl font-semibold">Guide onboarding</h1>
      <p className="text-muted-foreground">
        Onboarding placeholder to collect verification, Stripe Connect details, and availability.
      </p>
    </div>
  );
}

