'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";

export function AdminGuideAction({ guideId }: { guideId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
    
  const handleAction = async (status: 'approved' | 'rejected') => {
      if (!confirm(`Are you sure you want to ${status} this guide?`)) return;
      setLoading(true);

      try {
          const res = await fetch("/api/admin/guides/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guideId, status }),
          });
          if (!res.ok) {
            throw new Error("Failed to update guide status");
          }
          router.refresh();
      } catch (err) {
          console.error(err);
          alert("Action failed");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="flex justify-end gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="w-8 h-8 p-0"
        title="Reject"
        onClick={() => handleAction('rejected')}
        disabled={loading}
      >
         <X className="h-4 w-4 text-red-500" />
      </Button>
      <Button 
        size="sm" 
        className="w-8 h-8 p-0 bg-green-600 hover:bg-green-700"
        title="Approve"
        onClick={() => handleAction('approved')}
        disabled={loading}
      >
         {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>
    </div>
  );
}
