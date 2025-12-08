-- Migration: Align bookings.traveler_id FK to reference profiles instead of travelers
-- Non-destructive: changes FK constraint only, all existing data remains valid
-- Run: supabase db execute --file supabase/migrations/20251208_align_bookings_traveler_fk.sql

-- ============================================================================
-- BOOKINGS: Change traveler_id FK from travelers to profiles
-- ============================================================================
-- This is safe because travelers.id already references profiles.id,
-- so all existing traveler_id values are valid profile.id values

-- Drop the existing foreign key constraint
-- PostgreSQL auto-generates constraint names as: table_column_fkey
ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_traveler_id_fkey;

-- Add new foreign key constraint pointing to profiles
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_traveler_id_fkey
    FOREIGN KEY (traveler_id)
    REFERENCES public.profiles(id)
    ON DELETE RESTRICT;

