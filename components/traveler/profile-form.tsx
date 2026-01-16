"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { uploadAvatar } from "@/lib/storage-helpers";
import { TRAVELER_INTERESTS } from "@/lib/constants/profile-options";
import { Loader2 } from "lucide-react";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Traveler = Database["public"]["Tables"]["travelers"]["Row"];
type Country = Database["public"]["Tables"]["countries"]["Row"];

interface TravelerProfileFormProps {
  profile: Profile;
  traveler: Traveler | null;
  countries: Country[];
  onSubmit: (data: TravelerProfileFormData) => Promise<{ success: boolean; error?: string }>;
}

export interface TravelerProfileFormData {
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  home_country: string | null;
  interests: string[];
}

export function TravelerProfileForm({
  profile,
  traveler,
  countries,
  onSubmit,
}: TravelerProfileFormProps) {
  const [formData, setFormData] = useState<TravelerProfileFormData>({
    full_name: profile.full_name || "",
    avatar_url: profile.avatar_url,
    bio: profile.bio || "",
    home_country: traveler?.home_country || "",
    interests: traveler?.interests || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      return uploadAvatar(profile.id, file);
    },
    [profile.id]
  );

  const handleAvatarChange = (url: string | null) => {
    setFormData((prev) => ({ ...prev, avatar_url: url }));
  };

  const handleChange = (field: keyof TravelerProfileFormData, value: string | string[] | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
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
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
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

      {/* Avatar Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Profile Photo</h3>
          <p className="text-sm text-muted-foreground">
            This photo will be visible to guides when you make a booking.
          </p>
        </div>
        <AvatarUpload
          value={formData.avatar_url}
          onChange={handleAvatarChange}
          onUpload={handleAvatarUpload}
          size="lg"
        />
      </div>

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
              onChange={(e) => handleChange("full_name", e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ""}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Tell guides a bit about yourself and what you're looking for in your travels..."
              className="min-h-[120px]"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {(formData.bio || "").length}/500 characters
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="home_country">Home Country</Label>
            <Select
              value={formData.home_country || ""}
              onValueChange={(value) => handleChange("home_country", value)}
            >
              <SelectTrigger id="home_country">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.iso_code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Interests Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Travel Interests</h3>
          <p className="text-sm text-muted-foreground">
            Select the types of experiences you enjoy. This helps guides personalize your tour.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TRAVELER_INTERESTS.map((interest) => (
            <label
              key={interest}
              className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                checked={(formData.interests || []).includes(interest)}
                onCheckedChange={() => handleInterestToggle(interest)}
              />
              <span className="text-sm font-medium">{interest}</span>
            </label>
          ))}
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
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
