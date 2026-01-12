import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { requireRole } from '@/lib/auth-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type {
  Database,
  GuideStatus,
  BookingStatus,
  ProfileRole,
} from '@/types/database';

type Guide = Database['public']['Tables']['guides']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type GuideWithDetails = Guide & {
  profile: { full_name: string } | null;
  city: { name: string } | null;
  // Add price fields that may come from the database
  price_4h?: string | number | null;
  price_6h?: string | number | null;
  price_8h?: string | number | null;
};

type BookingWithDetails = Booking & {
  traveler: { full_name: string } | null; // ⚠️ full_name, not display_name
  guide: { full_name: string } | null; // ⚠️ full_name, not display_name
  city: { name: string } | null;
};

type AdminPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

const guideStatusConfig: Record<
  GuideStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  pending: { label: 'Pending', variant: 'secondary' },
  approved: { label: 'Approved', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
};

const bookingStatusConfig: Record<
  BookingStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  }
> = {
  pending: { label: 'Pending', variant: 'secondary' },
  accepted: { label: 'Accepted', variant: 'default' },
  confirmed: { label: 'Confirmed', variant: 'default' },
  declined: { label: 'Declined', variant: 'destructive' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
  completed: { label: 'Completed', variant: 'default' },
  paid: { label: 'Paid', variant: 'default' },
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const { supabase, profile } = await requireRole('admin');
  const params = await searchParams;
  const activeTab = params.tab || 'guides';

  // Load guides with profiles and cities
  const { data: guides } = await supabase
    .from('guides')
    .select(
      `
      *,
      profile:profiles!guides_id_fkey(full_name),
      city:cities!guides_city_id_fkey(name)
    `,
    )
    .order('created_at', { ascending: false });

  // Load recent bookings (last 50)
  const { data: bookings } = await supabase
    .from('bookings')
    .select(
      `
      *,
      traveler:profiles!bookings_traveler_id_fkey(full_name),
      guide:profiles!bookings_guide_id_fkey(full_name),
      city:cities!bookings_city_id_fkey(name)
    `,
    )
    .order('created_at', { ascending: false })
    .limit(50);

  // Load all users
  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  const typedGuides = (guides ?? []) as GuideWithDetails[];
  const typedBookings = (bookings ?? []) as BookingWithDetails[];
  const typedUsers = (users ?? []) as Profile[];

  // Calculate stats
  const pendingGuides = typedGuides.filter(
    (g) => g.status === 'pending',
  ).length;
  const approvedGuides = typedGuides.filter(
    (g) => g.status === 'approved',
  ).length;
  const pendingBookings = typedBookings.filter(
    (b) => b.status === 'pending',
  ).length;

  // Server action: Update guide status
  async function updateGuideStatus(formData: FormData): Promise<void> {
    'use server';

    const { supabase } = await requireRole('admin');
    const guideId = formData.get('guide_id') as string;
    const newStatus = formData.get('status') as GuideStatus;

    if (!guideId || !newStatus) return;

    const guideUpdate: Database['public']['Tables']['guides']['Update'] = {
      status: newStatus,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('guides')
      .update(guideUpdate)
      .eq('id', guideId);

    revalidatePath('/admin');
  }

  // Server action: Update booking status
  async function updateBookingStatus(formData: FormData): Promise<void> {
    'use server';

    const { supabase } = await requireRole('admin');
    const bookingId = formData.get('booking_id') as string;
    const newStatus = formData.get('status') as BookingStatus;

    if (!bookingId || !newStatus) return;

    const bookingUpdate: Database['public']['Tables']['bookings']['Update'] = {
      status: newStatus,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('bookings')
      .update(bookingUpdate)
      .eq('id', bookingId);

    revalidatePath('/admin');
  }

  // Server action: Update user role
  async function updateUserRole(formData: FormData): Promise<void> {
    'use server';

    const { supabase } = await requireRole('admin');
    const userId = formData.get('user_id') as string;
    const newRole = formData.get('role') as ProfileRole;

    if (!userId || !newRole) return;

    const profileUpdate: Database['public']['Tables']['profiles']['Update'] = {
      role: newRole,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('profiles')
      .update(profileUpdate)
      .eq('id', userId);

    revalidatePath('/admin');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">
          Admin Console
        </h1>
        <p className="text-slate-600 font-light mt-2">
          Logged in as {profile.full_name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Guides
              </CardTitle>
              <UserCheck size={20} className="text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {typedGuides.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {approvedGuides} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Pending Reviews
              </CardTitle>
              <Clock size={20} className="text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">{pendingGuides}</p>
            <p className="text-xs text-slate-500 mt-1">
              Guides awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Bookings
              </CardTitle>
              <Calendar size={20} className="text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {typedBookings.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {pendingBookings} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">
                Total Users
              </CardTitle>
              <Users size={20} className="text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-900">
              {typedUsers.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">All registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b-2 border-slate-100 pb-1">
        <Button
          asChild
          variant={activeTab === 'guides' ? 'default' : 'ghost'}
          size="lg"
        >
          <Link href="/admin?tab=guides" className="gap-2">
            <UserCheck size={18} />
            Guides
          </Link>
        </Button>
        <Button
          asChild
          variant={activeTab === 'bookings' ? 'default' : 'ghost'}
          size="lg"
        >
          <Link href="/admin?tab=bookings" className="gap-2">
            <Calendar size={18} />
            Bookings
          </Link>
        </Button>
        <Button
          asChild
          variant={activeTab === 'users' ? 'default' : 'ghost'}
          size="lg"
        >
          <Link href="/admin?tab=users" className="gap-2">
            <Users size={18} />
            Users
          </Link>
        </Button>
      </div>

      {/* Guides Tab */}
      {activeTab === 'guides' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-serif font-bold text-slate-900">
              Guides Management
            </h2>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {typedGuides.length} total
            </Badge>
          </div>

          {typedGuides.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="py-16 text-center text-slate-500">
                No guides found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {typedGuides.map((guide) => {
                const statusInfo = guideStatusConfig[guide.status];
                const createdDate = new Date(guide.created_at);

                return (
                  <Card
                    key={guide.id}
                    className="shadow-md hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                              <UserCheck size={20} className="text-slate-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-lg text-slate-900">
                                {guide.profile?.full_name || 'Unknown'}{' '}
                                {/* ⚠️ full_name, not display_name */}
                              </p>
                              <Badge
                                variant={statusInfo.variant}
                                className="mt-1"
                              >
                                {statusInfo.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="pl-13 space-y-1">
                            <p className="text-sm text-slate-600">
                              {guide.city?.name || 'No city'} •{' '}
                              {guide.base_price_4h
                                ? `$${guide.base_price_4h}/4h`
                                : 'No rate set'}{' '}
                              • Joined {createdDate.toLocaleDateString()}
                            </p>
                            {guide.headline && (
                              <p className="text-sm text-slate-500 italic">
                                &ldquo;{guide.headline}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 lg:flex-col">
                          {guide.status !== 'approved' && (
                            <form
                              action={updateGuideStatus}
                              className="flex-1 lg:flex-none"
                            >
                              <input
                                type="hidden"
                                name="guide_id"
                                value={guide.id}
                              />
                              <input
                                type="hidden"
                                name="status"
                                value="approved"
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant="default"
                                className="w-full lg:w-28 gap-2"
                              >
                                <CheckCircle2 size={16} />
                                Approve
                              </Button>
                            </form>
                          )}
                          {guide.status !== 'rejected' && (
                            <form
                              action={updateGuideStatus}
                              className="flex-1 lg:flex-none"
                            >
                              <input
                                type="hidden"
                                name="guide_id"
                                value={guide.id}
                              />
                              <input
                                type="hidden"
                                name="status"
                                value="rejected"
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant="destructive"
                                className="w-full lg:w-28 gap-2"
                              >
                                <XCircle size={16} />
                                Reject
                              </Button>
                            </form>
                          )}
                          {guide.status !== 'pending' && (
                            <form
                              action={updateGuideStatus}
                              className="flex-1 lg:flex-none"
                            >
                              <input
                                type="hidden"
                                name="guide_id"
                                value={guide.id}
                              />
                              <input
                                type="hidden"
                                name="status"
                                value="pending"
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant="outline"
                                className="w-full lg:w-28 gap-2"
                              >
                                <RotateCcw size={16} />
                                Reset
                              </Button>
                            </form>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-serif font-bold text-slate-900">
              Bookings Management
            </h2>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {typedBookings.length} recent
            </Badge>
          </div>

          {typedBookings.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="py-16 text-center text-slate-500">
                No bookings found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {typedBookings.map((booking) => {
                const statusInfo = bookingStatusConfig[booking.status];
                // ⚠️ start_at, not starts_at
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const bookingData = booking as any;
                const startDate = new Date(
                  bookingData.start_at || bookingData.starts_at,
                );

                return (
                  <Card key={booking.id} className="shadow-md">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <Calendar size={20} className="text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">
                              {booking.traveler?.full_name || 'Unknown'} →{' '}
                              {booking.guide?.full_name || 'Unknown'}{' '}
                              {/* ⚠️ full_name, not display_name */}
                            </p>
                            <Badge
                              variant={statusInfo.variant}
                              className="mt-1"
                            >
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>

                        <div className="pl-13 text-sm text-slate-600 space-y-1">
                          <p>
                            {booking.city?.name || 'Unknown city'} •{' '}
                            {startDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}{' '}
                            at{' '}
                            {startDate.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                          <p>
                            {booking.duration_hours}h •{' '}
                            {booking.currency || 'USD'} {booking.price_total}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-4 border-t">
                          <span className="text-xs text-slate-500 self-center font-medium">
                            Override status:
                          </span>
                          {(
                            [
                              'pending',
                              'accepted',
                              'confirmed',
                              'declined',
                              'cancelled',
                              'paid',
                            ] as BookingStatus[]
                          ).map((status) => (
                            <form key={status} action={updateBookingStatus}>
                              <input
                                type="hidden"
                                name="booking_id"
                                value={booking.id}
                              />
                              <input
                                type="hidden"
                                name="status"
                                value={status}
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant={
                                  booking.status === status
                                    ? 'default'
                                    : 'outline'
                                }
                                disabled={booking.status === status}
                                className="text-xs"
                              >
                                {status}
                              </Button>
                            </form>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-serif font-bold text-slate-900">
              Users Management
            </h2>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {typedUsers.length} total
            </Badge>
          </div>

          {typedUsers.length === 0 ? (
            <Card className="shadow-md">
              <CardContent className="py-16 text-center text-slate-500">
                No users found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {typedUsers.map((user) => {
                const createdDate = new Date(user.created_at);

                return (
                  <Card key={user.id} className="shadow-md">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <Shield size={20} className="text-slate-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-900">
                              {user.full_name}
                            </p>{' '}
                            {/* ⚠️ full_name, not display_name */}
                            <Badge
                              variant={
                                user.role === 'admin'
                                  ? 'default'
                                  : user.role === 'guide'
                                    ? 'secondary'
                                    : 'outline'
                              }
                              className="mt-1"
                            >
                              {user.role}
                            </Badge>
                          </div>
                        </div>

                        <div className="pl-13 text-sm text-slate-600">
                          <p>
                            ID: {user.id.substring(0, 8)}... • Joined{' '}
                            {createdDate.toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-4 border-t">
                          <span className="text-xs text-slate-500 self-center font-medium">
                            Change role:
                          </span>
                          {(
                            ['traveler', 'guide', 'admin'] as ProfileRole[]
                          ).map((role) => (
                            <form key={role} action={updateUserRole}>
                              <input
                                type="hidden"
                                name="user_id"
                                value={user.id}
                              />
                              <input type="hidden" name="role" value={role} />
                              <Button
                                type="submit"
                                size="sm"
                                variant={
                                  user.role === role ? 'default' : 'outline'
                                }
                                disabled={user.role === role}
                                className="text-xs capitalize"
                              >
                                {role}
                              </Button>
                            </form>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
