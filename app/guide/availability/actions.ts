"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-helpers";

export async function saveAvailabilityPattern(
  pattern: Record<string, { active: boolean; start: string; end: string }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireRole("guide");
    const db = supabase as any;

    // Update guides table with availability pattern
    const { error } = await db
      .from("guides")
      .update({
        availability_pattern: pattern,
      })
      .eq("id", user.id);

    if (error) {
      return { success: false, error: error.message || "Failed to save schedule" };
    }

    revalidatePath("/guide/availability");
    revalidatePath("/guide/dashboard");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function blockUnavailableDate(
  startDate: string,
  endDate: string
): Promise<{ success: boolean; error?: string; id?: string }> {
  try {
    const { supabase, user } = await requireRole("guide");
    const db = supabase as any;

    // Insert into guide_unavailable_dates table
    const { data, error } = await db
      .from("guide_unavailable_dates")
      .insert({
        guide_id: user.id,
        start_date: startDate,
        end_date: endDate,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message || "Failed to block date" };
    }

    revalidatePath("/guide/availability");
    revalidatePath("/guide/dashboard");

    return { success: true, id: data.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function unblockUnavailableDate(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireRole("guide");
    const db = supabase as any;

    // Delete from guide_unavailable_dates table (ensure guide owns it)
    const { error } = await db
      .from("guide_unavailable_dates")
      .delete()
      .eq("id", id)
      .eq("guide_id", user.id);

    if (error) {
      return { success: false, error: error.message || "Failed to unblock date" };
    }

    revalidatePath("/guide/availability");
    revalidatePath("/guide/dashboard");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
