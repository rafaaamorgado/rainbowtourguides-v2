import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";

export default async function GuidePricingPage() {
    await requireRole("guide");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-ink">Pricing</h1>
                <p className="text-ink-soft">Set your tour rates and currency.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                    title="Pricing Configuration"
                    description="Configure your hourly rates and tour packages."
                    icon="dollar"
                />
            </div>
        </div>
    );
}
