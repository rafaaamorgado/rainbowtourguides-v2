import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";

export default async function GuidePayoutsPage() {
    await requireRole("guide");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-ink">Payouts</h1>
                <p className="text-ink-soft">Track your earnings and payments.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                    title="No payouts yet"
                    description="Earnings from completed tours will be shown here."
                    icon="dollar"
                />
            </div>
        </div>
    );
}
