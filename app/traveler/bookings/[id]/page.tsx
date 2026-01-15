import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function TravelerBookingDetailPage({ params }: PageProps) {
    await requireRole("traveler");
    const { id } = await params;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-ink">Booking Details</h1>
                <p className="text-ink-soft">Booking # {id}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                    title="Booking Details"
                    description="Detailed itinerary and status for this booking."
                    icon="calendar"
                />
            </div>
        </div>
    );
}
