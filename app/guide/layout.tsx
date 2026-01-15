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
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  let profile = data as Profile | null;

  // Check role authorization
  // UNLOCKED FOR DEV: Mock profile if not found
  if (!profile || error) {
    // redirect("/auth/sign-in");
    profile = {
      id: "mock-guide",
      full_name: "Dev Guide",
      avatar_url: null,
      role: "guide",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email: "guide@example.com",
    } as any;
  }

  // Ensure profile is not null for following code
  if (!profile) {
    return null; // Should be unreachable in dev mode
  }
  // if (profile.role === "traveler") {
  //   redirect("/traveler/dashboard");
  // }

  // Only allow guides and admins
  // if (profile.role !== "guide" && profile.role !== "admin") {
  //   redirect("/");
  // }

  // Get guide-specific data
  const { data: guideData } = await supabase
    .from("guides")
    .select("*")
    .eq("id", user.id)
    .single();

  const guide = guideData as Guide | null;

  // Get pending bookings count
  const { count: pendingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact", head: true })
    .eq("guide_id", user.id)
    .eq("status", "pending");

  return (
    <div className="min-h-screen bg-slate-50">
      <GuideSidebar
        profile={profile}
        guide={guide}
        pendingBookingsCount={pendingCount ?? 0}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Approval Banner */}
        {guide && guide.status !== "approved" && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 m-8 mb-0 rounded-r-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="h-5 w-5 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-900 mb-1">
                  Profile Under Review
                </p>
                <p className="text-sm text-amber-800">
                  Your profile is under review. You'll be notified once approved
                  and can start accepting bookings.
                </p>
              </div>
            </div>
          </div>
        )}

        <main className="p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

