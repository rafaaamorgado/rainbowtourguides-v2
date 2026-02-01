import type { BookingStatus } from '@/types/database';

/**
 * Canonical booking status display utilities.
 * Single source of truth for status labels and colors.
 */

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  accepted: 'bg-blue-100 text-blue-700 border-blue-200',
  paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  completed: 'bg-slate-100 text-slate-700 border-slate-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  declined: 'bg-red-100 text-red-700 border-red-200',
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  paid: 'Paid',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
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
