import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { TravelerSidebar } from "./sidebar";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default async function TravelerLayout({
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
    redirect("/auth/sign-in?redirect=/traveler/dashboard");
  }

  // Get user profile with role
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  let profile = data as Profile | null;

  // UNLOCKED FOR DEV: Mock profile if not found
  if (!profile || error) {
    // redirect("/auth/sign-in");
    // Mock profile for dev
    profile = {
      id: "mock-traveler",
      full_name: "Dev Traveler",
      avatar_url: null,
      role: "traveler",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email: "dev@example.com",
    } as any;
  }

  // Ensure profile is not null for following code
  if (!profile) {
    return null; // Should be unreachable in dev mode
  }
  // if (profile.role === "guide") {
  //   redirect("/guide/dashboard");
  // }

  // Only allow travelers and admins
  // if (profile.role !== "traveler" && profile.role !== "admin") {
  //   redirect("/");
  // }

  return (
    <div className="min-h-screen bg-slate-50">
      <TravelerSidebar profile={profile} />

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

