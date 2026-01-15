import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AdminBookingsPage() {
    await requireRole("admin");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-ink">All Bookings</h1>
                <p className="text-ink-soft">Admin overview of platform bookings.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                    title="Booking Administration"
                    description="View and manage all bookings on the platform."
                    icon="calendar"
                />
            </div>
        </div>
    );
}
