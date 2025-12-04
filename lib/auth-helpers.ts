import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ProfileRole, Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Returns the appropriate redirect path based on user role.
 */
export function getRedirectPathForRole(role: ProfileRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "guide":
      return "/guide/dashboard";
    case "traveler":
    default:
      return "/traveler/bookings";
  }
}

/**
 * Validates that a string is a valid ProfileRole.
 */
export function isValidRole(role: string | null | undefined): role is ProfileRole {
  return role === "traveler" || role === "guide" || role === "admin";
}

/**
 * Server-side helper: Requires an authenticated user.
 * Returns { supabase, user, profile } or redirects to /auth/sign-in.
 */
export async function requireUser(): Promise<{
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  user: { id: string; email?: string };
  profile: Profile;
}> {
  const supabase = await createSupabaseServerClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // User exists in auth but no profile - edge case, redirect to sign-in
    console.error("[requireUser] Profile not found for user:", user.id);
    redirect("/auth/sign-in");
  }

  return { supabase, user, profile };
}

/**
 * Server-side helper: Requires user to have a specific role.
 * Redirects to / if role doesn't match.
 */
export async function requireRole(requiredRole: ProfileRole): Promise<{
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  user: { id: string; email?: string };
  profile: Profile;
}> {
  const result = await requireUser();
  
  if (result.profile.role !== requiredRole) {
    redirect("/");
  }

  return result;
}

/**
 * Server-side helper: Requires user to have one of the specified roles.
 * Redirects to / if role doesn't match any.
 */
export async function requireAnyRole(allowedRoles: ProfileRole[]): Promise<{
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  user: { id: string; email?: string };
  profile: Profile;
}> {
  const result = await requireUser();
  
  if (!allowedRoles.includes(result.profile.role)) {
    redirect("/");
  }

  return result;
}

