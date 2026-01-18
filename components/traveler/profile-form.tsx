"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
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
import { uploadAvatar, uploadTravelerPhoto } from "@/lib/storage-helpers";
import { TRAVELER_INTERESTS } from "@/lib/constants/profile-options";
import { Loader2, Plus, X, Star } from "lucide-react";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Country = Database["public"]["Tables"]["countries"]["Row"];

// Traveler table type not in generated schema, use inline type
type Traveler = {
  home_country?: string | null;
  interests?: string[] | null;
  photo_urls?: string[] | null;
};

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
  photo_urls: string[];
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
    photo_urls: traveler?.photo_urls || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const currentPhotos = formData.photo_urls || [];
    if (currentPhotos.length >= 4) {
      setError("You can upload a maximum of 4 photos");
      return;
    }

    setUploadingPhoto(true);
    setError(null);

    try {
      const result = await uploadTravelerPhoto(profile.id, file, currentPhotos.length);
      if (result.success && result.url) {
        setFormData((prev) => ({
          ...prev,
          photo_urls: [...(prev.photo_urls || []), result.url!],
        }));
      } else {
        setError(result.error || "Failed to upload photo");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photo_urls: (prev.photo_urls || []).filter((_, i) => i !== index),
    }));
  };

  const handleSetPrimaryPhoto = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      avatar_url: url,
    }));
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
            This is your main profile photo visible to guides.
          </p>
        </div>
        <AvatarUpload
          value={formData.avatar_url}
          onChange={handleAvatarChange}
          onUpload={handleAvatarUpload}
          size="lg"
        />
      </div>

      {/* Additional Photos Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Additional Photos</h3>
          <p className="text-sm text-muted-foreground">
            Upload up to 4 photos. Click the star to set as your main profile photo.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(formData.photo_urls || []).map((url, index) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-slate-200 group"
            >
              <Image
                src={url}
                alt={`Photo ${index + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSetPrimaryPhoto(url)}
                  className={`p-2 rounded-full transition-colors ${
                    formData.avatar_url === url
                      ? "bg-yellow-500 text-white"
                      : "bg-white/90 text-slate-700 hover:bg-yellow-500 hover:text-white"
                  }`}
                  title="Set as main profile photo"
                >
                  <Star className="h-4 w-4" fill={formData.avatar_url === url ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="p-2 rounded-full bg-white/90 text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                  title="Remove photo"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {formData.avatar_url === url && (
                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                  Main
                </div>
              )}
            </div>
          ))}

          {(formData.photo_urls || []).length < 4 && (
            <label
              className={`aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-brand hover:bg-brand/5 transition-colors ${
                uploadingPhoto ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="sr-only"
              />
              {uploadingPhoto ? (
                <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
              ) : (
                <>
                  <Plus className="h-8 w-8 text-slate-400" />
                  <span className="text-xs text-slate-500 mt-2">Add Photo</span>
                </>
              )}
            </label>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {(formData.photo_urls || []).length}/4 photos uploaded
        </p>
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
