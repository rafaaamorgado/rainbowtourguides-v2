"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-helpers";
import type { TravelerProfileFormData } from "@/components/traveler/profile-form";

export async function updateTravelerProfile(
  data: TravelerProfileFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireRole("traveler");
    // Cast supabase to any to bypass strict typing on update operations
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
        avatar_url: data.avatar_url,
        bio: data.bio?.trim() || null,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("[updateTravelerProfile] Profile update error:", profileError);
      return { success: false, error: "Failed to update profile" };
    }

    // Update travelers table
    const { error: travelerError } = await db
      .from("travelers")
      .update({
        home_country: data.home_country?.trim() || null,
        interests: data.interests.length > 0 ? data.interests : null,
        photo_urls: data.photo_urls?.length > 0 ? data.photo_urls : [],
      })
      .eq("id", user.id);

    if (travelerError) {
      console.error("[updateTravelerProfile] Traveler update error:", travelerError);
      return { success: false, error: "Failed to update traveler details" };
    }

    revalidatePath("/traveler/profile");
    revalidatePath("/traveler");

    return { success: true };
  } catch (error) {
    console.error("[updateTravelerProfile] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
