import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-helpers";
import { GuideOnboardingForm } from "@/components/guide/GuideOnboardingForm";
import type { Database } from "@/types/database";

type City = Database["public"]["Tables"]["cities"]["Row"];
type Guide = Database["public"]["Tables"]["guides"]["Row"];

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

  // Load existing guide profile if any
  const { data: existingGuide } = await supabase
    .from("guides")
    .select("*")
    .eq("id", profile.id)
    .single();

  // Server action to upsert guide profile
  async function submitGuideProfile(formData: FormData): Promise<{ success: boolean; error?: string }> {
    "use server";
    
    const { supabase, profile } = await requireRole("guide");

    const cityId = formData.get("city_id") as string;
    const headline = formData.get("headline") as string;
    const about = formData.get("about") as string;
    const languagesRaw = formData.get("languages") as string;
    const themesRaw = formData.get("themes") as string;
    const hourlyRateRaw = formData.get("hourly_rate") as string;

    // Validate required fields
    if (!cityId) {
      return { success: false, error: "Please select a city." };
    }

    // Parse languages from comma-separated string
    const languages = languagesRaw
      ? languagesRaw.split(",").map((l) => l.trim()).filter(Boolean)
      : [];

    // Parse themes from JSON
    let themes: string[] = [];
    try {
      themes = themesRaw ? JSON.parse(themesRaw) : [];
    } catch {
      themes = [];
    }

    // Parse hourly rate
    const hourlyRate = hourlyRateRaw ? parseFloat(hourlyRateRaw) : null;

    // Get city slug for generating guide slug
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: cityData } = await (supabase as any)
      .from("cities")
      .select("slug")
      .eq("id", cityId)
      .single();
    
    const city = cityData as { slug: string } | null;

    // Check if guide already exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existingGuideData } = await (supabase as any)
      .from("guides")
      .select("id, slug")
      .eq("id", profile.id)
      .single();
    
    const typedExistingGuide = existingGuideData as { id: string; slug: string | null } | null;

    // Generate slug if needed (only for new guides or if slug is null)
    const slug = typedExistingGuide?.slug || generateSlug(city?.slug || "city", profile.display_name);

    // Upsert guide profile
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("guides")
      .upsert({
        id: profile.id,
        city_id: cityId,
        headline: headline || null,
        about: about || null,
        languages,
        themes,
        hourly_rate: hourlyRate,
        status: "pending", // Always set to pending on edit
        slug,
      }, {
        onConflict: "id",
      });

    if (error) {
      console.error("[submitGuideProfile] Error:", error);
      return { success: false, error: "Failed to save profile. Please try again." };
    }

    revalidatePath("/guide/onboarding");
    revalidatePath("/guide/dashboard");

    return { success: true };
  }

  return (
    <div className="py-12 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Guide Onboarding</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, {profile.display_name}! Complete your guide profile to start receiving bookings.
        </p>
      </div>

      <GuideOnboardingForm
        cities={(cities ?? []) as City[]}
        existingGuide={existingGuide as Guide | null}
        onSubmit={submitGuideProfile}
      />
    </div>
  );
}
