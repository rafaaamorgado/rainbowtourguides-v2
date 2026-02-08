'use server';

import { sendNewGuideApplicationEmail } from '@/lib/email';

/**
 * Server action: notify admin of a new guide application.
 * Fire-and-forget — errors are silently ignored.
 */
export async function notifyAdminNewGuide({
  guideName,
  guideEmail,
  cityName,
}: {
  guideName: string;
  guideEmail?: string;
  cityName?: string;
}) {
  try {
    await sendNewGuideApplicationEmail({ guideName, guideEmail, cityName });
  } catch {
    // Fail silently — email is non-critical
  }
}
