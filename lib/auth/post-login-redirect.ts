import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfilePick = Pick<ProfileRow, "role" | "full_name" | "avatar_url">;
type ProfileRole = ProfileRow["role"];
type GuideRow = Database["public"]["Tables"]["guides"]["Row"];
type GuidePick = Pick<GuideRow, "status">;

type PostLoginRedirectResult = {
  userId: string | null;
  role: ProfileRole | null;
  path: string | null;
};

export async function getPostLoginRedirect(): Promise<PostLoginRedirectResult> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, role: null, path: null };
  }

  const { data: profileRaw } = await supabase
    .from("profiles")
    .select("role, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (profileRaw as ProfilePick | null) ?? null;
  const role: ProfileRole | null = profile?.role ?? null;

  if (role === "traveler") {
    const isComplete = Boolean(profile?.full_name);
    return {
      userId: user.id,
      role,
      path: isComplete ? "/traveler/dashboard" : "/traveler/onboarding",
    };
  }

  if (role === "guide") {
    const { data: guideRaw } = await supabase
      .from("guides")
      .select("status")
      .eq("id", user.id)
      .maybeSingle();

    const guideRecord = (guideRaw as GuidePick | null) ?? null;
    const isComplete = Boolean(guideRecord?.status);
    return {
      userId: user.id,
      role,
      path: isComplete ? "/guide/dashboard" : "/guide/onboarding",
    };
  }

  // Fallback for unknown role
  return { userId: user.id, role, path: "/account" };
}

/**
 * Redirect immediately if a post-login path is available.
 * Returns true if redirected; false otherwise.
 */
export async function redirectIfPostLoginPath(): Promise<boolean> {
  const { path } = await getPostLoginRedirect();
  if (path) {
    redirect(path);
    return true;
  }
  return false;
}
