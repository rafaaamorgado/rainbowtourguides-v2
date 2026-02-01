import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
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
import { AdminGuideAction } from '@/components/admin/guide-action-buttons';
import { ApproveAllGuidesButton } from '@/components/admin/approve-all-guides-button';

export default async function AdminGuidesPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
    },
  );

  const { data: guides, error } = await supabase
    .from('guides')
    .select(
      `
      *,
      profile:profiles!guides_id_fkey(full_name, email)
    `,
    )
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Guide Verification Queue</h1>
        {guides && guides.length > 0 && (
          <ApproveAllGuidesButton count={guides.length} />
        )}
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Applicant</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!guides || guides.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No pending applications.
                </TableCell>
              </TableRow>
            ) : (
              guides.map((guide: any) => (
                <TableRow key={guide.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{guide.profile?.full_name}</p>
                      <p className="text-xs text-muted-foreground">
                        ID: {guide.id.slice(0, 6)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{guide.city_id}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {guide.themes?.slice(0, 2).map((t: string) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(guide.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <AdminGuideAction guideId={guide.id} />
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
