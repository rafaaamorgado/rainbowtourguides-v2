import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";

export default async function GuideAvailabilityPage() {
    await requireRole("guide");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-ink">Availability</h1>
                <p className="text-ink-soft">Manage your calendar and blackout dates.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                    title="Calendar Settings"
                    description="Set your availability and block out dates when you are not available."
                    icon="clock"
                />
            </div>
        </div>
    );
}
