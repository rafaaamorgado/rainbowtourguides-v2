import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AdminReviewsPage() {
    await requireRole("admin");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-ink">Platform Reviews</h1>
                <p className="text-ink-soft">Moderate user reviews.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                    title="Review Moderation"
                    description="View and moderate reviews left by travelers."
                    icon="star"
                />
            </div>
        </div>
    );
}
