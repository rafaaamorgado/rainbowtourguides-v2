"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { uploadAvatar } from "@/lib/storage-helpers";
import {
  GUIDE_SPECIALTIES,
  LANGUAGE_OPTIONS,
  CURRENCY_OPTIONS,
} from "@/lib/constants/profile-options";
import { Loader2, ExternalLink } from "lucide-react";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Guide = Database["public"]["Tables"]["guides"]["Row"];
type City = Database["public"]["Tables"]["cities"]["Row"];

interface GuideProfileFormProps {
  profile: Profile;
  guide: Guide;
  cities: City[];
  onSubmit: (data: GuideProfileFormData) => Promise<{ success: boolean; error?: string }>;
}

export interface GuideProfileFormData {
  // Basic Info (from profiles + guides)
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  city_id: string;
  // Tour Details
  tagline: string | null;
  about: string | null;
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
  cities,
  onSubmit,
}: GuideProfileFormProps) {
  const [formData, setFormData] = useState<GuideProfileFormData>({
    display_name: profile.full_name || "",
    avatar_url: profile.avatar_url,
    bio: guide.bio || "",
    city_id: guide.city_id || "",
    tagline: guide.tagline || "",
    about: guide.about || "",
    themes: guide.experience_tags || [],
    languages: guide.languages || [],
    base_price_4h: guide.price_4h || "",
    base_price_6h: guide.price_6h || "",
    base_price_8h: guide.price_8h || "",
    currency: guide.currency || "EUR",
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

  const handleChange = (
    field: keyof GuideProfileFormData,
    value: string | string[] | null
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleArrayToggle = (field: "themes" | "languages", item: string) => {
    setFormData((prev) => {
      const currentItems = prev[field] || [];
      const newItems = currentItems.includes(item)
        ? currentItems.filter((i) => i !== item)
        : [...currentItems, item];
      return { ...prev, [field]: newItems };
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
        // Dispatch event to update header
        window.dispatchEvent(new Event('profile-updated'));
      } else {
        setError(result.error || "Failed to update profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrencySymbol = (code: string) => {
    const currency = CURRENCY_OPTIONS.find((c) => c.value === code);
    return currency?.symbol || "$";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header with View Public Profile */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile & Listing</h2>
          <p className="text-muted-foreground">
            Update how you appear to travelers.
          </p>
        </div>
        {guide.slug && (
          <Link href={`/guides/${guide.slug}`} target="_blank">
            <Button variant="outline" type="button">
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

      <Tabs defaultValue="basic" className="w-full">
        <TabsList>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="tour">Tour Details</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
        </TabsList>

        {/* Tab 1: Basic Info */}
        <TabsContent value="basic" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Profile Photo</h3>
              <p className="text-sm text-muted-foreground">
                This is your main photo that travelers will see.
              </p>
            </div>
            <AvatarUpload
              value={formData.avatar_url}
              onChange={handleAvatarChange}
              onUpload={handleAvatarUpload}
              size="lg"
            />
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleChange("display_name", e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="city_id">City</Label>
              <Select
                value={formData.city_id}
                onValueChange={(value) => handleChange("city_id", value)}
              >
                <SelectTrigger id="city_id">
                  <SelectValue placeholder="Select your city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Tell travelers about yourself, your background, and what makes you a great guide..."
                className="min-h-[150px]"
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {(formData.bio || "").length}/1000 characters
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Tour Details */}
        <TabsContent value="tour" className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline || ""}
                onChange={(e) => handleChange("tagline", e.target.value)}
                placeholder="A catchy one-liner about your tours"
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                This appears below your name on search results.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="about">About the Tour</Label>
              <Textarea
                id="about"
                value={formData.about || ""}
                onChange={(e) => handleChange("about", e.target.value)}
                placeholder="Describe what travelers will experience on your tour. What will you show them? What makes your tour special?"
                className="min-h-[150px]"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground text-right">
                {(formData.about || "").length}/2000 characters
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Specialties</h3>
              <p className="text-sm text-muted-foreground">
                Select the types of experiences you offer.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GUIDE_SPECIALTIES.map((specialty) => (
                <label
                  key={specialty}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={(formData.themes || []).includes(specialty)}
                    onCheckedChange={() => handleArrayToggle("themes", specialty)}
                  />
                  <span className="text-sm font-medium">{specialty}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Languages</h3>
              <p className="text-sm text-muted-foreground">
                Select all languages you can guide in.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LANGUAGE_OPTIONS.map((language) => (
                <label
                  key={language}
                  className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                >
                  <Checkbox
                    checked={(formData.languages || []).includes(language)}
                    onCheckedChange={() => handleArrayToggle("languages", language)}
                  />
                  <span className="text-sm font-medium">{language}</span>
                </label>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Pricing */}
        <TabsContent value="pricing" className="space-y-6">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleChange("currency", value)}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Tour Rates</h3>
              <p className="text-sm text-muted-foreground">
                Set your pricing for different tour durations.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="p-4 rounded-lg border space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">4 Hours</div>
                  <div className="text-sm text-muted-foreground">Half-day tour</div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {getCurrencySymbol(formData.currency)}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.base_price_4h || ""}
                    onChange={(e) => handleChange("base_price_4h", e.target.value)}
                    className="pl-8"
                    placeholder="0"
                  />
                </div>
                {formData.base_price_4h && (
                  <p className="text-xs text-center text-muted-foreground">
                    {getCurrencySymbol(formData.currency)}
                    {Math.round(Number(formData.base_price_4h) / 4)}/hour
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg border space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">6 Hours</div>
                  <div className="text-sm text-muted-foreground">Full-day tour</div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {getCurrencySymbol(formData.currency)}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.base_price_6h || ""}
                    onChange={(e) => handleChange("base_price_6h", e.target.value)}
                    className="pl-8"
                    placeholder="0"
                  />
                </div>
                {formData.base_price_6h && (
                  <p className="text-xs text-center text-muted-foreground">
                    {getCurrencySymbol(formData.currency)}
                    {Math.round(Number(formData.base_price_6h) / 6)}/hour
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg border space-y-3">
                <div className="text-center">
                  <div className="text-2xl font-bold">8 Hours</div>
                  <div className="text-sm text-muted-foreground">Extended tour</div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {getCurrencySymbol(formData.currency)}
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.base_price_8h || ""}
                    onChange={(e) => handleChange("base_price_8h", e.target.value)}
                    className="pl-8"
                    placeholder="0"
                  />
                </div>
                {formData.base_price_8h && (
                  <p className="text-xs text-center text-muted-foreground">
                    {getCurrencySymbol(formData.currency)}
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
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
