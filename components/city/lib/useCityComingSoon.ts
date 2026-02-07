"use client";

import { useState, useCallback } from "react";

export function useCityComingSoon(cityName: string) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!email.trim()) return;

      // Simulated capture — v2 stub
      setSubmitted(true);
      setToast({
        message: `You're on the list! We'll email you when we launch in ${cityName}.`,
        type: "success",
      });
    },
    [email, cityName]
  );

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    email,
    setEmail,
    submitted,
    toast,
    hideToast,
    handleSubmit,
  };
}
