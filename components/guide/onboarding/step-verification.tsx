'use client';

import { UseFormReturn } from "react-hook-form";
import { GuideOnboardingData } from "@/lib/validations/guide-onboarding";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StepVerificationProps {
    form: UseFormReturn<GuideOnboardingData>;
}

export function StepVerification({ form }: StepVerificationProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Identity Verification</h2>
                <p className="text-sm text-muted-foreground">
                    To ensure safety and process payouts, we need to verify your identity.
                </p>
            </div>

            <div className="p-6 border rounded-lg bg-muted/20 space-y-4">
                <div className="flex items-center gap-4">
                    {/* Stripe Logo Placeholder */}
                    <div className="h-8 w-20 bg-[#635BFF] rounded flex items-center justify-center text-white font-bold text-xs">
                        Stripe
                    </div>
                    <div>
                        <h3 className="font-medium">Connect Payouts & Identity</h3>
                        <p className="text-sm text-muted-foreground">Securely linked via Stripe Connect.</p>
                    </div>
                </div>

                <Alert variant="default" className="bg-blue-50 border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-800">Process after submission</AlertTitle>
                    <AlertDescription className="text-blue-700">
                        After you submit this form, you will be redirected to Stripe to verify your identity and link your bank account for payouts.
                    </AlertDescription>
                </Alert>

                {/* 
          In a real implementation, we might show "Connect with Stripe" button here if we wanted to verify BEFORE submit,
          but usually it's cleaner to Submit -> Create DB Record -> Redirect to Stripe.
        */}
            </div>
        </div>
    );
}
