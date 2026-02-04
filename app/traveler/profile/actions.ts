"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-helpers";
import type { TravelerProfileFormData } from "@/components/traveler/profile-form";

export async function updateTravelerProfile(
  data: TravelerProfileFormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireRole("traveler");
    const db = supabase as any;

    if (!data.full_name || data.full_name.trim().length < 2) {
      return { success: false, error: "Name must be at least 2 characters" };
    }

    const updateData: any = {
      full_name: data.full_name.trim(),
      bio: data.bio?.trim() || null,
      pronouns: data.pronouns?.trim() || null,
      country_of_origin: data.country_of_origin?.trim() || null,
      languages: data.languages?.length ? data.languages : null,
    };
    if (data.avatar_url !== undefined) {
      updateData.avatar_url = data.avatar_url;
    }

    const { error: profileError } = await db
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (profileError) {
      return { success: false, error: profileError.message || "Failed to update profile" };
    }

    const travelerUpdateData: any = {
      interests: data.interests?.length ? data.interests : null,
    };

    // Check if traveler record exists, if not create it
    const { data: existingTraveler } = await db
      .from("travelers")
      .select("id")
      .eq("id", user.id)
      .single();

    if (existingTraveler) {
      // Update existing traveler record
      const { error: travelerError } = await db
        .from("travelers")
        .update(travelerUpdateData)
        .eq("id", user.id);

      if (travelerError) {
        // Don't fail the whole operation if traveler update fails
      }
    } else {
      await db.from("travelers").insert({ id: user.id, ...travelerUpdateData });
    }

    revalidatePath("/traveler/profile");
    revalidatePath("/traveler/dashboard");
    revalidatePath("/traveler");
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}
