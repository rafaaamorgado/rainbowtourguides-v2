'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Eye,
  ExternalLink,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import type { GuideStatus } from '@/types/database';

interface GuideRow {
  id: string;
  status: GuideStatus;
  slug: string | null;
  bio: string | null;
  phone_number: string | null;
  id_document_url: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  profile: { full_name: string; avatar_url: string | null } | null;
  city: { name: string; country_name: string | null } | null;
}

const TABS: { label: string; value: GuideStatus | 'all'; count?: number }[] = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' },
];

const STATUS_CONFIG: Record<
  GuideStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-slate-100 text-slate-700',
    icon: FileText,
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800',
    icon: Clock,
  },
  approved: {
    label: 'Approved',
    className: 'bg-emerald-100 text-emerald-800',
    icon: CheckCircle2,
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

export function AdminGuidesTable({ guides }: { guides: GuideRow[] }) {
  const [activeTab, setActiveTab] = useState<GuideStatus | 'all'>('pending');

  const filteredGuides =
    activeTab === 'all'
      ? guides
      : guides.filter((g) => g.status === activeTab);

  const tabCounts: Record<GuideStatus | 'all', number> = {
    draft: guides.filter((g) => g.status === 'draft').length,
    pending: guides.filter((g) => g.status === 'pending').length,
    approved: guides.filter((g) => g.status === 'approved').length,
    rejected: guides.filter((g) => g.status === 'rejected').length,
    all: guides.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink">Guide Verification</h1>
        <p className="text-ink-soft mt-1">
          Review and manage guide applications.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
        {TABS.map((tab) => {
          const count = tabCounts[tab.value];
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-white text-ink shadow-sm'
                  : 'text-ink-soft hover:text-ink',
              )}
            >
              {tab.label}
              {count > 0 && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-semibold',
                    isActive
                      ? tab.value === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-ink-soft'
                      : 'bg-slate-200/70 text-ink-soft',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">City</TableHead>
              <TableHead className="font-semibold">Submitted</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Docs</TableHead>
              <TableHead className="text-right font-semibold">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGuides.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-ink-soft"
                >
                  No guides in this category.
                </TableCell>
              </TableRow>
            ) : (
              filteredGuides.map((guide) => {
                const statusCfg = STATUS_CONFIG[guide.status];
                const StatusIcon = statusCfg.icon;
                const hasDocuments = !!guide.id_document_url;
                const cityLabel = guide.city
                  ? `${guide.city.name}${guide.city.country_name ? `, ${guide.city.country_name}` : ''}`
                  : '—';

                return (
                  <TableRow key={guide.id} className="group">
                    <TableCell>
                      <div>
                        <p className="font-medium text-ink">
                          {guide.profile?.full_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-ink-soft">
                          {guide.id.slice(0, 8)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-ink-soft">
                      {cityLabel}
                    </TableCell>
                    <TableCell className="text-sm text-ink-soft">
                      {new Date(guide.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn('gap-1', statusCfg.className)}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusCfg.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {hasDocuments ? (
                        <FileCheck className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <span className="text-xs text-ink-soft">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Public Profile */}
                        {guide.slug && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="View Public Profile"
                            asChild
                          >
                            <Link
                              href={`/guides/${guide.slug}`}
                              target="_blank"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}

                        {/* Review */}
                        <Button size="sm" asChild>
                          <Link href={`/admin/guides/${guide.id}`}>
                            <Eye className="mr-1.5 h-4 w-4" />
                            Review
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
