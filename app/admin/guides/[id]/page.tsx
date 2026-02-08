import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth-helpers';
import { AdminGuideReview } from '@/components/admin/AdminGuideReview';

interface Props {
  params: Promise<{ id: string }>;
}

/**
 * Admin Guide Review — server component that fetches all guide data
 * and delegates to a client component for approve/reject actions.
 */
export default async function AdminGuideReviewPage({ params }: Props) {
  const { id } = await params;
  const { supabase } = await requireRole('admin');

  const { data: guide, error } = await (supabase as any)
    .from('guides')
    .select(
      `
      *,
      profile:profiles!guides_id_fkey(id, full_name, avatar_url, bio, languages, pronouns, country_of_origin, created_at),
      city:cities!guides_city_id_fkey(name, country_name, country_code)
    `,
    )
    .eq('id', id)
    .single();

  if (error || !guide) {
    notFound();
  }

  return <AdminGuideReview guide={guide} />;
}
