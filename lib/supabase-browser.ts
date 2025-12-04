import { createBrowserClient, type SupabaseClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

type PublicEnvKeys = {
  url?: string;
  anonKey?: string;
};

const getPublicEnvKeys = (): PublicEnvKeys => ({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

export function isSupabaseConfiguredOnClient(): boolean {
  const { url, anonKey } = getPublicEnvKeys();
  return Boolean(url && anonKey);
}

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Client-side Supabase helper. Returns null if the public env vars are missing so components can render a fallback.
 */
export function createSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfiguredOnClient()) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Supabase client is not configured. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY exist in .env.local."
      );
    }
    return null;
  }

  if (!browserClient) {
    const { url, anonKey } = getPublicEnvKeys();
    browserClient = createBrowserClient<Database>(url!, anonKey!);
  }

  return browserClient;
}

