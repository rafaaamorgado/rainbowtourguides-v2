"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-helpers";
import { getBaseUrl } from "@/lib/url-helpers";
import type { TravelerSettingsFormData } from "@/components/traveler/settings-form";

export async function updateTravelerSettings(
  data: TravelerSettingsFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireRole("traveler");
    const db = supabase as any;

    // Validate required fields
    if (!data.full_name || data.full_name.trim().length < 2) {
      return { success: false, error: "Name must be at least 2 characters" };
    }

    // Update profiles table
    const { error: profileError } = await db
      .from("profiles")
      .update({
        full_name: data.full_name.trim(),
        is_public: data.is_public,
        email_notifications: data.email_notifications,
      })
      .eq("id", user.id);

    if (profileError) {
      return { success: false, error: profileError.message || "Failed to update settings" };
    }

    revalidatePath("/traveler/settings");
    revalidatePath("/traveler/profile");
    revalidatePath("/traveler/dashboard");

    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}

export async function resetPasswordForTraveler(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase } = await requireRole("traveler");

    // Send password reset email
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
