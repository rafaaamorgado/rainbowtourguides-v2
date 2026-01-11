"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CityDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("City detail page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
      <div className="text-center space-y-6 p-6">
        <ErrorState
          title="Unable to load city"
          message="We're having trouble loading this city. The city may not exist or there may be a connection issue."
          onRetry={reset}
          variant="card"
        />
        <div className="pt-4">
          <Button asChild variant="outline">
            <Link href="/cities">Browse all cities</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
