import { createSupabaseServerClient } from '@/lib/supabase-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function TestConnectionPage() {
  const results: Array<{
    test: string;
    status: 'success' | 'error';
    message: string;
  }> = [];

  // Test 1: Check Supabase client initialization
  try {
    const supabase = await createSupabaseServerClient();
    results.push({
      test: '✅ Supabase Client',
      status: 'success',
      message: 'Client created successfully',
    });

    // Test 2: Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (hasUrl && hasKey) {
      results.push({
        test: '✅ Environment Variables',
        status: 'success',
        message:
          'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set',
      });
    } else {
      results.push({
        test: '❌ Environment Variables',
        status: 'error',
        message: `Missing: ${!hasUrl ? 'URL ' : ''}${!hasKey ? 'ANON_KEY' : ''}`,
      });
    }

    // Test 3: Check access to cities table
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('id, name')
      .limit(1);

    if (citiesError) {
      results.push({
        test: '❌ Cities Table',
        status: 'error',
        message: `Error: ${citiesError.message}`,
      });
    } else {
      results.push({
        test: '✅ Cities Table',
        status: 'success',
        message: `Access granted. Found ${cities?.length || 0} records`,
      });
    }

    // Test 4: Check access to profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name')
      .limit(1);

    if (profilesError) {
      results.push({
        test: '❌ Profiles Table',
        status: 'error',
        message: `Error: ${profilesError.message}`,
      });
    } else {
      results.push({
        test: '✅ Profiles Table',
        status: 'success',
        message: `Access granted. Found ${profiles?.length || 0} records`,
      });
    }

    // Test 5: Check access to guides table
    const { data: guides, error: guidesError } = await supabase
      .from('guides')
      .select('id, headline')
      .limit(1);

    if (guidesError) {
      results.push({
        test: '❌ Guides Table',
        status: 'error',
        message: `Error: ${guidesError.message}`,
      });
    } else {
      results.push({
        test: '✅ Guides Table',
        status: 'success',
        message: `Access granted. Found ${guides?.length || 0} records`,
      });
    }

    // Test 6: Check authentication status
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      results.push({
        test: '⚠️ Auth Status',
        status: 'success',
        message: 'User not authenticated (expected for test)',
      });
    } else if (user) {
      results.push({
        test: '✅ Auth Status',
        status: 'success',
        message: `Authenticated as: ${user.email || user.id}`,
      });
    }

    // Test 7: Check Storage access
    const { data: buckets, error: storageError } =
      await supabase.storage.listBuckets();

    if (storageError) {
      results.push({
        test: '❌ Storage',
        status: 'error',
        message: `Error: ${storageError.message}`,
      });
    } else {
      results.push({
        test: '✅ Storage',
        status: 'success',
        message: `Access granted. Found ${buckets?.length || 0} buckets`,
      });
    }
  } catch (error) {
    results.push({
      test: '❌ Critical Error',
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  const successCount = results.filter((r) => r.status === 'success').length;
  const totalCount = results.length;

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">🔌 Supabase Connection Test</h1>
        <p className="text-lg text-slate-600">
          Results:{' '}
          <span className="font-bold text-brand">
            {successCount}/{totalCount}
          </span>{' '}
          tests passed
        </p>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        {results.map((result, index) => (
          <Card
            key={index}
            className={
              result.status === 'error' ? 'border-red-300' : 'border-green-300'
            }
          >
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {result.test}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={
                  result.status === 'error' ? 'text-red-600' : 'text-slate-600'
                }
              >
                {result.message}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Success message */}
      {successCount === totalCount && (
        <div className="mt-8 p-6 bg-green-50 border-2 border-green-300 rounded-lg text-center">
          <p className="text-xl font-bold text-green-800">
            🎉 All tests passed! Supabase is connected correctly.
          </p>
        </div>
      )}

      {/* Warning message */}
      {successCount < totalCount && (
        <div className="mt-8 p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <p className="text-lg font-semibold text-yellow-800 mb-2">
            ⚠️ Some tests failed
          </p>
          <p className="text-sm text-yellow-700">
            Check your environment variables in .env.local and Row Level
            Security settings in Supabase.
          </p>
        </div>
      )}
    </div>
  );
}
