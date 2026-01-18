'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

export function ApproveAllGuidesButton({ count }: { count: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleApproveAll = async () => {
    if (
      !confirm(
        `Are you sure you want to approve all ${count} pending guides? This action cannot be undone.`
      )
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/approve-all-guides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve guides');
      }

      alert(`✅ Successfully approved ${data.count} guides!`);
      router.refresh();
    } catch (error) {
      console.error('[ApproveAllGuidesButton] Error:', error);
      alert(
        `❌ Failed to approve guides: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleApproveAll}
      disabled={loading}
      className="bg-green-600 hover:bg-green-700"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Approving...
        </>
      ) : (
        <>
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Approve All ({count})
        </>
      )}
    </Button>
  );
}
