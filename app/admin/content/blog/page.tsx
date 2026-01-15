import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";

export default async function AdminBlogPage() {
    await requireRole("admin");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-ink">Blog Management</h1>
                <p className="text-ink-soft">Create and edit blog posts.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                    title="Blog Posts"
                    description="Manage editorial content."
                    icon="file-text"
                />
            </div>
        </div>
    );
}
