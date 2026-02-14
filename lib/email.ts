import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

/** Admin notification email for new guide applications. */
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@rainbowtourguides.com";

/** Verified sender for production. Override via EMAIL_FROM env var if needed. */
const DEFAULT_EMAIL_FROM = "Rainbow Tour Guides <hello@rainbowtourguides.com>";

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
  } catch {
    return null;
  }
}

function getResendClient(): Resend | null {
  if (resend) {
    return resend;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }

  resend = new Resend(apiKey);
  return resend;
}

function getEmailFrom(): string {
  return process.env.EMAIL_FROM || DEFAULT_EMAIL_FROM;
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
    return;
  }
  const client = getResendClient();
  if (!client) {
    return; // No-op if Resend not configured
  }

  try {
    await client.emails.send({
      from: getEmailFrom(),
      to: email,
      subject: `New Booking Request from ${travelerName}`,
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
  } catch {
    // Don't break the main flow if email fails
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
    return;
  }
  const client = getResendClient();
  if (!client) {
    return; // No-op if Resend not configured
  }

  const statusText = status === "accepted" ? "accepted" : "declined";
  const statusMessage =
    status === "accepted"
      ? "Your booking request has been accepted! You can now proceed with payment."
      : "Unfortunately, your booking request has been declined.";

  try {
    await client.emails.send({
      from: getEmailFrom(),
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
  } catch {
    // Don't break the main flow if email fails
  }
}

/**
 * Send traveler payment email after a guide approves the request.
 * Includes a direct Stripe Checkout URL.
 */
export async function sendBookingApprovalPaymentEmail({
  travelerEmail,
  travelerUserId,
  travelerName,
  guideName,
  paymentLink,
}: {
  travelerEmail?: string;
  travelerUserId?: string;
  travelerName: string;
  guideName: string;
  paymentLink: string;
}): Promise<void> {
  let email: string | undefined = travelerEmail;
  if (!email && travelerUserId) {
    email = (await getUserEmail(travelerUserId)) || undefined;
  }

  if (!email) {
    return;
  }

  const client = getResendClient();
  if (!client) {
    return;
  }

  try {
    await client.emails.send({
      from: getEmailFrom(),
      to: email,
      subject: 'Your request is accepted! Click here to pay',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Request Was Accepted</h2>
          <p>Hi ${travelerName},</p>
          <p>${guideName} has accepted your booking request.</p>
          <p><strong>Your request is accepted! Click here to pay:</strong> <a href="${paymentLink}">${paymentLink}</a></p>
          <p style="margin-top: 24px;">
            <a href="${paymentLink}"
               style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Complete Payment
            </a>
          </p>
        </div>
      `,
    });
  } catch {
    // Don't break booking approval if email fails.
  }
}

/**
 * Send email to both traveler and guide when booking is confirmed (payment successful)
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

  // Send to traveler
  if (travelerEmailFinal) {
    try {
      await client.emails.send({
        from: getEmailFrom(),
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
    } catch {
      // Don't break the main flow if email fails
    }
  }

  // Send to guide
  if (guideEmailFinal) {
    try {
      await client.emails.send({
        from: getEmailFrom(),
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
    } catch {
      // Don't break the main flow if email fails
    }
  }
}

/**
 * Send "Welcome to the Team" email to guide after admin approval.
 */
export async function sendGuideApprovedEmail({
  guideUserId,
  guideName,
}: {
  guideUserId: string;
  guideName: string;
}): Promise<void> {
  const email = await getUserEmail(guideUserId);
  if (!email) return;

  const client = getResendClient();
  if (!client) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rainbowtourguides.com";

  try {
    await client.emails.send({
      from: getEmailFrom(),
      to: email,
      subject: "Welcome to Rainbow Tour Guides!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">You're Approved!</h2>
          <p>Hi ${guideName},</p>
          <p>Great news — your guide application has been <strong>approved</strong>! Your profile is now live on Rainbow Tour Guides, and travelers can start booking you.</p>
          <p>Here's what you can do next:</p>
          <ul>
            <li>Check your <a href="${siteUrl}/guide/dashboard">Dashboard</a> for new bookings</li>
            <li>Make sure your <a href="${siteUrl}/guide/availability">Availability</a> is up to date</li>
            <li>Share your profile link with potential travelers</li>
          </ul>
          <p style="margin-top: 24px;">
            <a href="${siteUrl}/guide/dashboard"
               style="display: inline-block; padding: 12px 24px; background-color: #16a34a; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Go to Dashboard
            </a>
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">Welcome to the team! If you have any questions, reply to this email.</p>
        </div>
      `,
    });
  } catch {
    // Don't break the main flow if email fails
  }
}

/**
 * Send "Application Update" email to guide after admin rejection.
 */
export async function sendGuideRejectedEmail({
  guideUserId,
  guideName,
  reason,
}: {
  guideUserId: string;
  guideName: string;
  reason?: string;
}): Promise<void> {
  const email = await getUserEmail(guideUserId);
  if (!email) return;

  const client = getResendClient();
  if (!client) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rainbowtourguides.com";
  const reasonBlock = reason
    ? `<div style="margin: 16px 0; padding: 12px 16px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;"><strong>Feedback:</strong> ${reason}</div>`
    : "";

  try {
    await client.emails.send({
      from: getEmailFrom(),
      to: email,
      subject: "Application Update - Rainbow Tour Guides",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Application Update</h2>
          <p>Hi ${guideName},</p>
          <p>Thank you for applying to be a guide on Rainbow Tour Guides. After reviewing your application, we weren't able to approve it at this time.</p>
          ${reasonBlock}
          <p>You're welcome to update your application and resubmit:</p>
          <p style="margin-top: 24px;">
            <a href="${siteUrl}/guide/onboarding"
               style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Edit & Resubmit
            </a>
          </p>
          <p style="margin-top: 30px; color: #666; font-size: 14px;">If you have questions, reply to this email and our team will be happy to help.</p>
        </div>
      `,
    });
  } catch {
    // Don't break the main flow if email fails
  }
}

/**
 * Send notification to admin when a new guide submits their application.
 * This is a fire-and-forget email — failures are silently ignored.
 */
export async function sendNewGuideApplicationEmail({
  guideName,
  guideEmail,
  cityName,
}: {
  guideName: string;
  guideEmail?: string;
  cityName?: string;
}): Promise<void> {
  const client = getResendClient();
  if (!client) {
    return; // No-op if Resend not configured
  }

  const location = cityName || "an unspecified city";

  try {
    await client.emails.send({
      from: getEmailFrom(),
      to: ADMIN_EMAIL,
      subject: `New Guide Application: ${guideName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Guide Application</h2>
          <p>A new guide has submitted their application for review.</p>
          <table style="border-collapse: collapse; width: 100%; margin-top: 16px;">
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #ddd; font-weight: bold;">Name</td>
              <td style="padding: 8px 12px; border: 1px solid #ddd;">${guideName}</td>
            </tr>
            ${guideEmail ? `<tr><td style="padding: 8px 12px; border: 1px solid #ddd; font-weight: bold;">Email</td><td style="padding: 8px 12px; border: 1px solid #ddd;">${guideEmail}</td></tr>` : ""}
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #ddd; font-weight: bold;">Location</td>
              <td style="padding: 8px 12px; border: 1px solid #ddd;">${location}</td>
            </tr>
          </table>
          <p style="margin-top: 24px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://rainbowtourguides.com"}/admin/guides"
               style="display: inline-block; padding: 12px 24px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Review Application
            </a>
          </p>
        </div>
      `,
    });
  } catch {
    // Don't break the main flow if email fails
  }
}
