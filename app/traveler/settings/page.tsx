import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";

export default async function TravelerSettingsPage() {
    await requireRole("traveler");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-ink">Settings</h1>
                <p className="text-ink-soft">Manage your account preferences.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                    title="Account Settings"
                    description="Notification preferences and account settings coming soon."
                    icon="settings"
                />
            </div>
        </div>
    );
}
