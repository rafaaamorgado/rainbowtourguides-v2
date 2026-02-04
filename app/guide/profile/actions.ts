"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-helpers";
import type { GuideProfileFormData } from "@/components/guide/profile-form";

/** Update only profiles.avatar_url (e.g. after profile photo upload). Revalidates guide profile and public page. */
export async function updateProfileAvatar(
  avatarUrl: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireRole("guide");
    const db = supabase as any;

    const { error } = await db
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", user.id);

    if (error) {
      return { success: false, error: "Failed to update profile photo" };
    }

    revalidatePath("/guide/profile");
    revalidatePath("/guide");
    const { data: guideData } = await db
      .from("guides")
      .select("slug")
      .eq("id", user.id)
      .single();
    if (guideData?.slug) {
      revalidatePath(`/guides/${guideData.slug}`);
    }
    return { success: true };
  } catch {
    return { success: false, error: "An unexpected error occurred" };
  }
}

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

    // Update profiles table (shared fields)
    const { error: profileError } = await db
      .from("profiles")
      .update({
        full_name: data.display_name.trim(),
        avatar_url: data.avatar_url,
      })
      .eq("id", user.id);

    if (profileError) {
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
        tagline: data.tagline?.trim() || null,
        about: data.about?.trim() || null,
        experience_tags: data.themes.length > 0 ? data.themes : null,
        languages: data.languages.length > 0 ? data.languages : null,
        price_4h: data.base_price_4h || null,
        price_6h: data.base_price_6h || null,
        price_8h: data.base_price_8h || null,
        currency: data.currency || "EUR",
      })
      .eq("id", user.id);

    if (guideError) {
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
    return { success: false, error: "An unexpected error occurred" };
  }
}
