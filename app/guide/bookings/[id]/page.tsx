import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function GuideBookingDetailPage({ params }: PageProps) {
    await requireRole("guide");
    const { id } = await params;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-ink">Booking Request</h1>
                <p className="text-ink-soft">Booking # {id}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                    title="Booking Details"
                    description="Traveler details and itinerary."
                    icon="calendar"
                />
            </div>
        </div>
    );
}
