"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Toast, useToast } from "@/components/ui/toast";
import { resendVerificationEmail } from "./actions";

export function ResendVerificationButton({ email }: { email: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast, toast, hideToast } = useToast();

  async function handleResend() {
    setIsSubmitting(true);
    const result = await resendVerificationEmail(email);
    setIsSubmitting(false);
    if (result.success) {
      showToast("Verification email sent. Check your inbox.", "success");
    } else {
      showToast(result.error ?? "Something went wrong.", "error");
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleResend}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending…" : "Resend verification email"}
      </Button>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </>
  );
}
