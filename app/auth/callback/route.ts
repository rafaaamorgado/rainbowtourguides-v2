import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPostLoginRedirect } from '@/lib/auth/post-login-redirect';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/account'; // Default next path
  const role = requestUrl.searchParams.get('role');

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // 1. Ensure profile exists (in case trigger failed or hasn't run yet)
      // The trigger 'handle_new_user' should have run on insert, but we double-check.
      // If role was passed (from signup flow), we might need to enforce it.

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      // If profile doesn't exist, wait a moment or insert it manually?
      // For now, we trust the improved trigger to handle insertion.
      // We only update role if it's explicitly provided and different.

      if (role && (role === 'guide' || role === 'traveler')) {
        // Force update the role if provided in the URL (e.g. from /guide/signup)
        // This overrides whatever default the trigger might have set if it didn't see the metadata.
        await supabase
          .from('profiles')
          .update({ role })
          .eq('id', data.user.id);
      }

      // 2. Determine redirect path
      // Uses the 'next' param OR the computed post-login path
      let finalPath = next;
      if (!requestUrl.searchParams.has('next')) {
        const computed = await getPostLoginRedirect();
        if (computed.path) finalPath = computed.path;
      }

      // 3. Construct absolute redirect URL using robust base URL
      // This solves the issue where redirects might go to localhost on prod
      // if headers are missing.
      const baseUrl = requestUrl.origin; // Usually safe, but can rely on helper if needed
      // Actually, standard practice is to use the requestUrl.origin if we trust the host header.
      // Vercel usually sets this correctly.

      return NextResponse.redirect(new URL(finalPath, baseUrl));
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url));
}
