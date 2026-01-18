"use client";

import { useState } from "react";
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
import { Loader2, Star, X } from "lucide-react";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Country = Database["public"]["Tables"]["countries"]["Row"];

interface TravelerProfileFormProps {
  profile: Profile;
  countries: Country[];
  onSubmit: (data: TravelerProfileFormData) => Promise<{ success: boolean; error?: string }>;
}

export interface TravelerProfileFormData {
  full_name: string;
  avatar_url?: string | null;
  bio: string | null;
  pronouns: string | null;
  country_of_origin: string | null;
  languages: string[];
  photo_urls?: string[];
}

export function TravelerProfileForm({
  profile,
  countries,
  onSubmit,
}: TravelerProfileFormProps) {
  const [formData, setFormData] = useState<TravelerProfileFormData>({
    full_name: profile.full_name || "",
    avatar_url: profile.avatar_url,
    bio: profile.bio || "",
    pronouns: profile.pronouns || "",
    country_of_origin: profile.country_of_origin || "",
    languages: profile.languages || [],
    photo_urls: [], // Empty for now, will be populated from DB later
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof TravelerProfileFormData, value: string | string[] | null) => {
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

  // Photo management handlers (not connected yet)
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
    console.log("🟢 [ProfileForm] Submitting form with data:", formData);
    
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      console.log("🟢 [ProfileForm] Calling onSubmit...");
      const result = await onSubmit(formData);
      console.log("🟢 [ProfileForm] onSubmit result:", result);
      
      if (result.success) {
        setSuccess(true);
        console.log("✅ [ProfileForm] Profile updated successfully!");
        
        // Dispatch custom event to update UserMenu
        window.dispatchEvent(new Event('profile-updated'));
        console.log("🔄 [ProfileForm] Dispatched profile-updated event");
      } else {
        setError(result.error || "Failed to update profile");
        console.error("❌ [ProfileForm] Update failed:", result.error);
      }
    } catch (err) {
      console.error("❌ [ProfileForm] Exception:", err);
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
        <div className="flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-pride-lilac to-pride-mint flex-shrink-0">
            {formData.avatar_url ? (
              <Image
                src={formData.avatar_url}
                alt={formData.full_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-semibold text-3xl">
                {formData.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Photo upload coming soon
            </p>
          </div>
        </div>
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
            <div className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-slate-50">
              <p className="text-xs text-slate-400 text-center px-4">
                Photo upload<br />coming soon
              </p>
            </div>
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
            <Label htmlFor="pronouns">Pronouns</Label>
            <Input
              id="pronouns"
              value={formData.pronouns || ""}
              onChange={(e) => handleChange("pronouns", e.target.value)}
              placeholder="e.g., he/him, she/her, they/them"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="country_of_origin">Country of Origin</Label>
            <Select
              value={formData.country_of_origin || ""}
              onValueChange={(value) => handleChange("country_of_origin", value)}
            >
              <SelectTrigger id="country_of_origin">
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

      {/* Languages Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Languages</h3>
          <p className="text-sm text-muted-foreground">
            Select the languages you speak. This helps guides communicate with you better.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {["English", "Spanish", "French", "German", "Italian", "Portuguese", "Russian", "Chinese", "Japanese", "Korean"].map((language) => (
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
