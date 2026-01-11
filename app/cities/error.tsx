"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

export default function CitiesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Cities page error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
      <ErrorState
        title="Unable to load cities"
        message="We're having trouble loading the cities. Please try again."
        onRetry={reset}
        variant="card"
      />
    </div>
  );
}
