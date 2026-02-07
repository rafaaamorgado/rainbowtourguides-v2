import { requireRole } from "@/lib/auth-helpers";

export interface GuideTimeOff {
  id: string;
  guide_id: string;
  starts_at: string; // ISO timestamptz
  ends_at: string; // ISO timestamptz
  title: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

const TABLE = "guide_time_off";

// Server-side fetch for current guide
export async function fetchGuideTimeOff(): Promise<{
  success: boolean;
  data?: GuideTimeOff[];
  error?: string;
}> {
  try {
    const { supabase, user } = await requireRole("guide");
    const db = supabase as any;
    const { data, error } = await db
      .from(TABLE)
      .select("*")
      .eq("guide_id", user.id)
      .order("starts_at", { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: (data as GuideTimeOff[]) || [] };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}

export async function createGuideTimeOff(input: {
  title: string | null;
  note?: string | null;
  starts_at: string;
  ends_at: string;
}): Promise<{ success: boolean; data?: GuideTimeOff; error?: string }> {
  try {
    const { supabase, user } = await requireRole("guide");
    const db = supabase as any;
    const { data, error } = await db
      .from(TABLE)
      .insert({
        guide_id: user.id,
        title: input.title,
        note: input.note ?? null,
        starts_at: input.starts_at,
        ends_at: input.ends_at,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as GuideTimeOff };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}

export async function updateGuideTimeOff(
  id: string,
  input: {
    title?: string | null;
    note?: string | null;
    starts_at?: string;
    ends_at?: string;
  }
): Promise<{ success: boolean; data?: GuideTimeOff; error?: string }> {
  try {
    const { supabase, user } = await requireRole("guide");
    const db = supabase as any;
    const { data, error } = await db
      .from(TABLE)
      .update({
        ...input,
      })
      .eq("id", id)
      .eq("guide_id", user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, data: data as GuideTimeOff };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}

export async function deleteGuideTimeOff(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await requireRole("guide");
    const db = supabase as any;
    const { error } = await db
      .from(TABLE)
      .delete()
      .eq("id", id)
      .eq("guide_id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}
