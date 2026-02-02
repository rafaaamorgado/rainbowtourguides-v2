"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-helpers";
import type { TravelerProfileFormData } from "@/components/traveler/profile-form";

export async function updateTravelerProfile(
  data: TravelerProfileFormData
): Promise<{ success: boolean; error?: string }> {
  console.log("🔵 [updateTravelerProfile] Called with data:", data);
  
  try {
    const { supabase, user } = await requireRole("traveler");
    console.log("🔵 [updateTravelerProfile] User ID:", user.id);
    
    // Cast supabase to any to bypass strict typing on update operations
    const db = supabase as any;

    // Validate required fields
    if (!data.full_name || data.full_name.trim().length < 2) {
      console.log("❌ [updateTravelerProfile] Validation failed: name too short");
      return { success: false, error: "Name must be at least 2 characters" };
    }

    // Update profiles table with all traveler-specific fields
    const updateData: any = {
      full_name: data.full_name.trim(),
      bio: data.bio?.trim() || null,
      pronouns: data.pronouns?.trim() || null,
      country_of_origin: data.country_of_origin?.trim() || null,
      languages: data.languages && data.languages.length > 0 ? data.languages : null,
    };

    // Only include avatar_url if it's provided (skip photo upload for now)
    if (data.avatar_url !== undefined) {
      updateData.avatar_url = data.avatar_url;
    }

    console.log("🔵 [updateTravelerProfile] Updating with data:", updateData);
    console.log("🔵 [updateTravelerProfile] Updating user ID:", user.id);

    const { data: updatedProfile, error: profileError } = await db
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single();

    if (profileError) {
      console.error("❌ [updateTravelerProfile] Database error:", profileError);
      return { success: false, error: profileError.message || "Failed to update profile" };
    }

    console.log("✅ [updateTravelerProfile] Profile updated successfully:", updatedProfile);

    // Update travelers table with interests
    const travelerUpdateData: any = {
      interests: data.interests && data.interests.length > 0 ? data.interests : null,
    };

    console.log("🔵 [updateTravelerProfile] Updating travelers with data:", travelerUpdateData);

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
        console.error("❌ [updateTravelerProfile] Traveler update error:", travelerError);
        // Don't fail the whole operation if traveler update fails
      } else {
        console.log("✅ [updateTravelerProfile] Traveler interests updated successfully");
      }
    } else {
      // Create new traveler record
      const { error: travelerError } = await db
        .from("travelers")
        .insert({
          id: user.id,
          ...travelerUpdateData,
        });

      if (travelerError) {
        console.error("❌ [updateTravelerProfile] Traveler insert error:", travelerError);
        // Don't fail the whole operation if traveler insert fails
      } else {
        console.log("✅ [updateTravelerProfile] Traveler record created successfully");
      }
    }

    revalidatePath("/traveler/profile");
    revalidatePath("/traveler/dashboard");
    revalidatePath("/traveler");

    console.log("✅ [updateTravelerProfile] Paths revalidated");

    return { success: true };
  } catch (error) {
    console.error("❌ [updateTravelerProfile] Unexpected error:", error);
    return { success: false, error: error instanceof Error ? error.message : "An unexpected error occurred" };
  }
}
