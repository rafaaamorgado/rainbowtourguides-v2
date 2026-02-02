'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { uploadFile, getCurrentUserId } from '@/lib/storage-helpers';
import type { Database } from '@/types/database';

type City = Database['public']['Tables']['cities']['Row'];

export type Step1Data = {
  displayName: string;
  avatarUrl: string | null;
  cityId: string;
  languages: string;
  shortBio: string;
};

type Step1BasicInfoProps = {
  data: Step1Data;
  cities: City[];
  onChange: (data: Partial<Step1Data>) => void;
};

export function Step1BasicInfo({
  data,
  cities,
  onChange,
}: Step1BasicInfoProps) {
  const handlePhotoUpload = async (file: File) => {
    const userId = await getCurrentUserId();
    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to upload photos',
      };
    }

    return uploadFile(file, 'guide-photos', userId, 'profile-photo');
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-serif">Basic Information</CardTitle>
        <CardDescription>
          Let&apos;s start with the essentials. Tell us about yourself and where
          you guide.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Display Name */}
        <div className="space-y-2">
          <label
            htmlFor="displayName"
            className="text-sm font-medium text-slate-700"
          >
            Your Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="displayName"
            value={data.displayName}
            onChange={(e) => onChange({ displayName: e.target.value })}
            placeholder="e.g., Alex Rivera"
            required
          />
          <p className="text-xs text-slate-500">
            This is how travelers will see your name on your profile.
          </p>
        </div>

        {/* Photo Upload */}
        <PhotoUpload
          variant="photo"
          size="md"
          value={data.avatarUrl}
          onChange={(url) =>
            onChange({ avatarUrl: typeof url === 'string' ? url : null })
          }
          onUpload={handlePhotoUpload}
          label="Profile Photo"
          helperText="A friendly, professional photo helps travelers connect with you. PNG, JPG up to 5MB."
          maxSizeMB={5}
        />

        {/* City Selection */}
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium text-slate-700">
            Your City <span className="text-destructive">*</span>
          </label>
          <Select
            value={data.cityId}
            onChange={(val) => onChange({ cityId: val })}
            options={[
              { value: '', label: 'Select your city...' },
              ...cities.map((city) => ({
                value: city.id,
                label: `${city.name}${city.country_name ? `, ${city.country_name}` : ''}`,
              })),
            ]}
            placeholder="Select your city..."
            className="h-11"
          />
          <p className="text-xs text-slate-500">
            Which city will you be guiding in?
          </p>
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <label
            htmlFor="languages"
            className="text-sm font-medium text-slate-700"
          >
            Languages You Speak <span className="text-destructive">*</span>
          </label>
          <Input
            id="languages"
            value={data.languages}
            onChange={(e) => onChange({ languages: e.target.value })}
            placeholder="e.g., English, Spanish, Portuguese"
            required
          />
          <p className="text-xs text-slate-500">
            Separate multiple languages with commas.
          </p>
        </div>

        {/* Short Bio */}
        <div className="space-y-2">
          <label
            htmlFor="shortBio"
            className="text-sm font-medium text-slate-700"
          >
            Short Bio <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="shortBio"
            value={data.shortBio}
            onChange={(e) => onChange({ shortBio: e.target.value })}
            placeholder="Tell us a bit about yourself and your experience as a guide..."
            rows={4}
            maxLength={500}
            required
          />
          <p className="text-xs text-slate-500">
            {data.shortBio.length}/500 characters
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
