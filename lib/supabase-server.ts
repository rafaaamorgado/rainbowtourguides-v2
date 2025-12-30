import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
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
 * Uses the anon key by default so row-level security stays enforced.
 */
export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseKey } = resolveServerKeys();
  const cookieStore = await cookies(); // ← В Next.js 16 это async!

  return createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Игнорируем ошибки в middleware/layouts где cookies read-only
        }
      },
    },
  });
}
