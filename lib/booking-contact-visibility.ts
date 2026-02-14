const CONTACT_VISIBLE_STATUSES = new Set([
  'accepted',
  'approved_pending_payment',
  'approved',
  'awaiting_payment',
  'confirmed',
  'completed',
  'paid',
]);

export const HIDDEN_UNTIL_CONFIRMED = '(Hidden until booking confirmed)';

export function isBookingContactVisible(status: string): boolean {
  return CONTACT_VISIBLE_STATUSES.has(status);
}
