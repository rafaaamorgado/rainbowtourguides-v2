/**
 * @deprecated — City images now come from the `cities.hero_image_url` database
 * column (populated via Cloudinary by `scripts/seed-city-images.ts`).
 *
 * This static map is kept **only as a fallback** for cities that haven't been
 * seeded yet. Once all cities have hero images, this file can be removed.
 */
const cityImageMap: Record<string, string> = {
  amsterdam: "/images/cities/amsterdam.svg",
  barcelona: "/images/cities/barcelona.svg",
  berlin: "/images/cities/berlin.svg",
  london: "/images/cities/london.svg",
  madrid: "/images/cities/madrid.svg",
  lisbon: "/images/cities/madrid.svg",
  "rio-de-janeiro": "/images/cities/berlin.svg",
  "da-nang": "/images/cities/amsterdam.svg",
  bangkok: "/images/cities/madrid.svg",
  default: "/images/cities/default.svg",
};

/**
 * Resolve the best image for a city.
 *
 * Priority:
 *   1. `providedUrl` — the Cloudinary URL stored in `cities.hero_image_url`.
 *   2. Static SVG map by slug (legacy fallback).
 *   3. Default placeholder SVG.
 */
export function getCityImageUrl(slug?: string, providedUrl?: string | null): string {
  if (providedUrl) return providedUrl;
  if (slug && cityImageMap[slug]) return cityImageMap[slug];
  return cityImageMap.default;
}

/** @deprecated Use `getCityImageUrl` instead. */
export const getCityImageSrc = getCityImageUrl;
