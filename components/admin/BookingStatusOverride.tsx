'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Loader2, ChevronDown, Check } from 'lucide-react';
import { adminOverrideBookingStatus } from '@/lib/actions/admin-actions';
import type { BookingStatus } from '@/types/database';

const STATUSES: { value: BookingStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'bg-slate-100 text-slate-700' },
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800' },
  { value: 'accepted', label: 'Accepted', color: 'bg-blue-100 text-blue-800' },
  { value: 'awaiting_payment', label: 'Awaiting Payment', color: 'bg-violet-100 text-violet-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'declined', label: 'Declined', color: 'bg-red-100 text-red-700' },
  { value: 'cancelled_by_traveler', label: 'Cancelled (Traveler)', color: 'bg-red-100 text-red-700' },
  { value: 'cancelled_by_guide', label: 'Cancelled (Guide)', color: 'bg-red-100 text-red-700' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
];

export function BookingStatusOverride({
  bookingId,
  currentStatus,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentCfg = STATUSES.find((s) => s.value === currentStatus) || STATUSES[0];

  const handleChange = async (newStatus: BookingStatus) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    if (!confirm(`Change booking status to "${newStatus}"?`)) return;

    setIsUpdating(true);
    const result = await adminOverrideBookingStatus(bookingId, newStatus);

    if (!result.success) {
      alert(result.error || 'Failed to update status');
    }

    setIsUpdating(false);
    setIsOpen(false);
    router.refresh();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 transition-colors"
      >
        {isUpdating ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Badge variant="secondary" className={cn('text-xs', currentCfg.color)}>
            {currentCfg.label}
          </Badge>
        )}
        <ChevronDown className="h-3 w-3 text-ink-soft" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => handleChange(s.value)}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 transition-colors',
                  s.value === currentStatus && 'bg-slate-50',
                )}
              >
                <Badge variant="secondary" className={cn('text-xs', s.color)}>
                  {s.label}
                </Badge>
                {s.value === currentStatus && (
                  <Check className="h-3 w-3 text-emerald-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
