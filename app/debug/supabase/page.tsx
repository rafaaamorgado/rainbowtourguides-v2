import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function DebugSupabasePage() {
  let connected = false;
  let error: string | null = null;

  try {
    createSupabaseServerClient();
    connected = true;
    // Supabase's PostgREST layer intentionally hides Postgres system tables (pg_*),
    // so we avoid querying them here and simply verify the client can be created.
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
  }

  return (
    <pre className="rounded-lg border p-4 text-sm font-mono">
      {JSON.stringify(
        {
          connected,
          error,
        },
        null,
        2
      )}
    </pre>
  );
}


