"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type PayButtonProps = {
  bookingId: string;
};

export function PayButton({ bookingId }: PayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checkout session");
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
      <Button size="sm" onClick={handlePay} disabled={isLoading}>
        {isLoading ? "Loading..." : "Request Booking"}
      </Button>
    </div>
  );
}
