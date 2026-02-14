-- Add request-first intermediate status for guide-approved bookings
-- waiting for traveler payment.
DO $$
BEGIN
  ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'approved_pending_payment';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
