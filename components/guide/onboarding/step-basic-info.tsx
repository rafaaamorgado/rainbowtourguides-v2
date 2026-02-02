'use client';

import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { uploadAvatar, getCurrentUserId } from '@/lib/storage-helpers';

interface StepBasicInfoProps {
  form: UseFormReturn<GuideOnboardingData>;
}

export function StepBasicInfo({ form }: StepBasicInfoProps) {
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCities() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) return;
      const { data } = await (supabase.from('cities') as any)
        .select('id, name')
        .order('name');
      if (data) setCities(data);
    }
    fetchCities();
  }, []);

  const handleAvatarUpload = async (file: File) => {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to upload photos',
      };
    }
    return uploadAvatar(userId, file);
  };

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
        name="city_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Primary City</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onChange={field.onChange}
                options={cities.map((city) => ({
                  value: city.id,
                  label: city.name,
                }))}
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
