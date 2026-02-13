import { requireRole } from "@/lib/auth-helpers";
import { GuideSidebar } from "./sidebar";
import type { Database } from "@/types/database";

type Guide = Database["public"]["Tables"]["guides"]["Row"];

/**
 * Guide layout — uses canonical requireRole helper.
 * Middleware already protects /guide/*, so requireRole here is for:
 * 1. Getting the profile for the sidebar
 * 2. Belt-and-suspenders role check
 *
 * Additional queries for guide-specific sidebar data (guide record, pending count).
 */
export default async function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user, profile } = await requireRole("guide");

  // Guide-specific data for sidebar (not auth duplication)
  const [guideResult, pendingResult] = await Promise.all([
    supabase.from("guides").select("*").eq("id", user.id).single(),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("guide_id", user.id)
      .eq("status", "pending"),
  ]);

  const guide = guideResult.data as Guide | null;
  const pendingBookingsCount = pendingResult.count || 0;

  return (
    <div className="min-h-screen bg-background">
      <GuideSidebar
        profile={profile}
        guide={guide}
        pendingBookingsCount={pendingBookingsCount}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
