/**
 * Returns the site's base URL for links, redirects, and callbacks.
 * Priority: NEXT_PUBLIC_SITE_URL (primary) → localhost in dev → Vercel URL in production.
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ""); // strip trailing slash
  }
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
