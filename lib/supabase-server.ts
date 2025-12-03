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

/**
 * Server-only Supabase client for App Router route handlers and React Server Components.
 * Uses the public anon key by default so row-level security stays enforced.
 * Switch to the service role key (SUPABASE_SERVICE_ROLE_KEY) inside server actions when elevated access is required.
 */
export function createSupabaseServerClient(): SupabaseClient<Database> {
  const supabaseUrl = getEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = getEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
}

