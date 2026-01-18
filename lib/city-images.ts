/**
 * Deterministic city image mapping so cards always have a local background.
 * Extend this map as new cities are added; keys must match city slugs.
 */
export const cityImageMap: Record<string, string> = {
  amsterdam: "/images/cities/amsterdam.svg",
  barcelona: "/images/cities/barcelona.svg",
  berlin: "/images/cities/berlin.svg",
  london: "/images/cities/london.svg",
  madrid: "/images/cities/madrid.svg",
  lisbon: "/images/cities/madrid.svg", // fallback to a warm palette
  "rio-de-janeiro": "/images/cities/berlin.svg",
  "da-nang": "/images/cities/amsterdam.svg",
  bangkok: "/images/cities/madrid.svg",
  default: "/images/cities/default.svg",
};

/**
 * Resolve the best image for a city, preferring explicit URLs and falling back to a local map.
 */
export function getCityImageUrl(slug?: string, providedUrl?: string | null) {
  if (providedUrl) return providedUrl;
  if (slug && cityImageMap[slug]) return cityImageMap[slug];
  return cityImageMap.default;
}

// Alias for compatibility/readability
export const getCityImageSrc = getCityImageUrl;
