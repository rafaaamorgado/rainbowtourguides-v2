import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  FileText,
  UserCheck,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react';
import { requireRole } from '@/lib/auth-helpers';
import { getStoragePublicUrlServer } from '@/lib/storage-helpers-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Database } from '@/types/database';

type Guide = Database['public']['Tables']['guides']['Row'];

type PendingGuideWithDetails = Guide & {
  profile: {
    id: string;
    display_name: string;
    avatar_url: string | null;
  } | null;
  city: {
    name: string;
    country_name: string | null;
  } | null;
  verification: {
    id_document_url: string;
    id_document_type: string;
    verification_status: string;
  } | null;
};

// Note: This route is protected - only admin users can access
export default async function AdminGuidesPage() {
  const { supabase, profile } = await requireRole('admin');

  // Fetch all guides with status = "pending"
  const { data: pendingGuidesData } = await supabase
    .from('guides')
    .select(
      `
      *,
      profile:id(id, display_name, avatar_url),
      city:city_id(name, country_name),
      verification:guide_verifications!guide_verifications_guide_id_fkey(
        id_document_url,
        id_document_type,
        verification_status
      )
    `,
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  const pendingGuides = (pendingGuidesData ??
    []) as unknown as PendingGuideWithDetails[];

  // Process avatar URLs for all guides
  const guidesWithProcessedAvatars = await Promise.all(
    pendingGuides.map(async (guide) => ({
      ...guide,
      profile: guide.profile
        ? {
            ...guide.profile,
            avatar_url: await getStoragePublicUrlServer(
              guide.profile.avatar_url,
              'guide-photos',
            ),
          }
        : null,
    })),
  );

  // Server action: Approve guide
  async function approveGuide(formData: FormData): Promise<void> {
    'use server';

    const { supabase } = await requireRole('admin');
    const guideId = formData.get('guide_id') as string;

    if (!guideId) return;

    // Update guide status to approved
    const guideUpdate: Database['public']['Tables']['guides']['Update'] = {
      status: 'approved',
      is_verified: true,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('guides')
      .update(guideUpdate)
      .eq('id', guideId);

    // Update verification status if exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('guide_verifications')
      .update({ verification_status: 'approved' })
      .eq('guide_id', guideId);

    revalidatePath('/admin/guides');
  }

  // Server action: Reject guide
  async function rejectGuide(formData: FormData): Promise<void> {
    'use server';

    const { supabase } = await requireRole('admin');
    const guideId = formData.get('guide_id') as string;
    const reason = formData.get('reason') as string | null;

    if (!guideId) return;

    // Update guide status to rejected
    const guideUpdate: Database['public']['Tables']['guides']['Update'] = {
      status: 'rejected',
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('guides')
      .update(guideUpdate)
      .eq('id', guideId);

    // Update verification status if exists
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('guide_verifications')
      .update({
        verification_status: 'rejected',
        rejection_reason: reason,
      })
      .eq('guide_id', guideId);

    revalidatePath('/admin/guides');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">
            Guide Approvals
          </h1>
          <p className="text-slate-600 font-light mt-2">
            Review and approve pending guide applications
          </p>
        </div>
        <Button asChild variant="outline" size="lg">
          <Link href="/admin" className="gap-2">
            <UserCheck size={18} />
            Back to Admin
          </Link>
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-600">
              Pending Approvals
            </CardTitle>
            <Clock size={20} className="text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-slate-900">
            {pendingGuides.length}
          </p>
          <p className="text-xs text-slate-500 mt-1">Guides awaiting review</p>
        </CardContent>
      </Card>

      {/* Guides Table */}
      {pendingGuides.length === 0 ? (
        <Card className="shadow-md">
          <CardContent className="py-16 text-center">
            <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              All caught up!
            </h3>
            <p className="text-slate-600">
              There are no pending guide applications to review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-md">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Guide</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Email (User ID)</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead>ID Document</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guidesWithProcessedAvatars.map((guide) => {
                    const createdDate = new Date(guide.created_at);
                    const verification = Array.isArray(guide.verification)
                      ? guide.verification[0]
                      : guide.verification;

                    return (
                      <TableRow key={guide.id}>
                        {/* Guide Name & Avatar */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {guide.profile?.avatar_url ? (
                              <img
                                src={guide.profile.avatar_url}
                                alt={guide.profile.display_name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-slate-200"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                                <UserCheck
                                  size={20}
                                  className="text-slate-400"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">
                                {guide.profile?.display_name || 'Unknown'}
                              </p>
                              <Badge
                                variant="secondary"
                                className="text-xs mt-1"
                              >
                                Pending
                              </Badge>
                            </div>
                          </div>
                        </TableCell>

                        {/* City */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-slate-400" />
                            <span className="text-sm text-slate-700">
                              {guide.city?.name || 'N/A'}
                              {guide.city?.country_name && (
                                <span className="text-slate-500">
                                  , {guide.city.country_name}
                                </span>
                              )}
                            </span>
                          </div>
                        </TableCell>

                        {/* Email / User ID */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail size={14} className="text-slate-400" />
                            <code className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                              {guide.profile?.id.substring(0, 8)}...
                            </code>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            (Email: Check auth.users)
                          </p>
                        </TableCell>

                        {/* Applied Date */}
                        <TableCell>
                          <p className="text-sm text-slate-700">
                            {createdDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-slate-500">
                            {createdDate.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </p>
                        </TableCell>

                        {/* View Profile Link */}
                        <TableCell>
                          {guide.slug ? (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <Link
                                href={`/guides/${guide.slug}`}
                                target="_blank"
                              >
                                <ExternalLink size={14} />
                                View
                              </Link>
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No profile
                            </span>
                          )}
                        </TableCell>

                        {/* ID Document Link */}
                        <TableCell>
                          {verification?.id_document_url ? (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              <a
                                href={verification.id_document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FileText size={14} />
                                {verification.id_document_type}
                              </a>
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              No document
                            </span>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Approve Button */}
                            <form action={approveGuide}>
                              <input
                                type="hidden"
                                name="guide_id"
                                value={guide.id}
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant="default"
                                className="gap-2 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 size={14} />
                                Approve
                              </Button>
                            </form>

                            {/* Reject Button */}
                            <form action={rejectGuide}>
                              <input
                                type="hidden"
                                name="guide_id"
                                value={guide.id}
                              />
                              <input
                                type="hidden"
                                name="reason"
                                value="Rejected by admin"
                              />
                              <Button
                                type="submit"
                                size="sm"
                                variant="destructive"
                                className="gap-2"
                              >
                                <XCircle size={14} />
                                Reject
                              </Button>
                            </form>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="py-6">
          <h3 className="font-semibold text-slate-900 mb-2">
            Guide Approval Process
          </h3>
          <ul className="text-sm text-slate-700 space-y-1">
            <li>• Review guide profile information and verify completeness</li>
            <li>• Check ID document for authenticity and validity</li>
            <li>• Approve to publish guide profile and enable bookings</li>
            <li>• Reject if information is incomplete or verification fails</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
