import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getPostLoginRedirect } from '@/lib/auth/post-login-redirect';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/account';
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
      // If a role was passed (from signup flow), update the profile
      // The trigger creates the profile, but we may need to update the role
      if (role && (role === 'guide' || role === 'traveler')) {
        await supabase
          .from('profiles')
          .update({ role })
          .eq('id', data.user.id);
      }

      const redirectPath = next || (await getPostLoginRedirect()).path || '/account';
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url));
}
