'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addToast,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CancelBookingModalProps = {
  bookingId: string;
  bookingStartAt: string;
  buttonLabel?: string;
  disabled?: boolean;
  onCancelled?: () => void;
};

type CancelBookingResponse = {
  success: boolean;
  status: string;
  refundPercent: number;
  refund: {
    id: string;
    status: string | null;
    amount: number;
    currency: string;
  } | null;
};

const REFUND_POLICY_HOURS = 48;

function getHoursUntilStart(startAt: string): number {
  const startMs = new Date(startAt).getTime();
  const nowMs = Date.now();
  return (startMs - nowMs) / (1000 * 60 * 60);
}

function getRefundPercent(hoursUntilStart: number): number {
  return hoursUntilStart > REFUND_POLICY_HOURS ? 100 : 50;
}

export function CancelBookingModal({
  bookingId,
  bookingStartAt,
  buttonLabel = 'Cancel Booking',
  disabled = false,
  onCancelled,
}: CancelBookingModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hoursUntilStart = useMemo(
    () => getHoursUntilStart(bookingStartAt),
    [bookingStartAt],
  );
  const canCancel = hoursUntilStart > 0;
  const refundPercent = getRefundPercent(hoursUntilStart);

  const handleConfirmCancel = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
      });

      const data = (await response.json()) as
        | CancelBookingResponse
        | { error?: string };

      if (!response.ok) {
        const errorMessage =
          'error' in data && data.error
            ? data.error
            : 'Failed to cancel booking';
        throw new Error(errorMessage);
      }

      if (!('success' in data) || !data.success) {
        throw new Error('Failed to cancel booking');
      }

      const refundText = data.refund
        ? `${data.refundPercent}% refund initiated`
        : `${data.refundPercent}% refund policy applied`;

      addToast({
        title: 'Booking cancelled',
        description: refundText,
        color: 'success',
      });

      setIsOpen(false);
      onCancelled?.();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to cancel booking request',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="bordered"
        size="sm"
        disabled={disabled || !canCancel}
        className="w-full border-red-200 text-red-600 hover:bg-red-50"
        onClick={() => setIsOpen(true)}
      >
        {buttonLabel}
      </Button>

      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="center"
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Cancel Booking
              </ModalHeader>
              <ModalBody className="space-y-3 pb-2">
                <p className="text-sm text-foreground">
                  Are you sure you want to cancel this booking?
                </p>
                <div className="rounded-lg border bg-muted/20 p-3 text-sm">
                  <p className="font-medium">
                    Refund Policy: {refundPercent}% Refund
                  </p>
                  <p className="text-muted-foreground">
                    {refundPercent === 100
                      ? 'More than 48 hours before tour start.'
                      : 'Less than 48 hours before tour start.'}
                  </p>
                </div>
                {error && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="bordered"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Keep Booking
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleConfirmCancel}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cancelling...
                    </span>
                  ) : (
                    'Confirm Cancellation'
                  )}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
