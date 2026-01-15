import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const role = searchParams.get('role'); // Role passed from sign-up form

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
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      // Determine the user's role:
      // 1. From existing profile (returning user)
      // 2. From URL query param (new OAuth sign-up)
      // 3. From user metadata (if set during sign-up)
      // 4. Default to 'traveler'
      let userRole = profile?.role
        || role
        || data.user.user_metadata?.role
        || 'traveler';

      // If this is a new user (no profile) and role was passed, create/update the profile
      if (role && (role === 'guide' || role === 'traveler') && !profile) {
        // Insert new profile for OAuth user
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            role: role,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
          });
        userRole = role;
      } else if (role && (role === 'guide' || role === 'traveler') && profile && !profile.role) {
        // Update profile if it exists but role is not set
        await supabase
          .from('profiles')
          .update({ role: role })
          .eq('id', data.user.id);
        userRole = role;
      }

      // Redirect based on role
      let redirectPath: string;
      switch (userRole) {
        case 'guide':
          redirectPath = '/guide/dashboard';
          break;
        case 'admin':
          redirectPath = '/admin';
          break;
        case 'traveler':
        default:
          redirectPath = '/traveler/dashboard';
          break;
      }

      // Use origin from request (works correctly in both dev and production)
      return NextResponse.redirect(new URL(redirectPath, origin));
    }
  }

  // Auth error - redirect to error page
  return NextResponse.redirect(new URL('/auth/auth-code-error', request.url));
}
