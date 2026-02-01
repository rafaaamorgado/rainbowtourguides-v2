-- Create booking_reads table for tracking read status
CREATE TABLE IF NOT EXISTS public.booking_reads (
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_read_message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  PRIMARY KEY (booking_id, user_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_booking_reads_booking_id ON public.booking_reads(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_reads_user_id ON public.booking_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_reads_last_read_at ON public.booking_reads(last_read_at);

-- Enable Row Level Security
ALTER TABLE public.booking_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can read booking_reads for bookings they participate in
CREATE POLICY "Users can read booking_reads for their bookings"
  ON public.booking_reads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_reads.booking_id
        AND (bookings.traveler_id = auth.uid() OR bookings.guide_id = auth.uid())
    )
  );

-- RLS Policy: Users can insert/update their own booking_reads
CREATE POLICY "Users can insert their own booking_reads"
  ON public.booking_reads
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.bookings
      WHERE bookings.id = booking_reads.booking_id
        AND (bookings.traveler_id = auth.uid() OR bookings.guide_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own booking_reads"
  ON public.booking_reads
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: Users can delete their own booking_reads
CREATE POLICY "Users can delete their own booking_reads"
  ON public.booking_reads
  FOR DELETE
  USING (user_id = auth.uid());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_booking_reads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_booking_reads_updated_at
  BEFORE UPDATE ON public.booking_reads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_booking_reads_updated_at();

-- Enable realtime for booking_reads
ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_reads;

COMMENT ON TABLE public.booking_reads IS 'Tracks read status for booking chats - Telegram-like read receipts';
COMMENT ON COLUMN public.booking_reads.booking_id IS 'Reference to the booking/chat';
COMMENT ON COLUMN public.booking_reads.user_id IS 'User who read the messages';
COMMENT ON COLUMN public.booking_reads.last_read_message_id IS 'ID of the last message read by this user';
COMMENT ON COLUMN public.booking_reads.last_read_at IS 'Timestamp when user last read messages in this chat';
