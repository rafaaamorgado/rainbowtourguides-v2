import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const role = requestUrl.searchParams.get('role'); // Role passed from sign-up form
  const origin = requestUrl.origin;

  // Use production URL if available, otherwise fall back to request origin
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;

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

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=callback_error`);
    }

    if (data.user) {
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
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            role: role,
            full_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
          });

        if (upsertError) {
          console.error('Profile upsert error:', upsertError);
        }
        userRole = role;
      } else if (role && (role === 'guide' || role === 'traveler') && profile && !profile.role) {
        // Update profile if it exists but role is not set
        await supabase
          .from('profiles')
          .update({ role: role })
          .eq('id', data.user.id);
        userRole = role;
      }

      console.log('User authenticated, role:', userRole); // Debug log

      // Redirect based on role
      if (userRole === 'admin') {
        return NextResponse.redirect(`${baseUrl}/admin`);
      } else if (userRole === 'guide') {
        return NextResponse.redirect(`${baseUrl}/guide/dashboard`);
      } else {
        return NextResponse.redirect(`${baseUrl}/traveler/dashboard`);
      }
    }
  }

  // No code or user - redirect to sign in
  return NextResponse.redirect(`${baseUrl}/auth/sign-in`);
}
