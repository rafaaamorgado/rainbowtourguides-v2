import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware: Handles route protection for the app.
 *
 * PERF: Public routes skip all auth/DB calls entirely.
 * Protected routes: single getUser() + single profile query.
 */
export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // =========================================================================
    // 1. PUBLIC ROUTES — Skip all auth checks, no DB calls
    // =========================================================================
    const publicPrefixes = [
        '/auth',
        '/guides',
        '/cities',
        '/countries',
        '/blog',
        '/how-it-works',
        '/become-a-guide',
        '/faq',
        '/legal',
        '/api',
    ];

    // Also treat root and static-ish routes as public
    if (
        pathname === '/' ||
        publicPrefixes.some(prefix => pathname.startsWith(prefix))
    ) {
        return NextResponse.next();
    }

    // =========================================================================
    // 2. PROTECTED ROUTES — Require auth
    // =========================================================================
    let response = NextResponse.next({
        request: { headers: request.headers },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({
                        request: { headers: request.headers },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Single auth call for all protected routes
    const { data: { user } } = await supabase.auth.getUser();

    // =========================================================================
    // 2b. EMAIL VERIFICATION GATE — Unverified users cannot access protected routes
    // =========================================================================
    // /auth/* (including /auth/verify-email, /auth/sign-out) is public, so we never
    // reach this block for those paths; no need to exclude them here.
    if (user && !user.email_confirmed_at) {
        return NextResponse.redirect(new URL('/auth/verify-email', request.url));
    }

    // =========================================================================
    // 3. ADMIN ROUTES — /admin/*
    // =========================================================================
    if (pathname.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(
                new URL('/auth/sign-in?redirect=/admin', request.url)
            );
        }

        // Single profile query
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            // Non-admins are bounced to the homepage
            return NextResponse.redirect(new URL('/', request.url));
        }

        return response;
    }

    // =========================================================================
    // 4. GUIDE ROUTES — /guide/*
    // =========================================================================
    if (pathname.startsWith('/guide')) {
        if (!user) {
            return NextResponse.redirect(
                new URL('/auth/sign-in?redirect=/guide/dashboard', request.url)
            );
        }

        // Single profile query
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'guide') {
            // Wrong role — redirect to appropriate dashboard
            if (profile?.role === 'traveler') {
                return NextResponse.redirect(new URL('/traveler/dashboard', request.url));
            }
            return NextResponse.redirect(new URL('/', request.url));
        }

        return response;
    }

    // =========================================================================
    // 5. TRAVELER ROUTES — /traveler/*
    // =========================================================================
    if (pathname.startsWith('/traveler')) {
        if (!user) {
            return NextResponse.redirect(
                new URL('/auth/sign-in?redirect=/traveler/dashboard', request.url)
            );
        }

        // Single profile query
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'traveler') {
            // Wrong role — redirect to appropriate dashboard
            if (profile?.role === 'guide') {
                return NextResponse.redirect(new URL('/guide/dashboard', request.url));
            }
            return NextResponse.redirect(new URL('/', request.url));
        }

        return response;
    }

    // =========================================================================
    // 6. OTHER PROTECTED ROUTES (e.g., /account, /messages)
    // =========================================================================
    // These require login but not a specific role
    if (!user) {
        return NextResponse.redirect(new URL('/auth/sign-in', request.url));
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico
         * - static assets (images, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
