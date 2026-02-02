'use client';

import { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Get current user ID for folder path
      const userId = await getCurrentUserId();
      if (!userId) {
        setUploadError('You must be logged in to upload photos');
        setIsUploading(false);
        return;
      }

      // Upload to Supabase Storage
      const result = await uploadFile(
        file,
        'guide-photos',
        userId,
        'profile-photo',
      );

      if (result.success && result.url) {
        onChange({ avatarUrl: result.url });
      } else {
        setUploadError(result.error || 'Failed to upload photo');
      }
    } catch (error) {
      setUploadError('An unexpected error occurred');
    } finally {
      setIsUploading(false);
    }
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
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Profile Photo <span className="text-destructive">*</span>
          </label>

          {isUploading ? (
            <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-brand rounded-2xl bg-brand/5">
              <Loader2 size={32} className="text-brand animate-spin mb-2" />
              <p className="text-sm font-medium text-slate-700">
                Uploading photo...
              </p>
            </div>
          ) : data.avatarUrl ? (
            <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-200">
              <img
                src={data.avatarUrl}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange({ avatarUrl: null })}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-lg hover:bg-slate-100 transition-colors"
                disabled={isUploading}
              >
                <X size={16} className="text-slate-600" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="photo"
              className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-2xl transition-colors ${
                uploadError
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-300 cursor-pointer hover:border-brand hover:bg-slate-50'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                  <Upload size={24} className="text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700">
                    Upload a photo
                  </p>
                  <p className="text-xs text-slate-500">PNG, JPG up to 5MB</p>
                </div>
              </div>
              <input
                id="photo"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={isUploading}
              />
            </label>
          )}

          {uploadError && (
            <p className="text-xs text-red-600 font-medium">{uploadError}</p>
          )}

          {!uploadError && (
            <p className="text-xs text-slate-500">
              A friendly, professional photo helps travelers connect with you.
            </p>
          )}
        </div>

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
