'use client';

import { UseFormReturn } from 'react-hook-form';
import { GuideOnboardingData } from '@/lib/validations/guide-onboarding';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { CountrySelect } from '@/components/form/CountrySelect';
import { CitySelect } from '@/components/form/CitySelect';
import { useStepBasicInfo } from './lib/use-step-basic-info';

interface StepBasicInfoProps {
  form: UseFormReturn<GuideOnboardingData>;
}

export function StepBasicInfo({ form }: StepBasicInfoProps) {
  const { avatarUrl, setAvatarUrl, handleAvatarUpload } = useStepBasicInfo(form);

  const selectedCountry = form.watch('country_code');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Account & Basics</h2>
        <p className="text-sm text-muted-foreground">
          Let's start with your public profile details.
        </p>
      </div>

      {/* Profile Photo Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-medium">Profile Photo</h3>
          <p className="text-sm text-muted-foreground">
            Your main profile photo visible to travelers
          </p>
        </div>
        <PhotoUpload
          variant="avatar"
          size="lg"
          value={avatarUrl}
          onChange={(url) => setAvatarUrl(typeof url === 'string' ? url : null)}
          onUpload={handleAvatarUpload}
          placeholder={form.watch('display_name') || 'G'}
          helperText="JPG, PNG, WebP or GIF. Max 2MB."
        />
      </div>

      <FormField
        control={form.control}
        name="display_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Display Name</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Alex" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="country_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <CountrySelect
                value={field.value}
                onChange={(val) => {
                  field.onChange(val);
                  // Reset city when country changes
                  form.setValue('city_name', '');
                }}
                placeholder="Select your country"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="city_name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary City</FormLabel>
            <FormControl>
              <CitySelect
                countryCode={selectedCountry}
                value={field.value}
                onChange={field.onChange}
                placeholder="Select your city"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Tell travelers a bit about yourself..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
