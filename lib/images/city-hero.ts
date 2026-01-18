import { createSupabaseAdmin } from "@/lib/supabase/admin";

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const CITY_BUCKET = "city-images";

type CityRecord = {
  id: string;
  name: string;
  hero_image_url: string | null;
  hero_image_path?: string | null;
  hero_image_backup_url?: string | null;
  hero_image_source?: string | null;
  hero_image_attribution?: string | null;
  hero_image_attribution_url?: string | null;
  country?: {
    id: string;
    name: string;
    iso_code?: string | null;
    is_supported?: boolean | null;
  } | null;
};

export async function ensureCityHeroImage(cityId: string): Promise<void> {
  const supabase = createSupabaseAdmin() as any;

  // Fetch city + country
  const { data: city, error: cityError } = (await supabase
    .from("cities")
    .select(
      `
        id,
        name,
        hero_image_url,
        hero_image_path,
        hero_image_backup_url,
        hero_image_source,
        hero_image_attribution,
        hero_image_attribution_url,
        country:countries!cities_country_id_fkey(
          id,
          name,
          iso_code,
          is_supported
        )
      `
    )
    .eq("id", cityId)
    .maybeSingle()) as { data: CityRecord | null; error: any };

  if (cityError) {
    console.error("Failed to load city", cityError);
    return;
  }
  if (!city) {
    console.warn("City not found", cityId);
    return;
  }

  // Respect unsupported countries
  if (city.country?.is_supported === false) {
    return;
  }

  // Already has hero
  if (city.hero_image_url) return;

  // Try Pixabay first
  const pixabayResult = await tryPixabay(city);
  if (pixabayResult) {
    const { publicUrl, path } = pixabayResult;
    await supabase
      .from("cities")
      .update({
        hero_image_url: publicUrl,
        hero_image_path: path,
        hero_image_source: "pixabay",
        hero_image_backup_url: null,
        hero_image_attribution: null,
        hero_image_attribution_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", city.id);
    return;
  }

  // Fallback to Unsplash metadata only
  const unsplashResult = await tryUnsplash(city);
  if (unsplashResult) {
    await supabase
      .from("cities")
      .update({
        hero_image_backup_url: unsplashResult.url,
        hero_image_source: "unsplash",
        hero_image_attribution: unsplashResult.attribution,
        hero_image_attribution_url: unsplashResult.attributionUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", city.id);
  }
}

async function tryPixabay(city: CityRecord): Promise<{ publicUrl: string; path: string } | null> {
  if (!PIXABAY_API_KEY) return null;

  const query = encodeURIComponent(`${city.name} ${city.country?.name || ""} city`);
  const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${query}&image_type=photo&orientation=horizontal&category=travel&safesearch=true&per_page=5`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const hits: any[] = data?.hits || [];
    if (!hits.length) return null;

    const chosen = hits.reduce((best, hit) => {
      if (!best) return hit;
      const bestScore = (best.imageWidth || 0) * (best.imageHeight || 0);
      const hitScore = (hit.imageWidth || 0) * (hit.imageHeight || 0);
      return hitScore > bestScore ? hit : best;
    }, null as any);

    if (!chosen?.largeImageURL) return null;

    const imageRes = await fetch(chosen.largeImageURL);
    if (!imageRes.ok) return null;
    const buffer = Buffer.from(await imageRes.arrayBuffer());

    const path = `cities/${city.id}/hero.jpg`;
    const supabase = createSupabaseAdmin();
    const { error: uploadError } = await supabase.storage
      .from(CITY_BUCKET)
      .upload(path, buffer, { contentType: "image/jpeg", upsert: true });
    if (uploadError) {
      console.error("Upload failed", uploadError);
      return null;
    }

    const { data: publicData } = supabase.storage.from(CITY_BUCKET).getPublicUrl(path);
    const publicUrl = publicData?.publicUrl;
    if (!publicUrl) return null;

    return { publicUrl, path };
  } catch (err) {
    console.error("Pixabay fetch failed", err);
    return null;
  }
}

async function tryUnsplash(city: CityRecord): Promise<{
  url: string;
  attribution: string;
  attributionUrl: string;
} | null> {
  if (!UNSPLASH_ACCESS_KEY) return null;

  const query = encodeURIComponent(`${city.name} ${city.country?.name || ""} city`);
  const url = `https://api.unsplash.com/search/photos?query=${query}&orientation=landscape&per_page=1&client_id=${UNSPLASH_ACCESS_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.results?.[0];
    if (!result?.urls?.regular) return null;

    const attribution = `${result.user?.name || "Photographer"} on Unsplash`;
    const attributionUrl = `${result.links?.html}?utm_source=rainbowtourguides&utm_medium=referral`;

    return {
      url: result.urls.regular,
      attribution,
      attributionUrl,
    };
  } catch (err) {
    console.error("Unsplash fetch failed", err);
    return null;
  }
}

