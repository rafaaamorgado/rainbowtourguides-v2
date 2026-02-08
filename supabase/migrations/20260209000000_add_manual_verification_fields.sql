-- ============================================================================
-- Manual Admin Verification: add contact, social, and document columns
-- to the guides table for the manual verification workflow.
--
-- id_document_url already exists; guide_status enum already has
-- draft / pending / approved / rejected — no enum changes needed.
-- ============================================================================

ALTER TABLE public.guides
  ADD COLUMN IF NOT EXISTS proof_of_address_url text,
  ADD COLUMN IF NOT EXISTS phone_number         text,
  ADD COLUMN IF NOT EXISTS social_instagram     text,
  ADD COLUMN IF NOT EXISTS social_facebook      text,
  ADD COLUMN IF NOT EXISTS social_twitter       text,
  ADD COLUMN IF NOT EXISTS social_whatsapp      text,
  ADD COLUMN IF NOT EXISTS social_telegram      text,
  ADD COLUMN IF NOT EXISTS social_zalo          text,
  ADD COLUMN IF NOT EXISTS admin_notes          text;

-- Add comments for documentation
COMMENT ON COLUMN public.guides.proof_of_address_url IS 'URL to uploaded proof-of-address document (utility bill, etc.)';
COMMENT ON COLUMN public.guides.phone_number         IS 'Contact phone number for verification';
COMMENT ON COLUMN public.guides.social_instagram     IS 'Instagram handle or URL';
COMMENT ON COLUMN public.guides.social_facebook      IS 'Facebook profile URL';
COMMENT ON COLUMN public.guides.social_twitter       IS 'X / Twitter handle or URL';
COMMENT ON COLUMN public.guides.social_whatsapp      IS 'WhatsApp number';
COMMENT ON COLUMN public.guides.social_telegram      IS 'Telegram handle';
COMMENT ON COLUMN public.guides.social_zalo          IS 'Zalo ID or number';
COMMENT ON COLUMN public.guides.admin_notes          IS 'Internal admin notes (rejection reasons, review comments)';
