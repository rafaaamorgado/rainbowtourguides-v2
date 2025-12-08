"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type VerifySessionProps = {
  sessionId: string;
};

export function VerifySession({ sessionId }: VerifySessionProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch(`/api/checkout/verify-session?session=${sessionId}`);
        const data = await response.json();

        if (data.ok) {
          setStatus("success");
          // Remove session param from URL and refresh
          setTimeout(() => {
            router.replace("/traveler/bookings");
            router.refresh();
          }, 2000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        console.error("[VerifySession] Error:", error);
        setStatus("error");
      }
    };

    verify();
  }, [sessionId, router]);

  if (status === "verifying") {
    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          Verifying payment...
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-sm font-semibold text-green-900 dark:text-green-100">
          Payment successful! Your booking has been confirmed.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
      <p className="text-sm text-destructive">
        Failed to verify payment. Please contact support if you were charged.
      </p>
    </div>
  );
}

