import { requireRole } from "./auth-helpers";

export type AvailabilityPattern = Record<string, { active: boolean; start: string; end: string }> | null;

export interface UnavailableDate {
  id: string;
  start_date: string;
  end_date: string;
}

export interface GuideAvailabilityData {
  availabilityPattern: AvailabilityPattern;
  unavailableDates: UnavailableDate[];
}

// Server-side data loader for the guide availability page.
export async function getGuideAvailability(): Promise<GuideAvailabilityData> {
  const { supabase, user } = await requireRole("guide");

  // Fetch guide record with availability pattern
  const { data: guide } = await supabase
    .from("guides")
    .select("availability_pattern")
    .eq("id", user.id)
    .single();

  // Fetch unavailable dates
  const { data: unavailableDates } = await supabase
    .from("guide_unavailable_dates")
    .select("id, start_date, end_date")
    .eq("guide_id", user.id)
    .order("start_date", { ascending: true });

  return {
    availabilityPattern: (guide as any)?.availability_pattern ?? null,
    unavailableDates: unavailableDates || [],
  };
}
