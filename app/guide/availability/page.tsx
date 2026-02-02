import { requireRole } from "@/lib/auth-helpers";
import { AvailabilityForm } from "@/components/guide/availability-form";
import {
  saveAvailabilityPattern,
  blockUnavailableDate,
  unblockUnavailableDate,
} from "./actions";

export default async function GuideAvailabilityPage() {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Availability</h2>
        <p className="text-muted-foreground">
          Manage your weekly schedule and block out specific dates.
        </p>
      </div>

      <AvailabilityForm
        initialAvailabilityPattern={(guide as any)?.availability_pattern || null}
        initialUnavailableDates={unavailableDates || []}
        onSaveSchedule={saveAvailabilityPattern}
        onBlockDate={blockUnavailableDate}
        onUnblockDate={unblockUnavailableDate}
      />
    </div>
  );
}
