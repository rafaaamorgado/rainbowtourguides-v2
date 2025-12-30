import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

function resolveServerKeys() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    const message =
      'Supabase server env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.';
    if (process.env.NODE_ENV === 'development') {
      console.error(message);
    }
    throw new Error(
      'Supabase server client is not configured. See console for details.',
    );
  }

  return { supabaseUrl, supabaseKey: supabaseAnonKey };
}

/**
 * Server-only Supabase client for App Router route handlers and React Server Components.
 * Uses the anon key by default so row-level security stays enforced. Switch to SUPABASE_SERVICE_ROLE_KEY
 * in specialized server actions when elevated privileges are needed.
 *
 * TODO: Implement proper cookie handling for auth sessions
 */
export function createSupabaseServerClient() {
  const { supabaseUrl, supabaseKey } = resolveServerKeys();

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        // TODO: Implement cookie reading from next/headers
        return undefined;
      },
      set(name, value, options) {
        // TODO: Implement cookie setting
      },
      remove(name, options) {
        // TODO: Implement cookie removal
      },
    },
  });
}
