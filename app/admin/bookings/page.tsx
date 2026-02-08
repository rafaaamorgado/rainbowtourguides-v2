import { requireRole } from '@/lib/auth-helpers';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BookingStatusOverride } from '@/components/admin/BookingStatusOverride';
import { ExportCsvButton } from '@/components/admin/ExportCsvButton';

/**
 * Admin Bookings page — lists all bookings with an inline status override.
 */
export default async function AdminBookingsPage() {
  const { supabase } = await requireRole('admin');

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
      created_at,
      traveler:profiles!bookings_traveler_id_fkey(full_name),
      guide:guides!bookings_guide_id_fkey(
        id,
        profile:profiles!guides_id_fkey(full_name)
      ),
      city:cities!bookings_city_id_fkey(name)
    `,
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading bookings: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">All Bookings</h1>
          <p className="text-ink-soft mt-1">
            View and override booking statuses across the platform.
          </p>
        </div>
        <ExportCsvButton />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50">
              <TableHead className="font-semibold">Booking</TableHead>
              <TableHead className="font-semibold">Traveler</TableHead>
              <TableHead className="font-semibold">Guide</TableHead>
              <TableHead className="font-semibold">City</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Amount</TableHead>
              <TableHead className="font-semibold text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!bookings || bookings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-ink-soft"
                >
                  No bookings found.
                </TableCell>
              </TableRow>
            ) : (
              bookings.map((booking: any) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono text-xs text-ink-soft">
                    {booking.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-sm">
                    {booking.traveler?.full_name || '—'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {booking.guide?.profile?.full_name || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-ink-soft">
                    {booking.city?.name || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-ink-soft">
                    {booking.start_at
                      ? new Date(booking.start_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {booking.currency || 'USD'}{' '}
                    {parseFloat(booking.price_total || '0').toFixed(0)}
                  </TableCell>
                  <TableCell className="text-right">
                    <BookingStatusOverride
                      bookingId={booking.id}
                      currentStatus={booking.status}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
