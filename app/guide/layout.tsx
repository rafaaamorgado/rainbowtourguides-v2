import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { GuideSidebar } from "./sidebar";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Guide = Database["public"]["Tables"]["guides"]["Row"];

export default async function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in?redirect=/guide/dashboard");
  }

  // Get user profile with role
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as Profile | null;

  // Check if profile exists
  if (!profile || profileError) {
    redirect("/auth/sign-in");
  }

  // Redirect traveler to their dashboard
  if (profile.role === "traveler") {
    redirect("/traveler/dashboard");
  }

  // Only allow guides and admins
  if (profile.role !== "guide" && profile.role !== "admin") {
    redirect("/");
  }

  // Get guide record and pending bookings count
  const { data: guideData } = await supabase
    .from("guides")
    .select("*")
    .eq("id", user.id)
    .single();

  const guide = guideData as Guide | null;

  // Count pending bookings (if needed)
  const { count: pendingBookingsCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("guide_id", user.id)
    .eq("status", "pending");

  return (
    <div className="min-h-screen bg-slate-50">
      <GuideSidebar
        profile={profile}
        guide={guide}
        pendingBookingsCount={pendingBookingsCount || 0}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
