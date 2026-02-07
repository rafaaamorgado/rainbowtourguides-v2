"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function resendVerificationEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });

    if (error) {
      const message =
        error.message?.toLowerCase().includes("rate limit") ||
        error.message?.toLowerCase().includes("already")
          ? "Please wait a few minutes before requesting another email."
          : error.message;
      return { success: false, error: message };
    }
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to resend email",
    };
  }
}
