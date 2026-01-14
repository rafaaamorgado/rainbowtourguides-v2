"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { getCities } from "@/lib/data-service";
import type { City } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "./progress-indicator";
import {
  Step1BasicInfo,
  Step2LGBTQAlignment,
  Step3ExperienceTags,
  Step4Pricing,
  Step5Availability,
  Step6IDUpload,
  Step7Review,
} from "./steps";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { uploadGuidePhoto } from "@/lib/storage-helpers";

const STORAGE_KEY = "guide_onboarding_draft";

export default function GuideOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [cities, setCities] = useState<City[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({
    // Step 1
    photo_url: "",
    name: "",
    city_id: "",
    languages: [],
    bio: "",
    tagline: "",
    // Step 2
    identifies_lgbtq: false,
    is_ally: false,
    why_guide_lgbtq: "",
    safety_commitment: false,
    // Step 3
    experience_tags: [],
    tour_description: "",
    // Step 4
    price_4h: 0,
    price_6h: 0,
    price_8h: 0,
    // Step 5
    available_days: [],
    time_ranges: [],
    availability_notes: "",
    // Step 6
    id_document: "",
    // Step 7
    terms_accepted: false,
  });
  const [errors, setErrors] = useState<any>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load cities
    getCities().then(setCities);

    // Get user ID for file uploads
    const supabase = createSupabaseBrowserClient();
    if (supabase) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          setUserId(user.id);
        }
      });
    }

    // Load draft from localStorage
    const draft = localStorage.getItem(STORAGE_KEY);
    if (draft) {
      try {
        setFormData(JSON.parse(draft));
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, []);

  const handlePhotoUpload = useCallback(
    async (file: File) => {
      if (!userId) {
        return { success: false, error: "Not authenticated" };
      }
      return uploadGuidePhoto(userId, file);
    },
    [userId]
  );

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    // Clear error for this field
    setErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  const saveDraft = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    alert("Draft saved successfully!");
  };

  const validateStep = (step: number): boolean => {
    const newErrors: any = {};

    switch (step) {
      case 1:
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.city_id) newErrors.city_id = "City is required";
        if (!formData.languages || formData.languages.length === 0)
          newErrors.languages = "Select at least one language";
        if (!formData.bio || formData.bio.length < 200)
          newErrors.bio = "Bio must be at least 200 characters";
        if (!formData.tagline) newErrors.tagline = "Tagline is required";
        break;

      case 2:
        if (!formData.why_guide_lgbtq || formData.why_guide_lgbtq.length < 100)
          newErrors.why_guide_lgbtq = "Please write at least 100 characters";
        if (!formData.safety_commitment)
          newErrors.safety_commitment = "You must commit to safety standards";
        break;

      case 3:
        if (!formData.experience_tags || formData.experience_tags.length < 3)
          newErrors.experience_tags = "Select at least 3 experience tags";
        if (!formData.tour_description || formData.tour_description.length < 150)
          newErrors.tour_description = "Description must be at least 150 characters";
        break;

      case 4:
        if (!formData.price_4h || formData.price_4h < 50)
          newErrors.price_4h = "Minimum price is $50";
        if (!formData.price_6h || formData.price_6h < 75)
          newErrors.price_6h = "Minimum price is $75";
        if (!formData.price_8h || formData.price_8h < 100)
          newErrors.price_8h = "Minimum price is $100";
        break;

      case 5:
        if (!formData.available_days || formData.available_days.length === 0)
          newErrors.available_days = "Select at least one day";
        if (!formData.time_ranges || formData.time_ranges.length === 0)
          newErrors.time_ranges = "Select at least one time range";
        break;

      case 6:
        if (!formData.id_document)
          newErrors.id_document = "ID document is required";
        break;

      case 7:
        if (!formData.terms_accepted)
          newErrors.terms_accepted = "You must accept the terms";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 7));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!validateStep(7)) return;

    // Mock: Save to localStorage
    localStorage.setItem("guide_profile_submitted", JSON.stringify(formData));
    localStorage.removeItem(STORAGE_KEY); // Clear draft

    setShowSuccess(true);

    // Redirect after 2 seconds
    setTimeout(() => {
      router.push("/guide/dashboard");
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-ink mb-2">
              Profile Submitted!
            </h2>
            <p className="text-ink-soft">
              Your profile has been submitted for review. We'll notify you once
              it's approved, usually within 24-48 hours.
            </p>
          </div>
          <p className="text-sm text-ink-soft">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink mb-2">Guide Onboarding</h1>
        <p className="text-ink-soft">
          Complete your profile to start accepting bookings
        </p>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator currentStep={currentStep} />

      {/* Step Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        {currentStep === 1 && (
          <Step1BasicInfo
            data={formData}
            cities={cities}
            onChange={handleChange}
            onPhotoUpload={userId ? handlePhotoUpload : undefined}
            errors={errors}
          />
        )}
        {currentStep === 2 && (
          <Step2LGBTQAlignment
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 3 && (
          <Step3ExperienceTags
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 4 && (
          <Step4Pricing
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 5 && (
          <Step5Availability
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 6 && (
          <Step6IDUpload
            data={formData}
            onChange={handleChange}
            errors={errors}
          />
        )}
        {currentStep === 7 && (
          <Step7Review
            data={formData}
            cities={cities}
            onChange={handleChange}
            errors={errors}
          />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}

          <Button
            onClick={saveDraft}
            variant="ghost"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
        </div>

        {currentStep < 7 ? (
          <Button
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-8"
          >
            Submit for Review
            <CheckCircle className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
