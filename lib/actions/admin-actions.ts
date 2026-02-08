'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth-helpers';
import { sendGuideApprovedEmail, sendGuideRejectedEmail } from '@/lib/email';
import type { BookingStatus } from '@/types/database';

// ============================================================================
// Guide Verification Actions
// ============================================================================

/**
 * Approve a guide application.
 * Updates status to 'approved', sets is_verified + approved flags,
 * records the reviewer, and sends a welcome email.
 */
export async function approveGuide(guideId: string): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await requireRole('admin');

  // Fetch guide + profile name for the email
  const { data: guide, error: fetchError } = await (supabase as any)
    .from('guides')
    .select('id, status, profile:profiles!guides_id_fkey(full_name)')
    .eq('id', guideId)
    .single();

  if (fetchError || !guide) {
    return { success: false, error: 'Guide not found' };
  }

  const { error: updateError } = await (supabase as any)
    .from('guides')
    .update({
      status: 'approved',
      approved: true,
      is_verified: true,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', guideId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Send welcome email (fire-and-forget)
  try {
    await sendGuideApprovedEmail({
      guideUserId: guideId,
      guideName: guide.profile?.full_name || 'Guide',
    });
  } catch {
    // Non-critical
  }

  revalidatePath('/admin/guides');
  revalidatePath(`/admin/guides/${guideId}`);
  revalidatePath('/guides');
  return { success: true };
}

/**
 * Reject a guide application.
 * Updates status to 'rejected', saves admin_notes,
 * records the reviewer, and sends a rejection email.
 */
export async function rejectGuide(
  guideId: string,
  reason: string,
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await requireRole('admin');

  // Fetch guide + profile name for the email
  const { data: guide, error: fetchError } = await (supabase as any)
    .from('guides')
    .select('id, status, profile:profiles!guides_id_fkey(full_name)')
    .eq('id', guideId)
    .single();

  if (fetchError || !guide) {
    return { success: false, error: 'Guide not found' };
  }

  const { error: updateError } = await (supabase as any)
    .from('guides')
    .update({
      status: 'rejected',
      approved: false,
      admin_notes: reason || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', guideId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Send rejection email (fire-and-forget)
  try {
    await sendGuideRejectedEmail({
      guideUserId: guideId,
      guideName: guide.profile?.full_name || 'Guide',
      reason: reason || undefined,
    });
  } catch {
    // Non-critical
  }

  revalidatePath('/admin/guides');
  revalidatePath(`/admin/guides/${guideId}`);
  return { success: true };
}

/**
 * Suspend / hide a guide profile.
 * Sets status to 'draft' and approved to false, immediately removing
 * them from public listings. Optionally records a reason in admin_notes.
 */
export async function suspendGuide(
  guideId: string,
  reason?: string,
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await requireRole('admin');

  const updatePayload: Record<string, any> = {
    status: 'draft',
    approved: false,
    is_verified: false,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (reason) {
    updatePayload.admin_notes = reason;
  }

  const { error: updateError } = await (supabase as any)
    .from('guides')
    .update(updatePayload)
    .eq('id', guideId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath('/admin/guides');
  revalidatePath(`/admin/guides/${guideId}`);
  return { success: true };
}

/**
 * Unsuspend / restore a guide profile back to approved status.
 */
export async function unsuspendGuide(
  guideId: string,
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await requireRole('admin');

  const { error: updateError } = await (supabase as any)
    .from('guides')
    .update({
      status: 'approved',
      approved: true,
      is_verified: true,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', guideId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath('/admin/guides');
  revalidatePath(`/admin/guides/${guideId}`);
  return { success: true };
}

// ============================================================================
// Booking Override Actions
// ============================================================================

const VALID_BOOKING_STATUSES: BookingStatus[] = [
  'draft',
  'pending',
  'accepted',
  'awaiting_payment',
  'confirmed',
  'declined',
  'cancelled_by_traveler',
  'cancelled_by_guide',
  'completed',
];

/**
 * Admin override: force-change a booking status.
 */
export async function adminOverrideBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
): Promise<{ success: boolean; error?: string }> {
  const { supabase, user } = await requireRole('admin');

  if (!VALID_BOOKING_STATUSES.includes(newStatus)) {
    return { success: false, error: `Invalid status: ${newStatus}` };
  }

  const { error: updateError } = await (supabase as any)
    .from('bookings')
    .update({
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath('/admin/bookings');
  return { success: true };
}
