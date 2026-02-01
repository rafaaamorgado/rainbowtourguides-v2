import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";

/**
 * Standalone /messages route — redirects to role-specific inbox.
 * Messaging lives under /traveler/messages and /guide/messages.
 */
export default async function InboxPage() {
  const { profile } = await requireUser();

  if (profile.role === "guide") {
    redirect("/guide/messages");
  }

  redirect("/traveler/messages");
}
