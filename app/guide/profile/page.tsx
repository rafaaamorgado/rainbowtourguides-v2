"use client";

import { useEffect, useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { getCities, getGuide } from "@/lib/data-service";
import type { City, Guide } from "@/lib/mock-data";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toast, useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function GuideProfilePage() {
  const { toast, showToast, hideToast } = useToast();
  const [cities, setCities] = useState<City[]>([]);
  const [formData, setFormData] = useState<Partial<Guide>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Mock guide ID
  const guideId = "g1";

  useEffect(() => {
    // Load cities and guide data
    Promise.all([getCities(), getGuide(guideId)]).then(([citiesData, guideData]) => {
      setCities(citiesData);
      if (guideData) {
        setFormData(guideData);
      }
      setIsLoading(false);
    });
  }, []);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSection = async (section: string) => {
    setSavingSection(section);

    // Mock save to localStorage
    await new Promise((resolve) => setTimeout(resolve, 800));
    localStorage.setItem("guide_profile", JSON.stringify(formData));

    setSavingSection(null);
    showToast("Changes saved successfully!");
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2">Edit Profile</h1>
          <p className="text-ink-soft">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink mb-2">Edit Profile</h1>
        <p className="text-ink-soft">Update your guide profile information</p>
      </div>

      {/* Photo & Basic Info Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">
              Photo & Basic Info
            </h2>
            <p className="text-sm text-ink-soft mt-1">
              Your profile photo and essential details
            </p>
          </div>
          <Button
            onClick={() => handleSaveSection("basic")}
            disabled={savingSection === "basic"}
            className="flex items-center gap-2"
          >
            {savingSection === "basic" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Photo URL */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">
              Profile Photo URL
            </label>
            <Input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.photo_url || ""}
              onChange={(e) => handleChange("photo_url", e.target.value)}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Full Name</label>
            <Input
              type="text"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">City</label>
            <Select
              value={formData.city_id || ""}
              onChange={(e) => handleChange("city_id", e.target.value)}
            >
              <option value="">Select your city</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}, {city.country_name}
                </option>
              ))}
            </Select>
          </div>

          {/* Languages */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Languages</label>
            <div className="grid grid-cols-2 gap-2">
              {["English", "Spanish", "Portuguese", "French", "German", "Italian"].map(
                (language) => (
                  <label
                    key={language}
                    className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:border-brand/50 transition-colors text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={formData.languages?.includes(language) || false}
                      onChange={(e) => {
                        const current = formData.languages || [];
                        const updated = e.target.checked
                          ? [...current, language]
                          : current.filter((l) => l !== language);
                        handleChange("languages", updated);
                      }}
                      className="w-4 h-4 text-brand focus:ring-brand rounded"
                    />
                    <span className="text-ink">{language}</span>
                  </label>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bio & Tagline Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">Bio & Tagline</h2>
            <p className="text-sm text-ink-soft mt-1">
              Your story and one-line pitch
            </p>
          </div>
          <Button
            onClick={() => handleSaveSection("bio")}
            disabled={savingSection === "bio"}
            className="flex items-center gap-2"
          >
            {savingSection === "bio" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Tagline */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Tagline</label>
            <Input
              type="text"
              placeholder="One-line summary of what you offer"
              value={formData.tagline || ""}
              onChange={(e) => {
                if (e.target.value.length <= 60) {
                  handleChange("tagline", e.target.value);
                }
              }}
            />
            <p className="text-xs text-ink-soft">
              {formData.tagline?.length || 0}/60 characters
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">Bio</label>
            <Textarea
              placeholder="Tell travelers about yourself and your guiding experience..."
              value={formData.bio || ""}
              onChange={(e) => {
                if (e.target.value.length <= 500) {
                  handleChange("bio", e.target.value);
                }
              }}
              rows={6}
            />
            <p className="text-xs text-ink-soft">
              {formData.bio?.length || 0}/500 characters
            </p>
          </div>
        </div>
      </section>

      {/* Experience Tags Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">
              Experience Tags
            </h2>
            <p className="text-sm text-ink-soft mt-1">
              What kind of experiences do you offer?
            </p>
          </div>
          <Button
            onClick={() => handleSaveSection("experience")}
            disabled={savingSection === "experience"}
            className="flex items-center gap-2"
          >
            {savingSection === "experience" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            "Nightlife",
            "Daytime Culture",
            "Food & Drink",
            "Queer History",
            "Hidden Gems",
            "Architecture",
            "Nature",
            "Art Scene",
          ].map((tag) => (
            <label
              key={tag}
              className={cn(
                "px-4 py-2 border-2 rounded-full cursor-pointer transition-all text-sm font-medium",
                formData.experience_tags?.includes(tag)
                  ? "border-brand bg-brand/5 text-brand"
                  : "border-slate-200 text-ink-soft hover:border-slate-300"
              )}
            >
              <input
                type="checkbox"
                checked={formData.experience_tags?.includes(tag) || false}
                onChange={(e) => {
                  const current = formData.experience_tags || [];
                  const updated = e.target.checked
                    ? [...current, tag]
                    : current.filter((t) => t !== tag);
                  handleChange("experience_tags", updated);
                }}
                className="sr-only"
              />
              {tag}
            </label>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">Pricing</h2>
            <p className="text-sm text-ink-soft mt-1">
              Your rates for different tour durations
            </p>
          </div>
          <Button
            onClick={() => handleSaveSection("pricing")}
            disabled={savingSection === "pricing"}
            className="flex items-center gap-2"
          >
            {savingSection === "pricing" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            Rainbow Tour Guides takes a 20% commission. You receive 80% of the
            listed price.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* 4 Hours */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">4 Hours</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft">
                $
              </span>
              <Input
                type="number"
                min="50"
                value={formData.price_4h || ""}
                onChange={(e) =>
                  handleChange("price_4h", parseFloat(e.target.value))
                }
                className="pl-7"
              />
            </div>
            {formData.price_4h && (
              <p className="text-xs text-ink-soft">
                You receive: ${Math.round(formData.price_4h * 0.8)}
              </p>
            )}
          </div>

          {/* 6 Hours */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">6 Hours</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft">
                $
              </span>
              <Input
                type="number"
                min="75"
                value={formData.price_6h || ""}
                onChange={(e) =>
                  handleChange("price_6h", parseFloat(e.target.value))
                }
                className="pl-7"
              />
            </div>
            {formData.price_6h && (
              <p className="text-xs text-ink-soft">
                You receive: ${Math.round(formData.price_6h * 0.8)}
              </p>
            )}
          </div>

          {/* 8 Hours */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">8 Hours</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft">
                $
              </span>
              <Input
                type="number"
                min="100"
                value={formData.price_8h || ""}
                onChange={(e) =>
                  handleChange("price_8h", parseFloat(e.target.value))
                }
                className="pl-7"
              />
            </div>
            {formData.price_8h && (
              <p className="text-xs text-ink-soft">
                You receive: ${Math.round(formData.price_8h * 0.8)}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Availability Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-semibold text-ink">Availability</h2>
            <p className="text-sm text-ink-soft mt-1">
              Your general weekly availability
            </p>
          </div>
          <Button
            onClick={() => handleSaveSection("availability")}
            disabled={savingSection === "availability"}
            className="flex items-center gap-2"
          >
            {savingSection === "availability" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4">
          {/* Note: Simplified availability for profile editor */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm text-ink-soft">
              <strong className="text-ink">Note:</strong> This is a simplified
              view. For detailed calendar management, visit the{" "}
              <a
                href="/guide/availability"
                className="text-brand hover:underline"
              >
                Availability Calendar
              </a>
              .
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">
              General Availability Notes
            </label>
            <Textarea
              placeholder="Describe your typical availability, blackout periods, or scheduling preferences..."
              value={formData.slug || ""} // Mock field - would be availability_notes
              onChange={(e) => handleChange("slug", e.target.value)}
              rows={4}
            />
          </div>
        </div>
      </section>

      {/* Profile Status */}
      <section className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-ink mb-1">
              Profile Status
            </h3>
            <p className="text-sm text-ink-soft">
              Your current guide profile status
            </p>
          </div>
          <Badge
            className={cn(
              "text-sm px-4 py-1.5",
              formData.verified
                ? "bg-emerald-100 text-emerald-700 border-0"
                : "bg-amber-100 text-amber-700 border-0"
            )}
          >
            {formData.verified ? "Approved" : "Under Review"}
          </Badge>
        </div>

        {!formData.verified && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200">
            <p className="text-sm text-ink-soft">
              Your profile is currently under review. You'll be notified once
              it's approved and you can start accepting bookings.
            </p>
          </div>
        )}
      </section>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}

