import { z } from "zod";

export const guideOnboardingSchema = z.object({
    // Step 1: Account & Basics
    city_name: z.string().min(1, "City is required"),
    country_code: z.string().min(2, "Country is required"),
    display_name: z.string().min(2, "Display name must be at least 2 characters"),
    bio: z.string().min(50, "Bio should be at least 50 characters to build trust"),

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
    currency: z.string().length(3),

    // Step 5: Availability
    available_days: z.array(z.string()).optional(),
    typical_start_time: z.string().optional(),
    typical_end_time: z.string().optional(),
});

export type GuideOnboardingData = z.infer<typeof guideOnboardingSchema>;
