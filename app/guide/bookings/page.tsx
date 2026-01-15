import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";

export default async function GuideBookingsPage() {
    await requireRole("guide");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-ink">Bookings</h1>
                <p className="text-ink-soft">Manage your upcoming and past tours.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                    title="No bookings yet"
                    description="When travelers book your tours, they will appear here."
                    icon="calendar"
                />
            </div>
        </div>
    );
}
