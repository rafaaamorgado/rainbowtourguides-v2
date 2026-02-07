"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getBaseUrl } from "@/lib/url-helpers";

export async function sendPasswordResetEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const redirectTo = `${getBaseUrl()}/auth/callback?next=/auth/update-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to send reset email",
    };
  }
}
