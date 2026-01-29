import type { BookingStatus } from '@/types/database';

/**
 * Statuses where messaging is enabled between traveler and guide.
 * Per DOC-02: messaging opens after payment (confirmed) and remains open after completion.
 */
const MESSAGING_ELIGIBLE_STATUSES: BookingStatus[] = ['confirmed', 'completed'];

/**
 * Check if messaging is enabled for a given booking status.
 * Returns true only for 'confirmed' and 'completed' bookings.
 */
export function isMessagingEnabled(status: string): boolean {
  return MESSAGING_ELIGIBLE_STATUSES.includes(status as BookingStatus);
}
