import { cookies } from "next/headers";
import { createServerClient, type SupabaseClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

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
 * Shares cookies with the current request scope so session-aware queries work on the server.
 */
export function createSupabaseServerClient(): SupabaseClient<Database> {
  const cookieStore = cookies();
  const supabaseUrl = getEnvValue("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseKey = getEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        // Server Components only have read-only cookies. Route handlers/server actions can set.
        try {
          // @ts-expect-error Next exposes set only in mutable contexts.
          cookieStore.set?.({ name, value, ...options });
        } catch {
          /* no-op */
        }
      },
      remove(name, options) {
        try {
          // @ts-expect-error Next exposes delete only in mutable contexts.
          cookieStore.delete?.({ name, ...options });
        } catch {
          /* no-op */
        }
      },
    },
  });
}

