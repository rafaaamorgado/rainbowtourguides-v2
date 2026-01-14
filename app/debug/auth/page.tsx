import { createSupabaseServerClient } from '@/lib/supabase-server';

export default async function DebugAuthPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="p-8 font-mono">
      <h1 className="text-xl font-bold mb-4">Auth Debug</h1>
      <p>loggedIn: {user ? 'true' : 'false'}</p>
      <p>email: {user?.email ?? 'none'}</p>
    </div>
  );
}
