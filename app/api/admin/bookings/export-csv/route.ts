import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * GET /api/admin/bookings/export-csv
 *
 * Admin-only endpoint that exports all bookings as a CSV file.
 * Columns: Booking ID, Guide Name, Traveler Name, City, Date,
 *          Amount, Currency, Stripe Payment ID, Status
 */
export async function GET() {
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

  // Fetch all bookings with joins
  const { data: bookings, error } = await (supabase as any)
    .from('bookings')
    .select(
      `
      id,
      status,
      price_total,
      currency,
      start_at,
      duration_hours,
      stripe_payment_intent_id,
      stripe_checkout_session_id,
      created_at,
      traveler:profiles!bookings_traveler_id_fkey(full_name),
      guide:guides!bookings_guide_id_fkey(
        profile:profiles!guides_id_fkey(full_name)
      ),
      city:cities!bookings_city_id_fkey(name)
    `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 },
    );
  }

  // Build CSV manually (no external library needed)
  const headers = [
    'Booking ID',
    'Guide Name',
    'Traveler Name',
    'City',
    'Date',
    'Duration (hrs)',
    'Amount',
    'Currency',
    'Stripe Payment ID',
    'Status',
    'Created At',
  ];

  const escapeCSV = (val: string | null | undefined): string => {
    if (val == null) return '';
    const str = String(val);
    // Wrap in quotes if it contains commas, quotes, or newlines
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = (bookings || []).map((b: any) => {
    const date = b.start_at
      ? new Date(b.start_at).toISOString().split('T')[0]
      : '';
    const created = b.created_at
      ? new Date(b.created_at).toISOString()
      : '';

    return [
      b.id,
      b.guide?.profile?.full_name || '',
      b.traveler?.full_name || '',
      b.city?.name || '',
      date,
      b.duration_hours ?? '',
      b.price_total ?? '0',
      b.currency || 'USD',
      b.stripe_payment_intent_id || b.stripe_checkout_session_id || '',
      b.status || '',
      created,
    ]
      .map(escapeCSV)
      .join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');

  const filename = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
