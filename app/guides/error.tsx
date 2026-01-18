"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function GuidesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
      <ErrorState
        title="Unable to load guides"
        message="We're having trouble loading the guides. Please try again."
        onRetry={reset}
        variant="card"
      />
    </div>
  );
}
