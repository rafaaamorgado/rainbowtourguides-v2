"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-helpers";
import type { GuideProfileFormData } from "@/components/guide/profile-form";

export async function updateGuideProfile(
  data: GuideProfileFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireRole("guide");
    // Cast supabase to any to bypass strict typing on update operations
    const db = supabase as any;

    // Validate required fields
    if (!data.display_name || data.display_name.trim().length < 2) {
      return { success: false, error: "Name must be at least 2 characters" };
    }

    if (!data.city_id) {
      return { success: false, error: "Please select a city" };
    }

    const taglinePayload = JSON.stringify({
      tagline: data.tagline || null,
      highlights: data.highlights || [],
      meeting_location_label: data.meeting_location_label || null,
      max_group_size: data.max_group_size || null,
    });

    // Update profiles table (shared fields)
    const { error: profileError } = await db
      .from("profiles")
      .update({
        full_name: data.display_name.trim(),
        avatar_url: data.avatar_url,
        languages: data.languages && data.languages.length > 0 ? data.languages : null,
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("[updateGuideProfile] Profile update error:", profileError);
      return { success: false, error: "Failed to update profile" };
    }

    // Get guide's slug for revalidation
    const { data: guideData } = await db
      .from("guides")
      .select("slug")
      .eq("id", user.id)
      .single();

    // Update guides table
    const { error: guideError } = await db
      .from("guides")
      .update({
        bio: data.bio?.trim() || null,
        city_id: data.city_id,
        tagline: taglinePayload,
        headline: data.headline?.trim() || null,
        about: data.about?.trim() || null,
        themes: data.themes.length > 0 ? data.themes : null,
        languages: data.languages && data.languages.length > 0 ? data.languages : null,
        base_price_4h: data.base_price_4h || null,
        base_price_6h: data.base_price_6h || null,
        base_price_8h: data.base_price_8h || null,
        currency: data.currency || "USD",
      })
      .eq("id", user.id);

    if (guideError) {
      console.error("[updateGuideProfile] Guide update error:", guideError);
      return { success: false, error: "Failed to update guide details" };
    }

    // Revalidate profile page
    revalidatePath("/guide/profile");
    revalidatePath("/guide");

    // Also revalidate public profile if slug exists
    if (guideData?.slug) {
      revalidatePath(`/guides/${guideData.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("[updateGuideProfile] Unexpected error:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
