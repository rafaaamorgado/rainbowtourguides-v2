'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { TRAVELER_INTERESTS } from '@/lib/constants/profile-options';
import type { Database } from '@/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Country = Database['public']['Tables']['countries']['Row'];

interface TravelerProfileFormProps {
  profile: Profile;
  countries: Country[];
  interests: string[];
  onSubmit: (
    data: TravelerProfileFormData,
  ) => Promise<{ success: boolean; error?: string }>;
}

export interface TravelerProfileFormData {
  full_name: string;
  avatar_url?: string | null;
  bio: string | null;
  pronouns: string | null;
  country_of_origin: string | null;
  languages: string[];
  interests: string[];
}

export function TravelerProfileForm({
  profile,
  countries,
  interests: initialInterests,
  onSubmit,
}: TravelerProfileFormProps) {
  const [formData, setFormData] = useState<TravelerProfileFormData>({
    full_name: profile.full_name || '',
    avatar_url: profile.avatar_url,
    bio: profile.bio || '',
    pronouns: profile.pronouns || '',
    country_of_origin: profile.country_of_origin || '',
    languages: profile.languages || [],
    interests: initialInterests || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    field: keyof TravelerProfileFormData,
    value: string | string[] | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleLanguageToggle = (language: string) => {
    setFormData((prev) => {
      const currentLanguages = prev.languages || [];
      const newLanguages = currentLanguages.includes(language)
        ? currentLanguages.filter((l) => l !== language)
        : [...currentLanguages, language];
      return { ...prev, languages: newLanguages };
    });
  };

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => {
      const currentInterests = prev.interests || [];
      const newInterests = currentInterests.includes(interest)
        ? currentInterests.filter((i) => i !== interest)
        : [...currentInterests, interest];
      return { ...prev, interests: newInterests };
    });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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

      {/* Personal Info Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Personal Information</h3>
          <p className="text-sm text-muted-foreground">
            Let guides know a bit about you.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ''}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Tell guides a bit about yourself and what you're looking for in your travels..."
              className="min-h-[120px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {(formData.bio || '').length}/500 characters
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pronouns">Pronouns</Label>
            <Input
              id="pronouns"
              value={formData.pronouns || ''}
              onChange={(e) => handleChange('pronouns', e.target.value)}
              placeholder="e.g., he/him, she/her, they/them"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="country_of_origin">Country of Origin</Label>
            <Select
              value={formData.country_of_origin || ''}
              onChange={(value) => handleChange('country_of_origin', value)}
              options={countries.map((country) => ({
                value: country.iso_code,
                label: country.name,
              }))}
              placeholder="Select your country"
            />
          </div>
        </div>
      </div>

      {/* Languages Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Languages</h3>
          <p className="text-sm text-muted-foreground">
            Select the languages you speak. This helps guides communicate with
            you better.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'English',
            'Spanish',
            'French',
            'German',
            'Italian',
            'Portuguese',
            'Russian',
            'Chinese',
            'Japanese',
            'Korean',
          ].map((language) => (
            <label
              key={language}
              className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                checked={(formData.languages || []).includes(language)}
                onCheckedChange={() => handleLanguageToggle(language)}
              />
              <span className="text-sm font-medium">{language}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Interests Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Interests</h3>
          <p className="text-sm text-muted-foreground">
            Select your travel interests. This helps guides tailor experiences
            to your preferences.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {TRAVELER_INTERESTS.map((interest) => {
            const isSelected = (formData.interests || []).includes(interest);
            return (
              <Badge
                key={interest}
                variant={isSelected ? 'default' : 'outline'}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'hover:bg-primary hover:text-primary-foreground'
                }`}
                onClick={() => handleInterestToggle(interest)}
              >
                {interest}
              </Badge>
            );
          })}
        </div>
      </div>

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
