/* eslint-disable @typescript-eslint/no-explicit-any */
// app/(whatever)/test-connection/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getQueryLogs, getQueryStats } from '@/lib/query-logger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type DebugResult = {
  name: string;
  ok: boolean;
  ms: number;
  summary?: string;
  error?: unknown;
  payload?: unknown;
};

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function formatError(err: unknown) {
  if (!err) return null;
  if (typeof err === 'string') return err;
  if (err instanceof Error) return `${err.name}: ${err.message}`;
  return safeJson(err);
}

async function run<T>(
  name: string,
  fn: () => Promise<T>,
  summary?: (v: T) => string,
): Promise<DebugResult> {
  const t0 = Date.now();
  try {
    const payload = await fn();
    const ms = Date.now() - t0;
    return {
      name,
      ok: true,
      ms,
      summary: summary ? summary(payload) : undefined,
      payload,
    };
  } catch (error) {
    const ms = Date.now() - t0;
    return { name, ok: false, ms, error };
  }
}

export default async function TestConnectionPage() {
  const results: DebugResult[] = [];

  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  results.push({
    name: 'Environment Variables',
    ok: hasUrl && hasKey,
    ms: 0,
    summary:
      hasUrl && hasKey
        ? 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set'
        : `Missing: ${!hasUrl ? 'URL ' : ''}${!hasKey ? 'ANON_KEY' : ''}`,
    payload: {
      NEXT_PUBLIC_SUPABASE_URL: hasUrl ? 'set' : 'missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasKey ? 'set' : 'missing',
    },
  });

  const supabase = await createSupabaseServerClient();
  results.push({
    name: 'Supabase Client',
    ok: true,
    ms: 0,
    summary: 'Client created successfully',
  });

  results.push(
    await run(
      'Auth: getSession()',
      async () => {
        const res = await supabase.auth.getSession();
        return res;
      },
      (r: any) =>
        r?.data?.session
          ? `Session exists (user: ${r.data.session.user?.email ?? r.data.session.user?.id})`
          : 'No session',
    ),
  );

  results.push(
    await run(
      'Auth: getUser()',
      async () => {
        const res = await supabase.auth.getUser();
        return res;
      },
      (r: any) =>
        r?.data?.user
          ? `User: ${r.data.user.email ?? r.data.user.id}`
          : 'No user',
    ),
  );

  results.push(
    await run(
      'DB: countries (select 5)',
      async () => {
        const res = await supabase.from('countries').select('*').limit(5);
        return res;
      },
      (r: any) =>
        r?.error
          ? `Error: ${r.error.message}`
          : `Rows: ${r?.data?.length ?? 0}`,
    ),
  );

  results.push(
    await run(
      'DB: cities (select 5)',
      async () => {
        const res = await supabase.from('cities').select('*').limit(5);
        return res;
      },
      (r: any) =>
        r?.error
          ? `Error: ${r.error.message}`
          : `Rows: ${r?.data?.length ?? 0}`,
    ),
  );

  results.push(
    await run(
      'DB: profiles (select 5)',
      async () => {
        const res = await supabase
          .from('profiles')
          .select('id, role, full_name, avatar_url, is_suspended, created_at')
          .limit(5);
        return res;
      },
      (r: any) =>
        r?.error
          ? `Error: ${r.error.message}`
          : `Rows: ${r?.data?.length ?? 0}`,
    ),
  );

  results.push(
    await run(
      'DB: guides (select 5)',
      async () => {
        const res = await supabase
          .from('guides')
          .select(
            'id, city_id, headline, approved, verification_status, price_4h, price_6h, price_8h, created_at',
          )
          .limit(5);
        return res;
      },
      (r: any) =>
        r?.error
          ? `Error: ${r.error.message}`
          : `Rows: ${r?.data?.length ?? 0}`,
    ),
  );

  results.push(
    await run(
      'DB: bookings (select 5)',
      async () => {
        const res = await supabase
          .from('bookings')
          .select(
            'id, traveler_id, guide_id, city_id, start_at, duration_hours, party_size, status, price_total, currency, created_at',
          )
          .limit(5);
        return res;
      },
      (r: any) =>
        r?.error
          ? `Error: ${r.error.message}`
          : `Rows: ${r?.data?.length ?? 0}`,
    ),
  );

  results.push(
    await run(
      'DB: messages (select 5)',
      async () => {
        const res = await supabase
          .from('messages')
          .select('id, booking_id, sender_id, body, created_at')
          .limit(5);
        return res;
      },
      (r: any) =>
        r?.error
          ? `Error: ${r.error.message}`
          : `Rows: ${r?.data?.length ?? 0}`,
    ),
  );

  results.push(
    await run(
      'DB: reviews (select 5)',
      async () => {
        const res = await supabase
          .from('reviews')
          .select(
            'id, booking_id, author_id, subject_id, rating, comment, created_at',
          )
          .limit(5);
        return res;
      },
      (r: any) =>
        r?.error
          ? `Error: ${r.error.message}`
          : `Rows: ${r?.data?.length ?? 0}`,
    ),
  );

  results.push(
    await run(
      'DB: guide_unavailable_dates (select 5)',
      async () => {
        const res = await supabase
          .from('guide_unavailable_dates')
          .select('id, guide_id, start_date, end_date, reason, created_at')
          .limit(5);
        return res;
      },
      (r: any) =>
        r?.error
          ? `Error: ${r.error.message}`
          : `Rows: ${r?.data?.length ?? 0}`,
    ),
  );

  results.push(
    await run(
      'Storage: listBuckets()',
      async () => {
        const res = await supabase.storage.listBuckets();
        return res;
      },
      (r: any) =>
        r?.error
          ? `Error: ${r.error.message}`
          : `Buckets: ${r?.data?.length ?? 0}`,
    ),
  );

  const okCount = results.filter(
    (r) => r.ok && !(r.payload as any)?.error,
  ).length;
  const totalCount = results.length;

  // Get query logs if available
  let queryLogs: ReturnType<typeof getQueryLogs> = [];
  let queryStats: ReturnType<typeof getQueryStats> | null = null;

  try {
    queryLogs = getQueryLogs();
    queryStats = getQueryStats();
  } catch (error) {
    // Query logger might not be initialized yet
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">🔎 Supabase Debug</h1>
        <p className="text-lg text-slate-600">
          Passed:{' '}
          <span className="font-bold text-brand">
            {okCount}/{totalCount}
          </span>
        </p>
        <p className="text-sm text-slate-500 mt-2">
          This page prints raw responses (data + error + metadata) to understand
          what comes back from Supabase.
        </p>
      </div>

      <div className="space-y-4">
        {results.map((r, idx) => {
          const payloadError = (r.payload as any)?.error;
          const effectiveOk = r.ok && !payloadError;
          const errText =
            formatError(r.error) ??
            (payloadError ? formatError(payloadError) : null);

          return (
            <Card
              key={idx}
              className={effectiveOk ? 'border-green-300' : 'border-red-300'}
            >
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between gap-2">
                  <span>
                    {effectiveOk ? '✅' : '❌'} {r.name}
                  </span>
                  <span className="text-xs font-normal text-slate-500">
                    {r.ms} ms
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {r.summary && <p className="text-slate-700">{r.summary}</p>}
                {errText && (
                  <p className="text-red-600 whitespace-pre-wrap">{errText}</p>
                )}

                <details className="rounded-md border p-3 bg-slate-50">
                  <summary className="cursor-pointer text-sm font-medium">
                    Raw payload (data / error / status)
                  </summary>
                  <pre className="mt-3 text-xs overflow-auto whitespace-pre-wrap break-words">
                    {safeJson(r.payload ?? null)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          );
        })}

        {/* Query Logs Section */}
        {queryLogs.length > 0 && queryStats && (
          <Card className="border-blue-300">
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between gap-2">
                <span>📊 Query Logs ({queryLogs.length})</span>
                <span className="text-xs font-normal text-slate-500">
                  Avg: {queryStats.averageDuration}ms | Errors:{' '}
                  {queryStats.errors}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {queryLogs
                .slice(-20)
                .reverse()
                .map((log: any, idx: number) => (
                  <div
                    key={idx}
                    className={`text-xs p-2 rounded border ${
                      log.error
                        ? 'bg-red-50 border-red-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono">
                        {log.operation} {log.table}
                      </span>
                      {log.duration && (
                        <span className="text-slate-500">{log.duration}ms</span>
                      )}
                    </div>
                    {log.filters && (
                      <div className="text-slate-600 mt-1">
                        {Object.entries(log.filters)
                          .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
                          .join(', ')}
                      </div>
                    )}
                    {log.error && (
                      <div className="text-red-600 mt-1">
                        {log.error instanceof Error
                          ? log.error.message
                          : String(log.error)}
                      </div>
                    )}
                    <div className="text-slate-400 text-[10px] mt-1">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
