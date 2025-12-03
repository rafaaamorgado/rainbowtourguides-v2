import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// TODO: Replace this placeholder type with the generated types from Supabase CLI once available.
export type Database = Record<string, never>;

type PublicEnvKey = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function getEnvValue(key: PublicEnvKey) {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing ${key}. Populate .env.local with the credentials from your Supabase dashboard.`
    );
  }
  return value;
}

let browserClient: SupabaseClient<Database> | undefined;

/**
 * Client-side Supabase helper. Use inside client components/hooks when you need realtime or browser auth.
 * Falls back to a singleton instance so the browser only instantiates one Supabase client.
 */
export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!browserClient) {
    browserClient = createClient<Database>(
      getEnvValue("NEXT_PUBLIC_SUPABASE_URL"),
      getEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    );
  }
  return browserClient;
}

