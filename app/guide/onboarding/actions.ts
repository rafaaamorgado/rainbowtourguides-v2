"use server";

import { createSupabaseAdmin } from "@/lib/supabase/admin";

const BLOCKED_ISO = new Set(["RU", "BY", "CU", "IR", "KP", "SY"]);
const BLOCKED_CITY_KEYWORDS = /(crimea|sevastopol)/i;

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’`]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export async function createOrGetCity(
  countryIsoOrId: string,
  cityName: string
): Promise<{ cityId?: string; error?: string }> {
  try {
    const supabase = createSupabaseAdmin();
    const db = supabase as any;
    type CountryRow = { id: string; iso_code?: string | null; is_supported?: boolean | null };

    const name = (cityName || "").trim();
    if (!name) return { error: "City name is required" };
    if (BLOCKED_CITY_KEYWORDS.test(name)) return { error: "City not supported" };

    // Find country by iso_code or id
    const { data: country, error: countryError } = (await supabase
      .from("countries")
      .select("id, iso_code, is_supported")
      .or(`id.eq.${countryIsoOrId},iso_code.eq.${countryIsoOrId}`)
      .maybeSingle()) as { data: CountryRow | null; error: any };

    if (countryError) return { error: countryError.message };
    if (!country) return { error: "Country not found" };

    const iso = (country.iso_code || "").toUpperCase();
    if (BLOCKED_ISO.has(iso)) return { error: "Country not supported" };
    if (country.is_supported === false) return { error: "Country not supported" };

    // Return existing city (same country + name)
    const { data: existing } = (await db
      .from("cities")
      .select("id")
      .eq("country_id", country.id)
      .ilike("name", name)
      .maybeSingle()) as { data: { id: string } | null };
    if (existing?.id) return { cityId: existing.id };

    // Build unique slug
    const base = slugify(name) || "city";
    const candidateWithIso = iso ? `${base}-${iso.toLowerCase()}` : base;

    let slug = base;
    // If base is taken, try with country iso
    const { data: baseTaken } = await supabase
      .from("cities")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (baseTaken) slug = candidateWithIso;

    let counter = 2;
    // Ensure uniqueness
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data: conflict } = await supabase
        .from("cities")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!conflict) break;
      slug = `${candidateWithIso}-${counter}`;
      counter += 1;
    }

    const { data: inserted, error: insertError } = await db
      .from("cities")
      .insert({
        country_id: country.id,
        name,
        slug,
        is_active: true,
      })
      .select("id")
      .single();

    if (insertError) return { error: insertError.message };

    return { cityId: inserted.id };
  } catch (err: any) {
    return { error: err?.message || "Failed to create city" };
  }
}
