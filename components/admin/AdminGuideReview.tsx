'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ExternalLink,
  Phone,
  Instagram,
  Facebook,
  MessageCircle,
  Globe,
  FileText,
  Shield,
  User,
  MapPin,
  DollarSign,
  Calendar,
  EyeOff,
  Eye,
} from 'lucide-react';
import {
  approveGuide,
  rejectGuide,
  suspendGuide,
  unsuspendGuide,
} from '@/lib/actions/admin-actions';
import type { GuideStatus } from '@/types/database';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GuideData {
  id: string;
  status: GuideStatus;
  slug: string | null;
  bio: string | null;
  headline: string | null;
  tagline: string | null;
  about: string | null;
  languages: string[] | null;
  themes: string[] | null;
  experience_tags: string[] | null;
  available_days: string[] | null;
  typical_start_time: string | null;
  typical_end_time: string | null;
  price_4h: string | null;
  price_6h: string | null;
  price_8h: string | null;
  hourly_rate: string | null;
  currency: string | null;
  lgbtq_alignment: Record<string, any> | null;
  // Verification
  id_document_url: string | null;
  proof_of_address_url: string | null;
  phone_number: string | null;
  social_instagram: string | null;
  social_facebook: string | null;
  social_twitter: string | null;
  social_whatsapp: string | null;
  social_telegram: string | null;
  social_zalo: string | null;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    languages: string[] | null;
    pronouns: string | null;
    country_of_origin: string | null;
    created_at: string;
  } | null;
  city: {
    name: string;
    country_name: string | null;
    country_code: string | null;
  } | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  GuideStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  draft: { label: 'Draft', className: 'bg-slate-100 text-slate-700', icon: FileText },
  pending: { label: 'Pending Review', className: 'bg-amber-100 text-amber-800', icon: Clock },
  approved: { label: 'Approved', className: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: XCircle },
};

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-ink-soft" />
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-ink">{value || '—'}</dd>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminGuideReview({ guide }: { guide: GuideData }) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState(guide.admin_notes || '');
  const [actionError, setActionError] = useState<string | null>(null);

  const [isSuspending, setIsSuspending] = useState(false);

  const statusCfg = STATUS_CONFIG[guide.status];
  const StatusIcon = statusCfg.icon;

  const handleSuspend = async () => {
    if (
      !confirm(
        'Hide this guide? Their profile will be removed from public listings immediately.',
      )
    )
      return;
    setIsSuspending(true);
    setActionError(null);

    const result = await suspendGuide(guide.id, 'Profile hidden by admin');
    if (!result.success) {
      setActionError(result.error || 'Failed to suspend');
      setIsSuspending(false);
      return;
    }

    router.refresh();
    setIsSuspending(false);
  };

  const handleUnsuspend = async () => {
    if (
      !confirm('Restore this guide? Their profile will become live again.')
    )
      return;
    setIsSuspending(true);
    setActionError(null);

    const result = await unsuspendGuide(guide.id);
    if (!result.success) {
      setActionError(result.error || 'Failed to restore');
      setIsSuspending(false);
      return;
    }

    router.refresh();
    setIsSuspending(false);
  };

  const handleApprove = async () => {
    if (!confirm('Approve this guide? They will become live on the platform.')) return;
    setIsApproving(true);
    setActionError(null);

    const result = await approveGuide(guide.id);
    if (!result.success) {
      setActionError(result.error || 'Failed to approve');
      setIsApproving(false);
      return;
    }

    router.refresh();
    setIsApproving(false);
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setActionError('Please provide a reason for rejection.');
      return;
    }
    setIsRejecting(true);
    setActionError(null);

    const result = await rejectGuide(guide.id, rejectReason.trim());
    if (!result.success) {
      setActionError(result.error || 'Failed to reject');
      setIsRejecting(false);
      return;
    }

    router.refresh();
    setIsRejecting(false);
    setShowRejectForm(false);
  };

  const cityLabel = guide.city
    ? `${guide.city.name}${guide.city.country_name ? `, ${guide.city.country_name}` : ''}`
    : 'Not specified';

  const currency = guide.currency || 'USD';
  const isPending = guide.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/guides">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to list
          </Link>
        </Button>
      </div>

      {/* Title bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-pride-lilac to-pride-mint">
            {guide.profile?.avatar_url ? (
              <Image
                src={guide.profile.avatar_url}
                alt={guide.profile.full_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white">
                {(guide.profile?.full_name ?? 'G').charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-ink">
              {guide.profile?.full_name || 'Unknown Guide'}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="secondary" className={cn('gap-1', statusCfg.className)}>
                <StatusIcon className="h-3 w-3" />
                {statusCfg.label}
              </Badge>
              <span className="text-sm text-ink-soft">{cityLabel}</span>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          {guide.slug && (
            <Button variant="bordered" size="sm" asChild>
              <Link href={`/guides/${guide.slug}`} target="_blank">
                <ExternalLink className="mr-1.5 h-4 w-4" />
                Public Profile
              </Link>
            </Button>
          )}

          {/* Hide / Restore Profile toggle */}
          {guide.status === 'approved' && (
            <Button
              variant="bordered"
              size="sm"
              onClick={handleSuspend}
              disabled={isSuspending}
              className="border-orange-300 text-orange-700 hover:bg-orange-50"
            >
              {isSuspending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <EyeOff className="mr-1.5 h-4 w-4" />
              )}
              Hide Profile
            </Button>
          )}
          {guide.status === 'draft' && guide.reviewed_at && (
            <Button
              variant="bordered"
              size="sm"
              onClick={handleUnsuspend}
              disabled={isSuspending}
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              {isSuspending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Eye className="mr-1.5 h-4 w-4" />
              )}
              Restore Profile
            </Button>
          )}
        </div>
      </div>

      {/* Action error */}
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {actionError}
        </div>
      )}

      {/* Action buttons for pending guides */}
      {isPending && (
        <div className="flex flex-col gap-4 rounded-xl border-2 border-amber-200 bg-amber-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-amber-900">This guide is awaiting your review</p>
            <p className="text-sm text-amber-800">
              Review the information below, then approve or reject.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="bordered"
              onClick={() => setShowRejectForm(!showRejectForm)}
              disabled={isApproving || isRejecting}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <XCircle className="mr-1.5 h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isApproving || isRejecting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isApproving ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1.5 h-4 w-4" />
              )}
              Approve
            </Button>
          </div>
        </div>
      )}

      {/* Reject form */}
      {showRejectForm && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 space-y-3">
          <p className="font-semibold text-red-900">Rejection Reason</p>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Explain why this application is being rejected. This will be emailed to the guide and shown on their dashboard."
            rows={3}
            className="bg-white"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRejectForm(false)}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleReject}
              disabled={isRejecting || !rejectReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isRejecting ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-1.5 h-4 w-4" />
              )}
              Confirm Rejection
            </Button>
          </div>
        </div>
      )}

      {/* Existing admin notes */}
      {guide.admin_notes && guide.status === 'rejected' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
            Admin Notes
          </p>
          <p className="mt-1 text-sm text-red-800">{guide.admin_notes}</p>
        </div>
      )}

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ---- Left column ---- */}
        <div className="space-y-6">
          {/* Verification Documents */}
          <Section title="Verification Documents" icon={Shield}>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2">
                  Government ID
                </p>
                {guide.id_document_url ? (
                  <a
                    href={guide.id_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative h-48 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <Image
                        src={guide.id_document_url}
                        alt="Government ID"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="mt-1 text-xs text-brand hover:underline">
                      Open full size
                    </p>
                  </a>
                ) : (
                  <p className="text-sm text-ink-soft italic">Not uploaded</p>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-soft mb-2">
                  Proof of Address
                </p>
                {guide.proof_of_address_url ? (
                  <a
                    href={guide.proof_of_address_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative h-48 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      <Image
                        src={guide.proof_of_address_url}
                        alt="Proof of Address"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="mt-1 text-xs text-brand hover:underline">
                      Open full size
                    </p>
                  </a>
                ) : (
                  <p className="text-sm text-ink-soft italic">Not uploaded</p>
                )}
              </div>
            </div>
          </Section>

          {/* Contact & Socials */}
          <Section title="Contact & Socials" icon={Phone}>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Phone"
                value={
                  guide.phone_number ? (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {guide.phone_number}
                    </span>
                  ) : null
                }
              />
              <Field
                label="Instagram"
                value={
                  guide.social_instagram ? (
                    <span className="flex items-center gap-1">
                      <Instagram className="h-3 w-3" />
                      {guide.social_instagram}
                    </span>
                  ) : null
                }
              />
              <Field
                label="Facebook"
                value={
                  guide.social_facebook ? (
                    <span className="flex items-center gap-1">
                      <Facebook className="h-3 w-3" />
                      {guide.social_facebook}
                    </span>
                  ) : null
                }
              />
              <Field
                label="WhatsApp"
                value={
                  guide.social_whatsapp ? (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {guide.social_whatsapp}
                    </span>
                  ) : null
                }
              />
              <Field
                label="Telegram"
                value={
                  guide.social_telegram ? (
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      {guide.social_telegram}
                    </span>
                  ) : null
                }
              />
              <Field
                label="X / Twitter"
                value={guide.social_twitter}
              />
              <Field label="Zalo" value={guide.social_zalo} />
            </dl>
          </Section>
        </div>

        {/* ---- Right column ---- */}
        <div className="space-y-6">
          {/* Profile Info */}
          <Section title="Profile" icon={User}>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Field label="Full Name" value={guide.profile?.full_name} />
              <Field label="Pronouns" value={guide.profile?.pronouns} />
              <Field label="Country of Origin" value={guide.profile?.country_of_origin} />
              <Field
                label="Member Since"
                value={
                  guide.profile?.created_at
                    ? new Date(guide.profile.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : null
                }
              />
            </dl>
            {guide.bio && (
              <div className="mt-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  Bio
                </dt>
                <dd className="mt-1 text-sm text-ink whitespace-pre-line">
                  {guide.bio}
                </dd>
              </div>
            )}
          </Section>

          {/* Tour Details */}
          <Section title="Tour Details" icon={MapPin}>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Field label="City" value={cityLabel} />
              <Field
                label="Languages"
                value={
                  guide.languages?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {guide.languages.map((l) => (
                        <Badge key={l} variant="secondary" className="text-xs">
                          {l}
                        </Badge>
                      ))}
                    </div>
                  ) : null
                }
              />
              <Field
                label="Headline"
                value={guide.headline || guide.tagline}
              />
              <Field
                label="Specialties"
                value={
                  guide.experience_tags?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {guide.experience_tags.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ) : null
                }
              />
            </dl>
            {guide.about && (
              <div className="mt-4">
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-soft">
                  About the Tour
                </dt>
                <dd className="mt-1 text-sm text-ink whitespace-pre-line">
                  {guide.about}
                </dd>
              </div>
            )}
          </Section>

          {/* Pricing */}
          <Section title="Pricing" icon={DollarSign}>
            <dl className="grid gap-3 sm:grid-cols-3">
              <Field
                label="4 Hours"
                value={
                  guide.price_4h
                    ? `${currency} ${parseFloat(guide.price_4h).toFixed(0)}`
                    : null
                }
              />
              <Field
                label="6 Hours"
                value={
                  guide.price_6h
                    ? `${currency} ${parseFloat(guide.price_6h).toFixed(0)}`
                    : null
                }
              />
              <Field
                label="8 Hours"
                value={
                  guide.price_8h
                    ? `${currency} ${parseFloat(guide.price_8h).toFixed(0)}`
                    : null
                }
              />
            </dl>
          </Section>

          {/* Availability */}
          <Section title="Availability" icon={Calendar}>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Available Days"
                value={
                  guide.available_days?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {guide.available_days.map((d) => (
                        <Badge key={d} variant="secondary" className="text-xs capitalize">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  ) : null
                }
              />
              <Field
                label="Hours"
                value={
                  guide.typical_start_time && guide.typical_end_time
                    ? `${guide.typical_start_time} – ${guide.typical_end_time}`
                    : null
                }
              />
            </dl>
          </Section>

          {/* LGBTQ+ Alignment */}
          {guide.lgbtq_alignment && (
            <Section title="LGBTQ+ Alignment" icon={Globe}>
              <dl className="grid gap-3">
                <Field
                  label="Affirms Identity"
                  value={guide.lgbtq_alignment.affirms_identity ? 'Yes' : 'No'}
                />
                <Field
                  label="Agrees to Code of Conduct"
                  value={guide.lgbtq_alignment.agrees_conduct ? 'Yes' : 'No'}
                />
                <Field
                  label="Why Guiding"
                  value={guide.lgbtq_alignment.why_guiding}
                />
                <Field
                  label="Expectations"
                  value={guide.lgbtq_alignment.expectations}
                />
              </dl>
            </Section>
          )}
        </div>
      </div>

      {/* Timestamps */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-ink-soft">
        <div className="flex flex-wrap gap-6">
          <span>
            Created:{' '}
            {new Date(guide.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          <span>
            Updated:{' '}
            {new Date(guide.updated_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {guide.reviewed_at && (
            <span>
              Reviewed:{' '}
              {new Date(guide.reviewed_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
