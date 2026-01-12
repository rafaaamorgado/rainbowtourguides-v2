"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "./StepIndicator";
import { Step1BasicInfo, type Step1Data } from "./Step1BasicInfo";
import { Step2LGBTQAlignment, type Step2Data } from "./Step2LGBTQAlignment";
import { Step3ExperienceTags, type Step3Data } from "./Step3ExperienceTags";
import { Step4Pricing, type Step4Data } from "./Step4Pricing";
import { Step5Availability, type Step5Data } from "./Step5Availability";
import { Step6IDUpload, type Step6Data } from "./Step6IDUpload";
import { Step7Review } from "./Step7Review";
import type { Database } from "@/types/database";

type City = Database["public"]["Tables"]["cities"]["Row"];

const STEP_TITLES = [
  "Basic Info",
  "LGBTQ+ Alignment",
  "Experience Tags",
  "Pricing",
  "Availability",
  "ID Upload",
  "Review",
];

type OnboardingWizardProps = {
  cities: City[];
  profileName: string;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
};

export function OnboardingWizard({ cities, profileName, onSubmit }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [step1Data, setStep1Data] = useState<Step1Data>({
    displayName: profileName,
    photoUrl: null,
    cityId: "",
    languages: "",
    shortBio: "",
  });

  const [step2Data, setStep2Data] = useState<Step2Data>({
    identifiesAsLGBTQ: false,
    allyCommitment: false,
    safespaceAdvocate: false,
    whyGuideQueer: "",
  });

  const [step3Data, setStep3Data] = useState<Step3Data>({
    experienceTags: [],
  });

  const [step4Data, setStep4Data] = useState<Step4Data>({
    rate4h: "",
    rate6h: "",
    rate8h: "",
    currency: "USD",
  });

  const [step5Data, setStep5Data] = useState<Step5Data>({
    availableDays: [],
    startTime: "09:00",
    endTime: "18:00",
  });

  const [step6Data, setStep6Data] = useState<Step6Data>({
    idDocumentUrl: null,
    idDocumentType: "",
  });

  // Validation for each step
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          step1Data.displayName &&
          step1Data.photoUrl &&
          step1Data.cityId &&
          step1Data.languages &&
          step1Data.shortBio
        );
      case 2:
        return !!(
          (step2Data.identifiesAsLGBTQ || step2Data.allyCommitment || step2Data.safespaceAdvocate) &&
          step2Data.whyGuideQueer.length >= 50
        );
      case 3:
        return step3Data.experienceTags.length > 0;
      case 4:
        return !!(step4Data.rate4h && step4Data.rate6h && step4Data.rate8h);
      case 5:
        return !!(step5Data.availableDays.length > 0 && step5Data.startTime && step5Data.endTime);
      case 6:
        return !!(step6Data.idDocumentUrl && step6Data.idDocumentType);
      case 7:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed() && currentStep < 7) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    // Create FormData with all the collected information
    const formData = new FormData();

    // Step 1
    formData.set("full_name", step1Data.displayName); // ⚠️ full_name, not display_name
    formData.set("city_id", step1Data.cityId);
    formData.set("languages", step1Data.languages);
    formData.set("short_bio", step1Data.shortBio);
    if (step1Data.photoUrl) {
      formData.set("photo_url", step1Data.photoUrl);
    }

    // Step 2
    formData.set("lgbtq_alignment", JSON.stringify({
      identifiesAsLGBTQ: step2Data.identifiesAsLGBTQ,
      allyCommitment: step2Data.allyCommitment,
      safespaceAdvocate: step2Data.safespaceAdvocate,
    }));
    formData.set("why_guide_queer", step2Data.whyGuideQueer);

    // Step 3
    formData.set("experience_tags", JSON.stringify(step3Data.experienceTags));

    // Step 4
    formData.set("rate_4h", step4Data.rate4h);
    formData.set("rate_6h", step4Data.rate6h);
    formData.set("rate_8h", step4Data.rate8h);
    formData.set("currency", step4Data.currency);

    // Step 5
    formData.set("available_days", JSON.stringify(step5Data.availableDays));
    formData.set("start_time", step5Data.startTime);
    formData.set("end_time", step5Data.endTime);

    // Step 6
    formData.set("id_document_type", step6Data.idDocumentType);
    if (step6Data.idDocumentUrl) {
      formData.set("id_document_url", step6Data.idDocumentUrl);
    }

    const result = await onSubmit(formData);

    setIsSubmitting(false);

    if (result.success) {
      router.push("/guide/dashboard");
    } else {
      setError(result.error || "Failed to submit. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Progress Indicator */}
        <StepIndicator
          currentStep={currentStep}
          totalSteps={7}
          stepTitles={STEP_TITLES}
        />

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="animate-fade-in">
          {currentStep === 1 && (
            <Step1BasicInfo
              data={step1Data}
              cities={cities}
              onChange={(data) => setStep1Data({ ...step1Data, ...data })}
            />
          )}
          {currentStep === 2 && (
            <Step2LGBTQAlignment
              data={step2Data}
              onChange={(data) => setStep2Data({ ...step2Data, ...data })}
            />
          )}
          {currentStep === 3 && (
            <Step3ExperienceTags
              data={step3Data}
              onChange={(data) => setStep3Data({ ...step3Data, ...data })}
            />
          )}
          {currentStep === 4 && (
            <Step4Pricing
              data={step4Data}
              onChange={(data) => setStep4Data({ ...step4Data, ...data })}
            />
          )}
          {currentStep === 5 && (
            <Step5Availability
              data={step5Data}
              onChange={(data) => setStep5Data({ ...step5Data, ...data })}
            />
          )}
          {currentStep === 6 && (
            <Step6IDUpload
              data={step6Data}
              onChange={(data) => setStep6Data({ ...step6Data, ...data })}
            />
          )}
          {currentStep === 7 && (
            <Step7Review
              step1={step1Data}
              step2={step2Data}
              step3={step3Data}
              step4={step4Data}
              step5={step5Data}
              step6={step6Data}
              cities={cities}
              onEdit={(step) => setCurrentStep(step)}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="gap-2"
          >
            <ChevronLeft size={20} />
            Back
          </Button>

          {currentStep < 7 ? (
            <Button
              type="button"
              size="lg"
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="gap-2"
            >
              Next
              <ChevronRight size={20} />
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? "Submitting..." : (
                <>
                  Submit for Review
                  <Send size={20} />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
