import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Try to get the user's profile to show role
  const { data: profile } = (await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()) as { data: { role: string; full_name: string } | null };

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>

          {profile?.full_name && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{profile.full_name}</p>
            </div>
          )}

          {profile?.role && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium capitalize">{profile.role}</p>
            </div>
          )}

          <div className="pt-4 space-y-2">
            {profile?.role === 'guide' && (
              <Link href="/guide/dashboard">
                <Button variant="bordered" className="w-full">
                  Go to Guide Dashboard
                </Button>
              </Link>
            )}
            {profile?.role === 'traveler' && (
              <Link href="/traveler/bookings">
                <Button variant="bordered" className="w-full">
                  Go to My Bookings
                </Button>
              </Link>
            )}
            {profile?.role === 'admin' && (
              <Link href="/admin">
                <Button variant="bordered" className="w-full">
                  Go to Admin Panel
                </Button>
              </Link>
            )}
            <Link href="/auth/sign-out">
              <Button variant="ghost" className="w-full">
                Sign Out
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
