import { requireRole } from "@/lib/auth-helpers";
import { TravelerSidebar } from "./sidebar";

/**
 * Traveler layout — uses canonical requireRole helper.
 * Middleware already protects /traveler/*, so requireRole here is for:
 * 1. Getting the profile for the sidebar
 * 2. Belt-and-suspenders role check
 */
export default async function TravelerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireRole("traveler");

  return (
    <div className="min-h-screen bg-background">
      <TravelerSidebar profile={profile} />

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
