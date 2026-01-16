-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
-- Everyone can read basics of profiles (needed for public pages)
-- But sensitive data should be guarded. For now, public read is okay for minimal info from profiles table.
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Travelers Policies
-- Travelers can read their own data
CREATE POLICY "Travelers can view their own data"
  ON public.travelers FOR SELECT
  USING (auth.uid() = id);

-- Admins can view all travelers
CREATE POLICY "Admins can view all travelers"
  ON public.travelers FOR SELECT
  USING (public.is_admin());

-- Travelers can update their own data
CREATE POLICY "Travelers can update their own data"
  ON public.travelers FOR UPDATE
  USING (auth.uid() = id);

-- Guides Policies
-- Public read for guides (they are public listings)
CREATE POLICY "Guides are viewable by everyone"
  ON public.guides FOR SELECT
  USING (true);

-- Guides can update their own profile
CREATE POLICY "Guides can update their own profile"
  ON public.guides FOR UPDATE
  USING (auth.uid() = id);

-- Experiences Policies
-- Public read
CREATE POLICY "Experiences are viewable by everyone"
  ON public.experiences FOR SELECT
  USING (true);

-- Guides can manage their own experiences
CREATE POLICY "Guides can insert their own experiences"
  ON public.experiences FOR INSERT
  WITH CHECK (auth.uid() = guide_id);

CREATE POLICY "Guides can update their own experiences"
  ON public.experiences FOR UPDATE
  USING (auth.uid() = guide_id);

CREATE POLICY "Guides can delete their own experiences"
  ON public.experiences FOR DELETE
  USING (auth.uid() = guide_id);

-- Availability Slots Policies
-- Public read
CREATE POLICY "Availability is viewable by everyone"
  ON public.availability_slots FOR SELECT
  USING (true);

-- Guides can manage their own slots
CREATE POLICY "Guides can manage their own slots"
  ON public.availability_slots FOR ALL
  USING (auth.uid() = guide_id);

-- Bookings Policies
-- Users can see bookings they are part of
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() = traveler_id OR 
    auth.uid() = guide_id OR
    public.is_admin()
  );

-- Travelers can insert bookings
CREATE POLICY "Travelers can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = traveler_id);

-- Participants can update bookings (e.g. status changes, notes)
-- Note: finer grained control might be needed for specific columns later
CREATE POLICY "Participants can update bookings"
  ON public.bookings FOR UPDATE
  USING (
    auth.uid() = traveler_id OR 
    auth.uid() = guide_id OR
    public.is_admin()
  );

-- Messages Policies
-- Participants can view messages
CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
      AND (b.traveler_id = auth.uid() OR b.guide_id = auth.uid())
    ) OR public.is_admin()
  );

-- Participants can insert messages
CREATE POLICY "Participants can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id
      AND (b.traveler_id = auth.uid() OR b.guide_id = auth.uid())
    ) 
    AND auth.uid() = sender_id
  );

-- Reviews Policies
-- Public read for reviews (subject to double-blind logic application layer filtering or future view)
-- For now, allow public read, we'll handle hiding in UI/API logic or a separate view if needed.
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Participants can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = traveler_id OR auth.uid() = guide_id
  );

-- Admin Events Policies
-- Admin only
CREATE POLICY "Admins can view events"
  ON public.admin_events FOR SELECT
  USING (public.is_admin());

CREATE POLICY "System/Admins can insert events"
  ON public.admin_events FOR INSERT
  WITH CHECK (true); -- Allow inserts from triggers/functions, generally implicit but good to be explicit if direct insert needed.

-- Cities/Countries Policies
-- Public read
CREATE POLICY "Cities are viewable by everyone"
  ON public.cities FOR SELECT
  USING (true);

CREATE POLICY "Countries are viewable by everyone"
  ON public.countries FOR SELECT
  USING (true);
