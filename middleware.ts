import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // 1. Initialize Supabase client
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        }
    )

    // 2. Auth Check - Refresh Session
    const { data: { user } } = await supabase.auth.getUser()

    // Public routes - skip all checks for these paths
    const publicRoutes = ['/auth', '/guides', '/cities', '/blog', '/how-it-works', '/become-a-guide', '/faq', '/legal'];
    const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route));
    
    if (isPublicRoute) {
        return response;
    }

    // 3. Admin Route Protection
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/sign-in', request.url))
        }

        // Role check logic
        // We need to fetch the profile to check role. 
        // Optimization: Store role in user_metadata or claims to avoid DB hit every request,
        // but for v2 correctness, fetching profile is safer or trusting metadata if synced.
        // Our auth trigger syncs metadata -> profile, so we can trust user_metadata for middleware speed.
        // Wait, the trigger is FROM metadata TO profile.
        // So user_metadata is the source for initial signup.
        // But if admin changes role in DB, metadata might be stale.
        // Ideally we query DB.

        // For now, let's query the DB for the profile role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url)) // Or 404/403 page
        }
    }

    // 4. Guide Route Protection - Only guides and admins
    if (request.nextUrl.pathname.startsWith('/guide')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/sign-in?redirect=/guide/dashboard', request.url))
        }

        // Check role - only guides and admins can access
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'guide' && profile?.role !== 'admin') {
            // Redirect traveler to their dashboard
            if (profile?.role === 'traveler') {
                return NextResponse.redirect(new URL('/traveler/dashboard', request.url))
            }
            // Unknown role - redirect to home
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    // 5. Traveler Route Protection - Only travelers and admins
    if (request.nextUrl.pathname.startsWith('/traveler')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/sign-in?redirect=/traveler/dashboard', request.url))
        }

        // Check role - only travelers and admins can access
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'traveler' && profile?.role !== 'admin') {
            // Redirect guide to their dashboard
            if (profile?.role === 'guide') {
                return NextResponse.redirect(new URL('/guide/dashboard', request.url))
            }
            // Unknown role - redirect to home
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
