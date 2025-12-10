-- Enable Row Level Security on all tables
-- This migration addresses Supabase Security Advisor warnings

-- ============================================================================
-- 1. COUNTRIES - Public reference data (read-only for everyone)
-- ============================================================================
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Countries are viewable by everyone"
  ON countries FOR SELECT
  USING (true);

-- ============================================================================
-- 2. CITIES - Public reference data with guide count
-- ============================================================================
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active cities are viewable by everyone"
  ON cities FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage cities"
  ON cities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 3. PROFILES - Base user profiles
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile on signup"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 4. TRAVELERS - Extended traveler profiles
-- ============================================================================
ALTER TABLE travelers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own traveler profile"
  ON travelers FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own traveler profile"
  ON travelers FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own traveler profile"
  ON travelers FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 5. GUIDES - Guide profiles (public read for approved, restricted write)
-- ============================================================================
ALTER TABLE guides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved guides are viewable by everyone"
  ON guides FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Guides can view their own profile regardless of status"
  ON guides FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Guides can update own profile"
  ON guides FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Guides can insert own profile"
  ON guides FOR INSERT
  WITH CHECK (
    auth.uid() = id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'guide'
    )
  );

CREATE POLICY "Admins can manage all guides"
  ON guides FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 6. BOOKINGS - Tour bookings (only accessible to involved parties)
-- ============================================================================
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view bookings they're involved in"
  ON bookings FOR SELECT
  USING (
    auth.uid() = traveler_id
    OR auth.uid() = guide_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Travelers can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    auth.uid() = traveler_id
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'traveler'
    )
  );

CREATE POLICY "Guides can update bookings they're assigned to"
  ON bookings FOR UPDATE
  USING (auth.uid() = guide_id)
  WITH CHECK (auth.uid() = guide_id);

CREATE POLICY "Travelers can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = traveler_id)
  WITH CHECK (auth.uid() = traveler_id);

CREATE POLICY "Admins can manage all bookings"
  ON bookings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 7. MESSAGES - Booking-related messages
-- ============================================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their bookings"
  ON messages FOR SELECT
  USING (
    auth.uid() = sender_id
    OR EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = messages.booking_id
      AND (bookings.traveler_id = auth.uid() OR bookings.guide_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their bookings"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND (bookings.traveler_id = auth.uid() OR bookings.guide_id = auth.uid())
    )
  );

-- ============================================================================
-- 8. REVIEWS - Booking reviews
-- ============================================================================
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Travelers can create reviews for their bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = traveler_id
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_id
      AND bookings.traveler_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

CREATE POLICY "Travelers can update their own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = traveler_id)
  WITH CHECK (auth.uid() = traveler_id);

CREATE POLICY "Admins can manage all reviews"
  ON reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 9. EXPERIENCES - Guide experiences
-- ============================================================================
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active experiences are viewable by everyone"
  ON experiences FOR SELECT
  USING (is_active = true);

CREATE POLICY "Guides can view their own experiences"
  ON experiences FOR SELECT
  USING (auth.uid() = guide_id);

CREATE POLICY "Guides can manage their own experiences"
  ON experiences FOR ALL
  USING (auth.uid() = guide_id)
  WITH CHECK (auth.uid() = guide_id);

CREATE POLICY "Admins can manage all experiences"
  ON experiences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 10. AVAILABILITY_SLOTS - Guide availability
-- ============================================================================
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Availability slots are viewable by everyone"
  ON availability_slots FOR SELECT
  USING (true);

CREATE POLICY "Guides can manage their own availability"
  ON availability_slots FOR ALL
  USING (auth.uid() = guide_id)
  WITH CHECK (auth.uid() = guide_id);

CREATE POLICY "Admins can manage all availability slots"
  ON availability_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 11. ADMIN_EVENTS - Admin audit log (admin-only access)
-- ============================================================================
ALTER TABLE admin_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view admin events"
  ON admin_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Only admins can create admin events"
  ON admin_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
