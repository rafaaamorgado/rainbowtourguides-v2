import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";

export default async function GuideMessagesPage() {
    await requireRole("guide");

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-ink">Messages</h1>
                <p className="text-ink-soft">Chat with travelers about your bookings.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                    title="No messages yet"
                    description="Messages from travelers will appear here."
                    icon="message"
                />
            </div>
        </div>
    );
}
