import type { BookingStatus } from '@/types/database';

/**
 * Canonical booking status display utilities.
 * Single source of truth for status labels and colors.
 */

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  draft: 'bg-slate-100 text-slate-600 border-slate-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  accepted: 'bg-blue-100 text-blue-700 border-blue-200',
  awaiting_payment: 'bg-purple-100 text-purple-700 border-purple-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  declined: 'bg-red-100 text-red-700 border-red-200',
  cancelled_by_traveler: 'bg-red-100 text-red-700 border-red-200',
  cancelled_by_guide: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  accepted: 'Accepted',
  awaiting_payment: 'Awaiting Payment',
  confirmed: 'Confirmed',
  declined: 'Declined',
  cancelled_by_traveler: 'Cancelled by Traveler',
  cancelled_by_guide: 'Cancelled by Guide',
  completed: 'Completed',
};

export function getStatusColor(status: string): string {
  return (
    BOOKING_STATUS_COLORS[status as BookingStatus] ||
    'bg-slate-100 text-slate-700 border-slate-200'
  );
}

export function getStatusLabel(status: string): string {
  return (
    BOOKING_STATUS_LABELS[status as BookingStatus] ||
    status.charAt(0).toUpperCase() + status.slice(1)
  );
}
