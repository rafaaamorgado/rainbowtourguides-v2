import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * Standalone /messages/[id] route — redirects to role-specific thread.
 * Messaging lives under /traveler/messages/[threadId] and /guide/messages/[threadId].
 */
export default async function MessageThreadPage({ params }: PageProps) {
  const { profile } = await requireUser();
  const { id } = await params;

  if (profile.role === "guide") {
    redirect(`/guide/messages/${id}`);
  }

  redirect(`/traveler/messages/${id}`);
}
