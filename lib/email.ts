import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

// Initialize Resend client
let resend: Resend | null = null;

/**
 * Helper to get user email by ID using Supabase Admin API
 * Returns null if email cannot be retrieved
 */
async function getUserEmail(userId: string): Promise<string | null> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!serviceRoleKey || !supabaseUrl) {
    // Try to get from regular client as fallback
    return null;
  }

  try {
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data, error } = await adminClient.auth.admin.getUserById(userId);
    if (error || !data?.user?.email) {
      return null;
    }
    return data.user.email;
  } catch (error) {
    console.error("[getUserEmail] Failed to get user email:", error);
    return null;
  }
}

function getResendClient(): Resend | null {
  if (resend) {
    return resend;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  if (!apiKey || !emailFrom) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[email] Resend not configured. Set RESEND_API_KEY and EMAIL_FROM in .env.local to enable emails."
      );
    }
    return null;
  }

  resend = new Resend(apiKey);
  return resend;
}

/**
 * Send email to guide when a new booking request is created
 * If guideEmail is not provided, attempts to fetch it from userId
 */
export async function sendBookingRequestEmail({
  guideEmail,
  guideUserId,
  guideName,
  travelerName,
  cityName,
  date,
  link,
}: {
  guideEmail?: string;
  guideUserId?: string;
  guideName: string;
  travelerName: string;
  cityName: string;
  date: string;
  link: string;
}): Promise<void> {
  // Get email if not provided
  let email: string | undefined = guideEmail;
  if (!email && guideUserId) {
    email = (await getUserEmail(guideUserId)) || undefined;
  }

  if (!email) {
    console.warn("[sendBookingRequestEmail] No email available for guide, skipping email");
    return;
  }
  const client = getResendClient();
  if (!client) {
    return; // No-op if Resend not configured
  }

  const emailFrom = process.env.EMAIL_FROM;
  if (!emailFrom) {
    return;
  }

  try {
    await client.emails.send({
      from: emailFrom,
      to: email,
      subject: "New booking request on Rainbow Tour Guides",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Booking Request</h2>
          <p>Hi ${guideName},</p>
          <p>You have a new booking request from ${travelerName} for a tour in ${cityName}.</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Booking</a></p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">Please log in to your dashboard to accept or decline this request.</p>
        </div>
      `,
    });
  } catch (error) {
    // Don't break the main flow if email fails
    console.error("[sendBookingRequestEmail] Failed to send email:", error);
  }
}

/**
 * Send email to traveler when booking status changes (accepted/declined)
 * If travelerEmail is not provided, attempts to fetch it from userId
 */
export async function sendBookingStatusEmail({
  travelerEmail,
  travelerUserId,
  travelerName,
  guideName,
  status,
  link,
}: {
  travelerEmail?: string;
  travelerUserId?: string;
  travelerName: string;
  guideName: string;
  status: "accepted" | "declined";
  link: string;
}): Promise<void> {
  // Get email if not provided
  let email: string | undefined = travelerEmail;
  if (!email && travelerUserId) {
    email = (await getUserEmail(travelerUserId)) || undefined;
  }

  if (!email) {
    console.warn("[sendBookingStatusEmail] No email available for traveler, skipping email");
    return;
  }
  const client = getResendClient();
  if (!client) {
    return; // No-op if Resend not configured
  }

  const emailFrom = process.env.EMAIL_FROM;
  if (!emailFrom) {
    return;
  }

  const statusText = status === "accepted" ? "accepted" : "declined";
  const statusMessage =
    status === "accepted"
      ? "Your booking request has been accepted! You can now proceed with payment."
      : "Unfortunately, your booking request has been declined.";

  try {
    await client.emails.send({
      from: emailFrom,
      to: email,
      subject: `Booking ${statusText.charAt(0).toUpperCase() + statusText.slice(1)} - Rainbow Tour Guides`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Booking Update</h2>
          <p>Hi ${travelerName},</p>
          <p>${guideName} has ${statusText} your booking request.</p>
          <p>${statusMessage}</p>
          <p><a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Booking</a></p>
        </div>
      `,
    });
  } catch (error) {
    // Don't break the main flow if email fails
    console.error("[sendBookingStatusEmail] Failed to send email:", error);
  }
}

/**
 * Send email to both traveler and guide when booking is paid
 * If emails are not provided, attempts to fetch them from userIds
 */
export async function sendBookingPaidEmail({
  travelerEmail,
  travelerUserId,
  guideEmail,
  guideUserId,
  travelerName,
  guideName,
  cityName,
  date,
  link,
}: {
  travelerEmail?: string;
  travelerUserId?: string;
  guideEmail?: string;
  guideUserId?: string;
  travelerName: string;
  guideName: string;
  cityName: string;
  date: string;
  link: string;
}): Promise<void> {
  // Get emails if not provided
  let travelerEmailFinal: string | undefined = travelerEmail;
  if (!travelerEmailFinal && travelerUserId) {
    travelerEmailFinal = (await getUserEmail(travelerUserId)) || undefined;
  }

  let guideEmailFinal: string | undefined = guideEmail;
  if (!guideEmailFinal && guideUserId) {
    guideEmailFinal = (await getUserEmail(guideUserId)) || undefined;
  }
  const client = getResendClient();
  if (!client) {
    return; // No-op if Resend not configured
  }

  const emailFrom = process.env.EMAIL_FROM;
  if (!emailFrom) {
    return;
  }

  // Send to traveler
  if (travelerEmailFinal) {
    try {
      await client.emails.send({
        from: emailFrom,
        to: travelerEmailFinal,
      subject: "Payment Confirmed - Rainbow Tour Guides",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Confirmed</h2>
          <p>Hi ${travelerName},</p>
          <p>Your payment has been confirmed for your tour with ${guideName} in ${cityName}.</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Booking</a></p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">We look forward to seeing you on your tour!</p>
        </div>
      `,
      });
    } catch (error) {
      console.error("[sendBookingPaidEmail] Failed to send email to traveler:", error);
    }
  }

  // Send to guide
  if (guideEmailFinal) {
    try {
      await client.emails.send({
        from: emailFrom,
        to: guideEmailFinal,
      subject: "Payment Received - Rainbow Tour Guides",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Received</h2>
          <p>Hi ${guideName},</p>
          <p>Payment has been confirmed for your booking with ${travelerName} in ${cityName}.</p>
          <p><strong>Date:</strong> ${date}</p>
          <p><a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Booking</a></p>
        </div>
      `,
      });
    } catch (error) {
      console.error("[sendBookingPaidEmail] Failed to send email to guide:", error);
    }
  }
}

