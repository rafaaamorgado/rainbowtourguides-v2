"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be signed in to update your password." };
    }

    const trimmed = newPassword.trim();
    if (trimmed.length < 6) {
      return { success: false, error: "Password must be at least 6 characters." };
    }

    const { error } = await supabase.auth.updateUser({ password: trimmed });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to update password",
    };
  }
}
