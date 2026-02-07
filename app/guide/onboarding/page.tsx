'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  GuideOnboardingData,
  guideOnboardingSchema,
} from '@/lib/validations/guide-onboarding';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { StepBasicInfo } from '@/components/guide/onboarding/step-basic-info';
import { StepAlignment } from '@/components/guide/onboarding/step-alignment';
import { StepSpecialties } from '@/components/guide/onboarding/step-specialties';
import { StepRates } from '@/components/guide/onboarding/step-rates';
import { StepAvailability } from '@/components/guide/onboarding/step-availability';
import { StepVerification } from '@/components/guide/onboarding/step-verification';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { resolveOrCreateCity } from '@/lib/actions/resolve-city';
import { getCountryName } from '@/components/form/lib/use-global-locations';

const STEPS = [
  'Basics',
  'Alignment',
  'Experience',
  'Rates',
  'Availability',
  'Verification',
];

export default function GuideOnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guideExists, setGuideExists] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const form = useForm<GuideOnboardingData>({
    resolver: zodResolver(guideOnboardingSchema),
    defaultValues: {
      display_name: '',
      city_name: '',
      country_code: '',
      bio: '',
      lgbtq_alignment: {
        affirms_identity: false,
        agrees_conduct: false,
        no_sexual_services: false,
        why_guiding: '',
        expectations: '',
      },
      specialties: [],
      languages: ['English'],
      headline: '',
      about: '',
      base_price_4h: 0,
      base_price_6h: 0,
      base_price_8h: 0,
      currency: 'USD',
      available_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      typical_start_time: '09:00',
      typical_end_time: '18:00',
    },
    mode: 'onChange', // Validate on change to enable Next button check
  });

  // Load existing draft on mount
  useEffect(() => {
    async function loadDraft() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);

      console.log('📄 [Onboarding] Loading user data for:', user.id);

      // Load profile data
      const { data: profile, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('❌ [Onboarding] Profile load error:', profileError);
      }

      // Check if guide record exists (draft) - include city+country for reverse lookup
      const { data: guide, error: guideError } = await (supabase as any)
        .from('guides')
        .select('*, city:cities!guides_city_id_fkey(name, country_code, country_name)')
        .eq('id', user.id)
        .single();

      if (!guideError && guide) {
        console.log('📄 [Onboarding] Loading existing draft:', guide);
        setGuideExists(true);

        // Reverse-map city_id to city_name + country_code for the form
        const cityName = guide.city?.name || '';
        const countryCode = guide.city?.country_code || '';

        // Populate form with existing data
        form.reset({
          display_name: profile?.full_name || user.email || '',
          city_name: cityName,
          country_code: countryCode,
          bio: guide.bio || '',
          lgbtq_alignment: guide.lgbtq_alignment || {
            affirms_identity: false,
            agrees_conduct: false,
            no_sexual_services: false,
            why_guiding: '',
            expectations: '',
          },
          specialties: guide.experience_tags || [],
          languages: guide.languages || ['English'],
          headline: guide.tagline || '',
          about: guide.about || '',
          base_price_4h: parseFloat(guide.price_4h || '0'),
          base_price_6h: parseFloat(guide.price_6h || '0'),
          base_price_8h: parseFloat(guide.price_8h || '0'),
          currency: guide.currency || 'EUR',
          available_days: guide.available_days || [
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
          ],
          typical_start_time: guide.typical_start_time || '09:00',
          typical_end_time: guide.typical_end_time || '18:00',
        });
        console.log('✅ [Onboarding] Form populated with existing data');
      } else {
        // No guide record yet, just set display name from profile
        console.log('📄 [Onboarding] No existing draft, starting fresh');
        if (profile?.full_name) {
          form.setValue('display_name', profile.full_name);
        }
      }
    }

    loadDraft();
  }, [form]);

  // Auto-save current step data
  const saveCurrentStep = async () => {
    if (!userId) return;

    setIsSaving(true);
    const data = form.getValues();

    console.log('💾 [Onboarding] Auto-saving step', currentStep, data);

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error('Supabase client not initialized');

      // Resolve city name + country code → city_id (auto-creates if needed)
      let resolvedCityId: string | null = null;
      if (data.city_name && data.country_code) {
        const countryName = getCountryName(data.country_code);
        const { cityId, error: cityError } = await resolveOrCreateCity(
          data.city_name,
          data.country_code,
          countryName,
        );
        if (cityError) {
          console.warn('⚠️ [Onboarding] City resolution warning:', cityError);
        } else {
          resolvedCityId = cityId;
        }
      }

      const guideData = {
        city_id: resolvedCityId,
        tagline: data.headline || null,
        bio: data.bio || null,
        about: data.about || null,
        experience_tags: data.specialties || [],
        languages: data.languages || [],
        price_4h: data.base_price_4h?.toString() || null,
        price_6h: data.base_price_6h?.toString() || null,
        price_8h: data.base_price_8h?.toString() || null,
        currency: data.currency || 'EUR',
        available_days: data.available_days || [],
        typical_start_time: data.typical_start_time || null,
        typical_end_time: data.typical_end_time || null,
        lgbtq_alignment: data.lgbtq_alignment || null,
        status: 'draft', // Save as draft until final submission
        approved: false,
      };

      if (guideExists) {
        // Update existing record
        console.log('💾 [Onboarding] Updating existing guide...');
        const { error } = await (supabase as any)
          .from('guides')
          .update(guideData)
          .eq('id', userId);

        if (error) throw error;
      } else {
        // Create new record
        console.log('💾 [Onboarding] Creating new guide...');
        const { error } = await (supabase as any)
          .from('guides')
          .insert({ id: userId, ...guideData });

        if (error) throw error;
        setGuideExists(true);
      }

      console.log('✅ [Onboarding] Auto-save successful');
    } catch (err: any) {
      console.error('❌ [Onboarding] Auto-save error:', err);
      // Don't block progression on save error
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = async () => {
    // Validate fields for current step before moving
    let fieldsToValidate: (keyof GuideOnboardingData)[] = [];

    switch (currentStep) {
      case 0:
        fieldsToValidate = ['display_name', 'country_code', 'city_name', 'bio'];
        break;
      case 1:
        fieldsToValidate = ['lgbtq_alignment'];
        break;
      case 2:
        fieldsToValidate = ['specialties', 'languages', 'headline', 'about'];
        break;
      case 3:
        fieldsToValidate = ['base_price_4h', 'currency'];
        break;
      // ... allow loose validation for optional steps or handle explicitly
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      // Auto-save before moving to next step
      await saveCurrentStep();

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

    console.log('🟢 [Onboarding] Final submission with data:', data);

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) throw new Error('Supabase client failed to initialize');

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      console.log('🟢 [Onboarding] User ID:', user.id);

      // Ensure city is resolved before final submission
      if (data.city_name && data.country_code) {
        const countryName = getCountryName(data.country_code);
        const { cityId, error: cityError } = await resolveOrCreateCity(
          data.city_name,
          data.country_code,
          countryName,
        );
        if (cityError || !cityId) {
          throw new Error(cityError || 'Failed to resolve city');
        }

        // Update guide with resolved city_id
        const { error: cityUpdateError } = await (supabase as any)
          .from('guides')
          .update({ city_id: cityId })
          .eq('id', user.id);

        if (cityUpdateError) {
          console.warn('⚠️ [Onboarding] City ID update warning:', cityUpdateError);
        }
      }

      // Save final data one more time
      await saveCurrentStep();

      // Update status from 'draft' to 'pending' (ready for admin review)
      console.log('🟢 [Onboarding] Submitting for review...');

      const { error: statusError } = await (supabase as any)
        .from('guides')
        .update({
          status: 'pending',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (statusError) {
        console.error('❌ [Onboarding] Status update error:', statusError);
        throw statusError;
      }

      // Update profile display name if provided
      if (data.display_name && data.display_name !== user.email) {
        console.log(
          '🟢 [Onboarding] Updating profile full_name to:',
          data.display_name,
        );

        const { error: profileError } = await (supabase as any)
          .from('profiles')
          .update({ full_name: data.display_name })
          .eq('id', user.id);

        if (profileError) {
          console.warn('⚠️ [Onboarding] Profile update warning:', profileError);
        }
      }

      console.log('✅ [Onboarding] Application submitted for review!');

      // Dispatch event to update UserMenu
      window.dispatchEvent(new Event('profile-updated'));

      // Small delay to ensure DB commit
      await new Promise((resolve) => setTimeout(resolve, 500));

      router.push('/guide/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('❌ [Onboarding] Error:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Become a Guide</h1>
          {isSaving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </div>
          )}
        </div>
        <Progress
          value={((currentStep + 1) / STEPS.length) * 100}
          className="h-2"
        />
        <div className="text-sm text-muted-foreground text-right">
          Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep]}
        </div>
        {guideExists && (
          <div className="text-xs text-emerald-600 text-right">
            ✓ Draft saved automatically
          </div>
        )}
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
              variant="bordered"
              onClick={prevStep}
              disabled={currentStep === 0 || isSubmitting || isSaving}
            >
              Back
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={nextStep} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Next Step'
                )}
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Review'
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
