"use client";

import { ErrorState } from "@/components/ui/error-state";

export default function GuideDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
      <ErrorState
        title="Unable to load dashboard"
        message="We're having trouble loading your guide dashboard. Please try again."
        onRetry={reset}
        variant="card"
      />
    </div>
  );
}
