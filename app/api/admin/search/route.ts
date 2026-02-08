import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * GET /api/admin/search?q=...
 *
 * Admin-only search endpoint. Searches:
 * 1. profiles — by full_name (ilike)
 * 2. bookings — by id prefix
 *
 * Returns up to 5 results per category.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ profiles: [], bookings: [] });
  }

  const supabase = await createSupabaseServerClient();

  // Verify admin role
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null };

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Search profiles by name (ilike)
  const { data: profiles } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, role, avatar_url')
    .ilike('full_name', `%${q}%`)
    .limit(5);

  // Search bookings by id prefix
  const isUuidPrefix = /^[0-9a-f-]{2,}$/i.test(q);
  let bookings: any[] = [];

  if (isUuidPrefix) {
    const { data: bookingResults } = await (supabase as any)
      .from('bookings')
      .select(
        `id, status, start_at, price_total, currency,
         traveler:profiles!bookings_traveler_id_fkey(full_name),
         guide:guides!bookings_guide_id_fkey(profile:profiles!guides_id_fkey(full_name))`
      )
      .ilike('id', `${q}%`)
      .limit(5);

    bookings = bookingResults || [];
  }

  return NextResponse.json({
    profiles: profiles || [],
    bookings,
  });
}
