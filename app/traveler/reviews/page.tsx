import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";

export default async function TravelerReviewsPage() {
    await requireRole("traveler");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-ink">My Reviews</h1>
                <p className="text-ink-soft">Reviews you've written for guides.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                    title="No reviews written"
                    description="After you complete a tour, you can write a review for your guide here."
                    icon="star"
                />
            </div>
        </div>
    );
}
