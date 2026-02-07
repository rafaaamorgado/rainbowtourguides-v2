"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-helpers";
import { getBaseUrl } from "@/lib/url-helpers";
import type { GuideSettingsFormData } from "@/components/guide/settings-form";

export async function updateGuideSettings(
  data: GuideSettingsFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireRole("guide");
    const db = supabase as any;

    if (!data.full_name || data.full_name.trim().length < 2) {
      return { success: false, error: "Name must be at least 2 characters" };
    }

    // Update profiles: identity, privacy (is_public), notifications
    // Hide Public Profile => is_public = false
    const { error: profileError } = await db
      .from("profiles")
      .update({
        full_name: data.full_name.trim(),
        is_public: !data.hide_public_profile,
        email_notifications: data.email_notifications,
      })
      .eq("id", user.id);

    if (profileError) {
      return { success: false, error: profileError.message || "Failed to update settings" };
    }

    revalidatePath("/guide/settings");
    revalidatePath("/guide/profile");
    revalidatePath("/guide/dashboard");
    revalidatePath("/guide");

    // Revalidate public profile if guide has a slug
    const { data: guideRow } = await db.from("guides").select("slug").eq("id", user.id).single();
    if (guideRow?.slug) {
      revalidatePath(`/guides/${guideRow.slug}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function resetPasswordForGuide(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireRole("guide");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getBaseUrl()}/auth/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message || "Failed to send password reset email" };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function deleteGuideAccount(): Promise<{ success: boolean; error?: string }> {
  // Supabase does not expose deleteUser for the current user in server actions without service role.
  return {
    success: false,
    error: "Account deletion must be done from your account settings or by contacting support.",
  };
}
