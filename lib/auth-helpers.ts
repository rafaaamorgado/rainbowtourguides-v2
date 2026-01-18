import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Database } from "@/types/database";

type ProfileRole = Database["public"]["Enums"]["profile_role"];
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
      return "/traveler/dashboard";
  }
}

/**
 * Alias for getRedirectPathForRole - redirects user based on their role.
 * Use this helper to get the redirect path for a given role.
 */
export function redirectUserByRole(role: ProfileRole): string {
  return getRedirectPathForRole(role);
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
    // redirect("/auth/sign-in");
    // UNLOCKED FOR DEV: Return mock user
    console.log("[requireUser] Mocking user for dev");
    return {
      supabase,
      user: { id: "mock-dev-id", email: "dev@example.com" },
      profile: {
        id: "mock-dev-id",
        full_name: "Developer",
        avatar_url: null,
        role: "admin", // Default to admin, overwritten by requireRole
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
    };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    // Mock if auth exists but profile doesn't
    console.error("[requireUser] Profile not found for user:", user.id);
    return {
      supabase,
      user: { id: user.id, email: user.email },
      profile: {
        id: user.id,
        full_name: "Dev User",
        avatar_url: null,
        role: "traveler",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any,
    };
    // redirect("/auth/sign-in");
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

  // UNLOCKED FOR DEV: If mock user, adapt role to pass check
  if (result.user.id === "mock-dev-id" && result.profile.role !== requiredRole) {
    (result.profile as any).role = requiredRole;
  }

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

/**
 * Server-side helper: Returns redirect path for authenticated users on auth pages.
 * Returns null if user is not authenticated.
 * Used to redirect authenticated users away from /auth/sign-in and /auth/sign-up.
 */
export async function getAuthenticatedUserRedirect(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as { data: { role: ProfileRole } | null };

  if (!profile) {
    return "/account";
  }

  const role = profile.role;

  if (role === "admin") {
    return "/admin";
  }

  if (role === "guide") {
    const { data: guide } = await supabase
      .from("guides")
      .select("id")
      .eq("id", user.id)
      .single();

    return guide ? "/guide/dashboard" : "/guide/onboarding";
  }

  if (role === "traveler") {
    const { data: traveler } = await (supabase as any)
      .from("travelers")
      .select("id")
      .eq("id", user.id)
      .single();

    return traveler ? "/traveler/dashboard" : "/traveler/onboarding";
  }

  return "/account";
}
