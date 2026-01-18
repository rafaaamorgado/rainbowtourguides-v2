'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GuideOnboardingData, guideOnboardingSchema } from "@/lib/validations/guide-onboarding";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { StepBasicInfo } from "@/components/guide/onboarding/step-basic-info";
import { StepAlignment } from "@/components/guide/onboarding/step-alignment";
import { StepSpecialties } from "@/components/guide/onboarding/step-specialties";
import { StepRates } from "@/components/guide/onboarding/step-rates";
import { StepAvailability } from "@/components/guide/onboarding/step-availability";
import { StepVerification } from "@/components/guide/onboarding/step-verification";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  "Basics",
  "Alignment",
  "Experience",
  "Rates",
  "Availability",
  "Verification"
];

export default function GuideOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<GuideOnboardingData>({
    resolver: zodResolver(guideOnboardingSchema),
    defaultValues: {
      lgbtq_alignment: {
        affirms_identity: false,
        agrees_conduct: false,
        no_sexual_services: false,
      },
      specialties: [],
      languages: ["English"],
      available_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      currency: "USD",
    },
    mode: "onChange", // Validate on change to enable Next button check
  });

  const nextStep = async () => {
    // Validate fields for current step before moving
    let fieldsToValidate: (keyof GuideOnboardingData)[] = [];

    switch (currentStep) {
      case 0: fieldsToValidate = ['display_name', 'city_id', 'bio']; break;
      case 1: fieldsToValidate = ['lgbtq_alignment']; break;
      case 2: fieldsToValidate = ['specialties', 'languages', 'headline', 'about']; break;
      case 3: fieldsToValidate = ['base_price_4h', 'currency']; break;
      // ... allow loose validation for optional steps or handle explicitly
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data: GuideOnboardingData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error("Supabase client failed to initialize");
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("Not authenticated");

      // 1. Create guide record
      const { error: guideError } = await supabase.from('guides').insert({
        id: user.id,
        city_id: data.city_id,
        tagline: data.headline, // mapping headline -> tagline
        bio: data.bio, // mapping bio -> bio
        about: data.about, // mapping about -> about
        specialties: data.specialties, // Wait, schema needs to support specialties? Need to check schema.
        // Schema check: "themes" text[] exists. "specialties" might map to "themes"
        themes: data.specialties,
        languages: data.languages,
        base_price_4h: data.base_price_4h,
        base_price_6h: data.base_price_6h,
        base_price_8h: data.base_price_8h,
        currency: data.currency,
        available_days: data.available_days,
        typical_start_time: data.typical_start_time,
        typical_end_time: data.typical_end_time,
        lgbtq_alignment: data.lgbtq_alignment,
        status: 'pending', // Pending admin approval
      } as any);

      if (guideError) throw guideError;

      // 2. Redirect to dashboard
      router.push('/guide/dashboard');

    } catch (err: any) {
      setError(err.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Become a Guide</h1>
        <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2" />
        <div className="text-sm text-muted-foreground text-right">
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {currentStep === 0 && <StepBasicInfo form={form} />}
          {currentStep === 1 && <StepAlignment form={form} />}
          {currentStep === 2 && <StepSpecialties form={form} />}
          {currentStep === 3 && <StepRates form={form} />}
          {currentStep === 4 && <StepAvailability form={form} />}
          {currentStep === 5 && <StepVerification form={form} />}

          {error && (
            <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0 || isSubmitting}
            >
              Back
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep}>
                Next Step
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
