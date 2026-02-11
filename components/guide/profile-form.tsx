'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhotoUpload } from '@/components/ui/photo-upload';
import { CoverUploader } from '@/components/profile/CoverUploader';
import { uploadAvatar } from '@/lib/storage-helpers';
import {
  GUIDE_SPECIALTIES,
  LANGUAGE_OPTIONS,
  CURRENCY_OPTIONS,
  SEXUAL_ORIENTATION_OPTIONS,
  PRONOUNS_OPTIONS,
} from '@/lib/constants/profile-options';
import { Loader2, ExternalLink } from 'lucide-react';
import { CountrySelect } from '@/components/form/CountrySelect';
import { CitySelect } from '@/components/form/CitySelect';
import { Select as HeroSelect, SelectItem as HeroSelectItem, Input as HeroInput } from "@heroui/react";
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Guide = Database['public']['Tables']['guides']['Row'];

interface GuideProfileFormProps {
  profile: Profile;
  guide: Guide;
  /** Initial city name from the DB (for populating the form) */
  initialCityName: string;
  /** Initial country ISO code from the DB (for populating the form) */
  initialCountryCode: string;
  onSubmit: (
    data: GuideProfileFormData,
  ) => Promise<{ success: boolean; error?: string }>;
  /** Called when profile photo is uploaded so sidebar and public page update immediately */
  onProfilePhotoUpdate?: (
    avatarUrl: string | null,
  ) => Promise<{ success: boolean; error?: string }>;
}

export interface GuideProfileFormData {
  // Basic Info (from profiles + guides)
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  city_name: string;
  country_code: string;
  sexual_orientation: string | null;
  pronouns: string | null;
  // Tour Details
  tagline: string | null;
  tour_description: string | null;
  themes: string[];
  languages: string[];
  // Pricing
  base_price_4h: string | null;
  base_price_6h: string | null;
  base_price_8h: string | null;
  currency: string;
}

export function GuideProfileForm({
  profile,
  guide,
  initialCityName,
  initialCountryCode,
  onSubmit,
  onProfilePhotoUpdate,
}: GuideProfileFormProps) {
  const [formData, setFormData] = useState<GuideProfileFormData>({
    display_name: profile.full_name || '',
    avatar_url: profile.avatar_url,
    bio: guide.bio || '',
    city_name: initialCityName || '',
    country_code: initialCountryCode || '',
    sexual_orientation: guide.sexual_orientation || null,
    pronouns: guide.pronouns || null,
    tagline: guide.tagline || '',
    tour_description: guide.tour_description || '',
    themes: guide.experience_tags || [],
    languages: guide.languages || [],
    base_price_4h: guide.price_4h || '',
    base_price_6h: guide.price_6h || '',
    base_price_8h: guide.price_8h || '',
    currency: 'USD',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAvatarUpload = useCallback(
    async (
      file: File,
    ): Promise<{ success: boolean; url?: string; error?: string }> => {
      const result = await uploadAvatar(profile.id, file);
      if (!result.success) {
        return { success: false, error: result.error };
      }
      if (!result.url) {
        return { success: false, error: 'Upload failed' };
      }
      const updateResult = await onProfilePhotoUpdate?.(result.url);
      if (updateResult && !updateResult.success) {
        return { success: false, error: updateResult.error };
      }
      setFormData((prev) => ({ ...prev, avatar_url: result.url ?? null }));
      window.dispatchEvent(new Event('profile-updated'));
      return { success: true, url: result.url };
    },
    [profile.id, onProfilePhotoUpdate],
  );

  const handleAvatarChange = (url: string | string[] | null) => {
    setFormData((prev) => ({
      ...prev,
      avatar_url: typeof url === 'string' ? url : null,
    }));
  };

  const handleChange = (
    field: keyof GuideProfileFormData,
    value: string | string[] | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await onSubmit(formData);
      if (result.success) {
        setSuccess(true);
        // Dispatch event to update header
        window.dispatchEvent(new Event('profile-updated'));
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrencySymbol = (code: string) => {
    const currency = CURRENCY_OPTIONS.find((c) => c.value === code);
    return currency?.symbol || '$';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header with View Public Profile */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Profile & Listing
          </h2>
          <p className="text-muted-foreground">
            Update how you appear to travelers.
          </p>
        </div>
        {guide.slug && (
          <Link href={`/guides/${guide.slug}`} target="_blank">
            <Button variant="bordered" type="button">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Public Profile
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Profile updated successfully!
        </div>
      )}

      {/* Cover Image (full width) */}
      <div className="space-y-2 mb-6">
        <Label className="text-sm font-medium">Cover Image</Label>
        <CoverUploader
          currentImageUrl={profile.cover_url}
          onUpload={async (file) => {
             // TODO: Implement actual upload logic here, possibly passing userId if needed by the upload function
             // For now, we'll just log it. You likely need an upload helper similar to uploadAvatar.
             console.log("Uploading cover:", file);
          }}
        />
      </div>

      {/* Profile Photo (single source of truth; circular) */}
      <div className="space-y-2 mb-6">
        <Label className="text-sm font-medium">Profile Photo</Label>
        <p className="text-sm text-muted-foreground mb-2">
          This is your main photo shown on your public profile and in the
          dashboard.
        </p>
        <PhotoUpload
          variant="avatar"
          size="lg"
          value={formData.avatar_url}
          onChange={handleAvatarChange}
          onUpload={handleAvatarUpload}
          placeholder={formData.display_name}
          helperText="JPG, PNG, WebP or GIF. Max 2MB."
        />
      </div>

      {/* Display Name, City, Bio */}
      <div className="grid gap-4 mb-8">
        <div className="grid gap-2">
          <Label htmlFor="display_name">Display Name</Label>
          <Input
            id="display_name"
            value={formData.display_name}
            onChange={(e) => handleChange('display_name', e.target.value)}
            placeholder="Your name"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label>Country</Label>
          <CountrySelect
            value={formData.country_code}
            onChange={(value) => {
              handleChange('country_code', value);
              // Reset city when country changes
              setFormData((prev) => ({ ...prev, country_code: value, city_name: '' }));
            }}
            placeholder="Select your country"
          />
        </div>

        <div className="grid gap-2">
          <Label>City</Label>
          <CitySelect
            countryCode={formData.country_code}
            value={formData.city_name}
            onChange={(value) => handleChange('city_name', value)}
            placeholder="Select your city"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Sexual Orientation</Label>
            <HeroSelect
              aria-label="Sexual Orientation"
              variant="bordered"
              placeholder="Select option"
              selectedKeys={formData.sexual_orientation ? new Set([formData.sexual_orientation]) : new Set()}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0] as string;
                handleChange('sexual_orientation', selected);
              }}
              classNames={{
                trigger: "h-10 min-h-10 bg-white border-input",
                value: "text-foreground",
              }}
            >
              {SEXUAL_ORIENTATION_OPTIONS.map((option) => (
                <HeroSelectItem key={option} textValue={option}>
                  {option}
                </HeroSelectItem>
              ))}
            </HeroSelect>
          </div>

          <div className="grid gap-2">
             <Label>Pronouns</Label>
             <HeroSelect
               aria-label="Pronouns"
               variant="bordered"
               placeholder="Select option"
               selectedKeys={formData.pronouns ? new Set([formData.pronouns]) : new Set()}
               onSelectionChange={(keys) => {
                 const selected = Array.from(keys)[0] as string;
                 handleChange('pronouns', selected);
               }}
               classNames={{
                 trigger: "h-10 min-h-10 bg-white border-input",
                 value: "text-foreground",
               }}
             >
               {PRONOUNS_OPTIONS.map((option) => (
                 <HeroSelectItem key={option} textValue={option}>
                   {option}
                 </HeroSelectItem>
               ))}
             </HeroSelect>
          </div>
        </div>

        <div className="grid gap-2">
           <Label htmlFor="tagline">Profile Tagline</Label>
           <Input
             id="tagline"
             value={formData.tagline || ''}
             onChange={(e) => handleChange('tagline', e.target.value)}
             placeholder="A catchy one-liner describing you (e.g., 'The History Buff of Berlin')"
             maxLength={60}
           />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell travelers about yourself, your background, and what makes you a great guide..."
            className="min-h-[150px]"
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground text-right">
            {(formData.bio || '').length}/1000 characters
          </p>
        </div>
      </div>

      <Tabs defaultValue="tour" className="w-full">
        <TabsList>
          <TabsTrigger value="tour">Tour Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        {/* Tab: Tour Details */}
        <TabsContent value="tour" className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tour_description">My Tour Style</Label>
              <Textarea
                id="tour_description"
                value={formData.tour_description || ''}
                onChange={(e) => handleChange('tour_description', e.target.value)}
                placeholder="Describe what your tours are like (e.g., 'I love showing hidden gems and local food spots...')"
                className="min-h-[120px]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <HeroSelect
              label="Specialties"
              placeholder="Select specialties"
              selectionMode="multiple"
              selectedKeys={new Set(formData.themes || [])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys) as string[];
                handleChange('themes', selected);
              }}
              variant="bordered"
              classNames={{
                trigger: "bg-white border-input min-h-12",
                value: "text-foreground",
              }}
            >
              {GUIDE_SPECIALTIES.map((specialty) => (
                <HeroSelectItem key={specialty} textValue={specialty}>
                  {specialty}
                </HeroSelectItem>
              ))}
            </HeroSelect>
          </div>

          <div className="space-y-4">
            <HeroSelect
              label="Languages"
              placeholder="Select languages"
              selectionMode="multiple"
              selectedKeys={new Set(formData.languages || [])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys) as string[];
                handleChange('languages', selected);
              }}
              variant="bordered"
              classNames={{
                trigger: "bg-white border-input min-h-12",
                value: "text-foreground",
              }}
            >
              {LANGUAGE_OPTIONS.map((language) => (
                <HeroSelectItem key={language} textValue={language}>
                  {language}
                </HeroSelectItem>
              ))}
            </HeroSelect>
          </div>
        </TabsContent>

        {/* Tab 3: Pricing */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Tour Rates</h3>
              <p className="text-sm text-muted-foreground">
                Set your pricing for different tour durations. All prices are in USD ($).
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg border space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">4 Hours</div>
                  <div className="text-sm text-muted-foreground">
                    Half-day tour
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.base_price_4h || ''}
                    onChange={(e) =>
                      handleChange('base_price_4h', e.target.value)
                    }
                    className="pl-8"
                    placeholder="0"
                  />
                </div>
                {formData.base_price_4h && (
                  <p className="text-xs text-center text-muted-foreground">
                    $
                    {Math.round(Number(formData.base_price_4h) / 4)}/hour
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg border space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">6 Hours</div>
                  <div className="text-sm text-muted-foreground">
                    Full-day tour
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.base_price_6h || ''}
                    onChange={(e) =>
                      handleChange('base_price_6h', e.target.value)
                    }
                    className="pl-8"
                    placeholder="0"
                  />
                </div>
                {formData.base_price_6h && (
                  <p className="text-xs text-center text-muted-foreground">
                    $
                    {Math.round(Number(formData.base_price_6h) / 6)}/hour
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg border space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">8 Hours</div>
                  <div className="text-sm text-muted-foreground">
                    Extended tour
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.base_price_8h || ''}
                    onChange={(e) =>
                      handleChange('base_price_8h', e.target.value)
                    }
                    className="pl-8"
                    placeholder="0"
                  />
                </div>
                {formData.base_price_8h && (
                  <p className="text-xs text-center text-muted-foreground">
                    $
                    {Math.round(Number(formData.base_price_8h) / 8)}/hour
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Submit */}
      <div className="flex justify-end pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
