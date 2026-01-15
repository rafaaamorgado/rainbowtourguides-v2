import { requireRole } from "@/lib/auth-helpers";
import { EmptyState } from "@/components/ui/empty-state";

interface PageProps {
    params: Promise<{ threadId: string }>;
}

export default async function TravelerMessageThreadPage({ params }: PageProps) {
    await requireRole("traveler");
    const { threadId } = await params;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-ink">Message Thread</h1>
                <p className="text-ink-soft">Thread # {threadId}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[400px] flex items-center justify-center">
                <EmptyState
                    title="Conversation"
                    description="Chat history with your guide."
                    icon="message"
                />
            </div>
        </div>
    );
}
