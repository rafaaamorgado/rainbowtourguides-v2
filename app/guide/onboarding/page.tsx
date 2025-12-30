import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-helpers";
import { OnboardingWizard } from "@/components/guide/onboarding/OnboardingWizard";
import type { Database } from "@/types/database";

type City = Database["public"]["Tables"]["cities"]["Row"];

/**
 * Generate a URL-safe slug from city slug and display name
 */
function generateSlug(citySlug: string, displayName: string): string {
  const safeName = (displayName || "guide")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${citySlug}-${safeName}`;
}

export default async function GuideOnboardingPage() {
  const { supabase, profile } = await requireRole("guide");

  // Load active cities for the dropdown
  const { data: cities } = await supabase
    .from("cities")
    .select("*")
    .eq("is_active", true)
    .order("name");

  // Server action to create/update guide profile from wizard data
  async function submitGuideProfile(formData: FormData): Promise<{ success: boolean; error?: string }> {
    "use server";

    const { supabase, profile } = await requireRole("guide");

    // Extract all form data
    const cityId = formData.get("city_id") as string;
    const shortBio = formData.get("short_bio") as string;
    const languagesRaw = formData.get("languages") as string;
    const whyGuideQueer = formData.get("why_guide_queer") as string;
    const experienceTagsRaw = formData.get("experience_tags") as string;
    const rate4h = formData.get("rate_4h") as string;
    const rate6h = formData.get("rate_6h") as string;
    const rate8h = formData.get("rate_8h") as string;
    const currency = formData.get("currency") as string;
    const availableDaysRaw = formData.get("available_days") as string;
    const startTime = formData.get("start_time") as string;
    const endTime = formData.get("end_time") as string;
    const idDocumentType = formData.get("id_document_type") as string;

    // Validate required fields
    if (!cityId) {
      return { success: false, error: "Please select a city." };
    }

    // Parse languages from comma-separated string
    const languages = languagesRaw
      ? languagesRaw.split(",").map((l) => l.trim()).filter(Boolean)
      : [];

    // Parse experience tags
    let experienceTags: string[] = [];
    try {
      experienceTags = experienceTagsRaw ? JSON.parse(experienceTagsRaw) : [];
    } catch {
      experienceTags = [];
    }

    // Parse available days
    let availableDays: string[] = [];
    try {
      availableDays = availableDaysRaw ? JSON.parse(availableDaysRaw) : [];
    } catch {
      availableDays = [];
    }

    // Calculate hourly rate from package rates (use 6h rate as base)
    const hourlyRate = rate6h ? (parseFloat(rate6h) / 6).toFixed(2) : null;

    // Get photo URL from FormData
    const photoUrl = formData.get("photo_url") as string | null;
    const idDocumentUrl = formData.get("id_document_url") as string | null;

    // Parse LGBTQ+ alignment data
    let lgbtqAlignment: Record<string, unknown> | null = null;
    try {
      const lgbtqAlignmentRaw = formData.get("lgbtq_alignment") as string;
      lgbtqAlignment = lgbtqAlignmentRaw ? JSON.parse(lgbtqAlignmentRaw) : null;
    } catch {
      lgbtqAlignment = null;
    }

    // Get city slug for generating guide slug
    const { data: cityData } = await supabase
      .from("cities")
      .select("slug")
      .eq("id", cityId)
      .single();

    const city = cityData as { slug: string } | null;

    // Check if guide already exists
    const { data: existingGuideData } = await supabase
      .from("guides")
      .select("id, slug")
      .eq("id", profile.id)
      .single();

    const typedExistingGuide = existingGuideData as { id: string; slug: string | null } | null;

    // Generate slug if needed
    const slug = typedExistingGuide?.slug || generateSlug(city?.slug || "city", profile.display_name);

    // Build the about section from bio and why guide queer
    const about = `${shortBio}\n\n${whyGuideQueer}`;

    // Update profile avatar if photo URL provided
    if (photoUrl) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("profiles")
        .update({ avatar_url: photoUrl })
        .eq("id", profile.id);
    }

    // Upsert guide profile with all wizard data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guideInsert: any = {
      id: profile.id,
      city_id: cityId,
      headline: shortBio.substring(0, 120), // Use first 120 chars of bio as headline
      about: about,
      languages: languages.length > 0 ? languages : null,
      themes: experienceTags.length > 0 ? experienceTags : null,
      hourly_rate: hourlyRate || null,
      base_price_4h: rate4h || null,
      base_price_6h: rate6h || null,
      base_price_8h: rate8h || null,
      currency: currency || "USD",
      available_days: availableDays.length > 0 ? availableDays : null,
      typical_start_time: startTime || null,
      typical_end_time: endTime || null,
      lgbtq_alignment: lgbtqAlignment,
      status: "pending", // Always set to pending on submission
      slug,
    };

    // Type assertion needed for Supabase upsert operation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: guideError } = await (supabase as any)
      .from("guides")
      .upsert(guideInsert, {
        onConflict: "id",
      });

    if (guideError) {
      console.error("[submitGuideProfile] Guide upsert error:", guideError);
      return { success: false, error: "Failed to save profile. Please try again." };
    }

    // Store ID verification document if provided
    if (idDocumentUrl && idDocumentType) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: verificationError } = await (supabase as any)
        .from("guide_verifications")
        .upsert({
          guide_id: profile.id,
          id_document_url: idDocumentUrl,
          id_document_type: idDocumentType,
          verification_status: "pending",
        }, {
          onConflict: "guide_id",
        });

      if (verificationError) {
        console.error("[submitGuideProfile] Verification error:", verificationError);
        // Don't fail the whole submission if just verification fails
      }
    }

    revalidatePath("/guide/onboarding");
    revalidatePath("/guide/dashboard");

    return { success: true };
  }

  return (
    <OnboardingWizard
      cities={(cities ?? []) as City[]}
      profileName={profile.display_name}
      onSubmit={submitGuideProfile}
    />
  );
}
