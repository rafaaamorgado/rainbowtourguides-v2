import { z } from "zod";

/**
 * Validation: requires a valid URL. Used for mandatory document uploads
 * that must be present before the guide can submit for review.
 */
const requiredUrl = z.string().url("Must be a valid URL").min(1, "Required");

/**
 * Validation: optional social handle / link.
 * We accept anything non-empty; specific format varies per platform.
 */
const optionalSocial = z.string().nullish().or(z.literal(""));

/**
 * Validation: required contact channel.
 */
const requiredContact = z
    .string()
    .min(7, "WhatsApp number must be at least 7 characters")
    .max(20, "WhatsApp number is too long");

export const guideOnboardingSchema = z.object({
    // Step 1: Account & Basics
    city_name: z.string().min(1, "City is required"),
    country_code: z.string().min(2, "Country is required"),
    display_name: z.string().min(2, "Display name must be at least 2 characters"),
    bio: z.string().min(50, "Bio should be at least 50 characters to build trust"),
    sexual_orientation: z.string().optional().nullable(),
    pronouns: z.string().optional().nullable(),
    tagline: z.string().max(60).optional().nullable(),
    tour_description: z.string().optional().nullable(),

    // Step 2: Alignment & Standards
    lgbtq_alignment: z.object({
        affirms_identity: z.boolean().refine((val) => val === true, "Must affirm LGBTQ+ identity"),
        agrees_conduct: z.boolean().refine((val) => val === true, "Must agree to Code of Conduct"),
        no_sexual_services: z.boolean().refine((val) => val === true, "Must agree to no sexual services policy"),
        why_guiding: z.string().min(20, "Please explain why you want to guide"),
        expectations: z.string().min(20, "Please describe the vibe/expectations"),
    }),

    // Step 3: Specialties
    specialties: z.array(z.string()).min(1, "Select at least one specialty"),
    languages: z.array(z.string()).min(1, "Select at least one language"),
    headline: z.string().min(5, "Add a clear headline"), // "What we'll do" title
    about: z.string().min(50, "Describe the experience in detail"), // "What we'll do" description

    // Step 4: Rates
    base_price_4h: z.number().min(0),
    base_price_6h: z.number().min(0),
    base_price_8h: z.number().min(0),
    hourly_rate: z.number().min(0).optional(),
    currency: z.literal('USD'),

    // Step 5: Availability
    available_days: z.array(z.string()).optional(),
    typical_start_time: z.string().optional(),
    typical_end_time: z.string().optional(),

    // Step 6: Verification — Contact & Documents
    phone_number: z
        .string()
        .min(7, "Phone number must be at least 7 characters")
        .max(20, "Phone number is too long"),
    id_document_url: requiredUrl,
    proof_of_address_url: requiredUrl,

    // Step 6: Verification — Social Links
    social_instagram: optionalSocial,
    social_facebook: optionalSocial,
    social_twitter: optionalSocial,
    social_whatsapp: requiredContact,
    social_telegram: optionalSocial,
    social_zalo: optionalSocial,
});

export type GuideOnboardingData = z.infer<typeof guideOnboardingSchema>;

/**
 * Partial schema for saving drafts — every top-level field is optional
 * so guides can save progress before completing all required fields.
 */
export const guideOnboardingDraftSchema = guideOnboardingSchema.partial();

export type GuideOnboardingDraftData = z.infer<typeof guideOnboardingDraftSchema>;
