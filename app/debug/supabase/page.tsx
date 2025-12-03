import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function SupabaseDebugPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("pg_settings").select("name, setting").limit(1);

  return (
    <div className="space-y-4 py-12">
      <div>
        <h1 className="text-3xl font-semibold">Supabase connectivity check</h1>
        <p className="text-muted-foreground">
          Remove this debug page once Supabase is wired into real routes.
        </p>
      </div>
      <pre className="rounded-lg bg-muted p-4 text-sm">
        {JSON.stringify(
          error
            ? { ok: false, error: error.message }
            : { ok: true, rows: data },
          null,
          2
        )}
      </pre>
    </div>
  );
}

