import { requireRole } from '@/lib/auth-helpers';
import { AdminGuidesTable } from '@/components/admin/AdminGuidesTable';

/**
 * Admin Guides page — fetches all guides with profile + city data
 * and delegates rendering to a client component with tab filtering.
 */
export default async function AdminGuidesPage() {
  const { supabase } = await requireRole('admin');

  const { data: guides, error } = await (supabase as any)
    .from('guides')
    .select(
      `
      id,
      status,
      slug,
      bio,
      phone_number,
      id_document_url,
      admin_notes,
      created_at,
      updated_at,
      profile:profiles!guides_id_fkey(full_name, avatar_url),
      city:cities!guides_city_id_fkey(name, country_name)
    `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="p-6 text-red-600">
        Error loading guides: {error.message}
      </div>
    );
  }

  return <AdminGuidesTable guides={guides || []} />;
}
