import { requireRole } from '@/lib/auth-helpers';
import { AdminSidebar } from './sidebar';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';

/**
 * Admin layout — uses canonical requireRole helper.
 * Middleware already protects /admin/*, so requireRole here is for:
 * 1. Getting the profile for the sidebar
 * 2. Belt-and-suspenders role check
 *
 * Additional query for pending guides count (badge in sidebar).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, profile } = await requireRole('admin');

  // Admin-specific data for sidebar
  const { count: pendingGuidesCount } = await supabase
    .from('guides')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar
        profile={profile}
        pendingGuidesCount={pendingGuidesCount || 0}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top bar with search */}
        <div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm px-8 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-end">
            <AdminSearchBar />
          </div>
        </div>

        <main className="p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
