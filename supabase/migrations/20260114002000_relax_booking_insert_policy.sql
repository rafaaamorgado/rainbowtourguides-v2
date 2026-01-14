-- Migration: Allow any authenticated user to create bookings as themselves
-- This replaces the traveler-only restriction with a simpler auth check
-- Useful for guides to test the booking flow and for development

-- Drop existing policy
DROP POLICY IF EXISTS "Travelers can create bookings" ON bookings;

-- Create new, more permissive policy
-- Any authenticated user can create a booking where they are the traveler
CREATE POLICY "Authenticated users can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    auth.uid() = traveler_id
  );

-- Note: This allows any role (traveler, guide, admin) to create test bookings
-- In production, you may want to restrict this to travelers only by re-adding:
-- AND EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'traveler')
