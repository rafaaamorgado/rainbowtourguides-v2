import type { BookingStatus } from '@/types/database';

/**
 * Statuses where messaging is enabled between traveler and guide.
 * Chat opens when guide accepts the booking and remains open through completion.
 * - accepted: Guide has accepted the booking request
 * - awaiting_payment: Waiting for traveler to complete payment
 * - confirmed: Payment completed, booking confirmed
 * - completed: Tour has been completed
 */
const MESSAGING_ELIGIBLE_STATUSES: BookingStatus[] = [
  'accepted',
  'awaiting_payment',
  'confirmed',
  'completed',
];

/**
 * Check if messaging is enabled for a given booking status.
 * Returns true for accepted, awaiting_payment, confirmed, and completed bookings.
 */
export function isMessagingEnabled(status: string): boolean {
  return MESSAGING_ELIGIBLE_STATUSES.includes(status as BookingStatus);
}
