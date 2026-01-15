import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";

export default async function GuideReviewsPage() {
    await requireRole("guide");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-ink">Reviews</h1>
                <p className="text-ink-soft">See what travelers are saying about you.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                    title="No reviews yet"
                    description="Complete tours to earn reviews from travelers."
                    icon="star"
                />
            </div>
        </div>
    );
}
