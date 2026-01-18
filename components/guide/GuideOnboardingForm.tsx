"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Database } from "@/types/database";

type City = Database["public"]["Tables"]["cities"]["Row"];
type Guide = Database["public"]["Tables"]["guides"]["Row"];

// Available theme options
const THEME_OPTIONS = [
  "nightlife",
  "culture",
  "food",
  "history",
  "art",
  "lgbtq-scene",
  "nature",
  "shopping",
  "adventure",
  "wellness",
] as const;

type GuideOnboardingFormProps = {
  cities: City[];
  existingGuide: Guide | null;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
};

export function GuideOnboardingForm({
  cities,
  existingGuide,
  onSubmit,
}: GuideOnboardingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state with defaults from existing guide
  const [cityId, setCityId] = useState(existingGuide?.city_id ?? "");
  const [headline, setHeadline] = useState(existingGuide?.headline ?? "");
  const [about, setAbout] = useState(existingGuide?.bio ?? "");
  const [languages, setLanguages] = useState("");
  const [selectedThemes, setSelectedThemes] = useState<string[]>(existingGuide?.experience_tags ?? []);
  const [hourlyRate, setHourlyRate] = useState(existingGuide?.price_4h?.toString() ?? "");

  const handleThemeToggle = (theme: string) => {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.set("city_id", cityId);
    formData.set("headline", headline);
    formData.set("about", about);
    formData.set("languages", languages);
    formData.set("themes", JSON.stringify(selectedThemes));
    formData.set("hourly_rate", hourlyRate);

    const result = await onSubmit(formData);

    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error ?? "Something went wrong. Please try again.");
    }
  };

  if (success) {
    return (
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-green-600">Profile Submitted!</CardTitle>
          <CardDescription>
            Your guide profile has been submitted for review. We&apos;ll notify you once it&apos;s approved.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/guide/dashboard")}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>
          {existingGuide ? "Edit Your Guide Profile" : "Complete Your Guide Profile"}
        </CardTitle>
        <CardDescription>
          Fill out the details below to {existingGuide ? "update" : "create"} your guide profile.
          {existingGuide && existingGuide.status !== "pending" && (
            <span className="block mt-1 text-amber-600">
              Note: Editing will set your status back to &quot;pending&quot; for re-review.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* City Selection */}
          <div className="space-y-2">
            <label htmlFor="city" className="text-sm font-medium">
              City <span className="text-destructive">*</span>
            </label>
            <select
              id="city"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select a city...</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <label htmlFor="headline" className="text-sm font-medium">
              Headline
            </label>
            <Input
              id="headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g., Your friendly local guide to the best hidden gems"
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground">
              A short tagline that appears on your profile card
            </p>
          </div>

          {/* About */}
          <div className="space-y-2">
            <label htmlFor="about" className="text-sm font-medium">
              About You
            </label>
            <Textarea
              id="about"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Tell travelers about yourself, your experience, and what makes your tours special..."
              rows={5}
            />
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <label htmlFor="languages" className="text-sm font-medium">
              Languages
            </label>
            <Input
              id="languages"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="e.g., English, Spanish, Portuguese"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of languages you speak
            </p>
          </div>

          {/* Themes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tour Themes</label>
            <div className="flex flex-wrap gap-2">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => handleThemeToggle(theme)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    selectedThemes.includes(theme)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input hover:bg-accent"
                  }`}
                >
                  {theme.replace("-", " ")}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Select the themes that best describe your tours
            </p>
          </div>

          {/* Hourly Rate */}
          <div className="space-y-2">
            <label htmlFor="hourly_rate" className="text-sm font-medium">
              Hourly Rate (USD)
            </label>
            <Input
              id="hourly_rate"
              type="number"
              min="0"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="e.g., 50.00"
            />
            <p className="text-xs text-muted-foreground">
              Your base hourly rate for private tours
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : existingGuide
              ? "Update Profile"
              : "Submit for Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

