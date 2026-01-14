"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { cn } from "@/lib/utils";
import type { City } from "@/lib/mock-data";

// ============================================================================
// Step 1 - Basic Info
// ============================================================================

export function Step1BasicInfo({
  data,
  cities,
  onChange,
  onPhotoUpload,
  errors,
}: {
  data: any;
  cities: City[];
  onChange: (field: string, value: any) => void;
  onPhotoUpload?: (file: File) => Promise<{ success: boolean; url?: string; error?: string }>;
  errors: any;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink mb-2">Basic Information</h2>
        <p className="text-ink-soft">
          Let's start with the essentials about you and your guiding experience.
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile Photo */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            Profile Photo
          </label>
          {onPhotoUpload ? (
            <AvatarUpload
              value={data.photo_url}
              onChange={(url) => onChange("photo_url", url || "")}
              onUpload={onPhotoUpload}
              size="lg"
            />
          ) : (
            <Input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={data.photo_url || ""}
              onChange={(e) => onChange("photo_url", e.target.value)}
            />
          )}
          {errors.photo_url && (
            <p className="text-sm text-red-600">{errors.photo_url}</p>
          )}
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Your full name"
            value={data.name || ""}
            onChange={(e) => onChange("name", e.target.value)}
            required
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* City */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            City <span className="text-red-500">*</span>
          </label>
          <Select
            value={data.city_id || ""}
            onChange={(e) => onChange("city_id", e.target.value)}
            required
          >
            <option value="">Select your city</option>
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}, {city.country_name}
              </option>
            ))}
          </Select>
          {errors.city_id && (
            <p className="text-sm text-red-600">{errors.city_id}</p>
          )}
        </div>

        {/* Languages */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            Languages <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {["English", "Spanish", "Portuguese", "French", "German", "Italian"].map(
              (language) => (
                <label
                  key={language}
                  className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-brand/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={data.languages?.includes(language) || false}
                    onChange={(e) => {
                      const current = data.languages || [];
                      const updated = e.target.checked
                        ? [...current, language]
                        : current.filter((l: string) => l !== language);
                      onChange("languages", updated);
                    }}
                    className="w-4 h-4 text-brand focus:ring-brand rounded"
                  />
                  <span className="text-sm text-ink">{language}</span>
                </label>
              )
            )}
          </div>
          {errors.languages && (
            <p className="text-sm text-red-600">{errors.languages}</p>
          )}
        </div>

        {/* Short Bio */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            Short Bio <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Tell travelers about yourself, your background, and what makes your tours special..."
            value={data.bio || ""}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                onChange("bio", e.target.value);
              }
            }}
            rows={4}
            required
          />
          <p className="text-xs text-ink-soft">
            {data.bio?.length || 0}/500 characters (minimum 200)
          </p>
          {errors.bio && <p className="text-sm text-red-600">{errors.bio}</p>}
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            Tagline <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="One-line summary of what you offer"
            value={data.tagline || ""}
            onChange={(e) => {
              if (e.target.value.length <= 60) {
                onChange("tagline", e.target.value);
              }
            }}
            required
          />
          <p className="text-xs text-ink-soft">
            {data.tagline?.length || 0}/60 characters
          </p>
          {errors.tagline && (
            <p className="text-sm text-red-600">{errors.tagline}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step 2 - LGBTQ+ Alignment
// ============================================================================

export function Step2LGBTQAlignment({
  data,
  onChange,
  errors,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: any;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink mb-2">LGBTQ+ Alignment</h2>
        <p className="text-ink-soft">
          Help travelers understand your connection to the LGBTQ+ community.
        </p>
      </div>

      <div className="space-y-4">
        {/* Identity Checkboxes */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-brand/50 transition-colors">
            <input
              type="checkbox"
              checked={data.identifies_lgbtq || false}
              onChange={(e) => onChange("identifies_lgbtq", e.target.checked)}
              className="w-5 h-5 text-brand focus:ring-brand rounded"
            />
            <span className="text-ink">I identify as LGBTQ+</span>
          </label>

          <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-brand/50 transition-colors">
            <input
              type="checkbox"
              checked={data.is_ally || false}
              onChange={(e) => onChange("is_ally", e.target.checked)}
              className="w-5 h-5 text-brand focus:ring-brand rounded"
            />
            <span className="text-ink">I'm an LGBTQ+ ally</span>
          </label>
        </div>

        {/* Why I Guide */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            Why I enjoy guiding LGBTQ+ travelers{" "}
            <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Share your motivation for creating safe, authentic experiences for LGBTQ+ travelers..."
            value={data.why_guide_lgbtq || ""}
            onChange={(e) => {
              if (e.target.value.length <= 300) {
                onChange("why_guide_lgbtq", e.target.value);
              }
            }}
            rows={4}
            required
          />
          <p className="text-xs text-ink-soft">
            {data.why_guide_lgbtq?.length || 0}/300 characters (minimum 100)
          </p>
          {errors.why_guide_lgbtq && (
            <p className="text-sm text-red-600">{errors.why_guide_lgbtq}</p>
          )}
        </div>

        {/* Safety Commitment */}
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={data.safety_commitment || false}
              onChange={(e) => onChange("safety_commitment", e.target.checked)}
              className="w-5 h-5 text-brand focus:ring-brand rounded mt-0.5"
              required
            />
            <div>
              <span className="text-ink font-medium">
                Safety Commitment <span className="text-red-500">*</span>
              </span>
              <p className="text-sm text-ink-soft mt-1">
                I commit to providing safe, respectful experiences and
                following Rainbow Tour Guides' code of conduct.
              </p>
            </div>
          </label>
          {errors.safety_commitment && (
            <p className="text-sm text-red-600">{errors.safety_commitment}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step 3 - Experience & Tags
// ============================================================================

export function Step3ExperienceTags({
  data,
  onChange,
  errors,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: any;
}) {
  const experienceTags = [
    "Nightlife",
    "Daytime Culture",
    "Food & Drink",
    "Queer History",
    "Hidden Gems",
    "Architecture",
    "Nature",
    "Art Scene",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink mb-2">
          Experience & Specialties
        </h2>
        <p className="text-ink-soft">
          What kind of experiences do you offer?
        </p>
      </div>

      <div className="space-y-4">
        {/* Experience Tags */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            Experience Tags <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-ink-soft mb-3">
            Select at least 3 tags that describe your tours
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {experienceTags.map((tag) => (
              <label
                key={tag}
                className={cn(
                  "flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all",
                  data.experience_tags?.includes(tag)
                    ? "border-brand bg-brand/5"
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <input
                  type="checkbox"
                  checked={data.experience_tags?.includes(tag) || false}
                  onChange={(e) => {
                    const current = data.experience_tags || [];
                    const updated = e.target.checked
                      ? [...current, tag]
                      : current.filter((t: string) => t !== tag);
                    onChange("experience_tags", updated);
                  }}
                  className="w-4 h-4 text-brand focus:ring-brand rounded"
                />
                <span className="text-sm text-ink font-medium">{tag}</span>
              </label>
            ))}
          </div>
          {errors.experience_tags && (
            <p className="text-sm text-red-600">{errors.experience_tags}</p>
          )}
        </div>

        {/* Tour Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            What we'll do together <span className="text-red-500">*</span>
          </label>
          <Textarea
            placeholder="Describe a typical tour with you. What will travelers see, experience, and learn?"
            value={data.tour_description || ""}
            onChange={(e) => {
              if (e.target.value.length <= 400) {
                onChange("tour_description", e.target.value);
              }
            }}
            rows={5}
            required
          />
          <p className="text-xs text-ink-soft">
            {data.tour_description?.length || 0}/400 characters (minimum 150)
          </p>
          {errors.tour_description && (
            <p className="text-sm text-red-600">{errors.tour_description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step 4 - Pricing
// ============================================================================

export function Step4Pricing({
  data,
  onChange,
  errors,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: any;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink mb-2">Pricing</h2>
        <p className="text-ink-soft">
          Set your rates for different tour durations.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> Rainbow Tour Guides takes a 20% commission on
          all bookings. You'll receive 80% of the listed price.
        </p>
      </div>

      <div className="space-y-4">
        {/* 4 Hours */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            4 Hours <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft">
              $
            </span>
            <Input
              type="number"
              min="50"
              max="500"
              step="5"
              placeholder="120"
              value={data.price_4h || ""}
              onChange={(e) => onChange("price_4h", parseFloat(e.target.value))}
              className="pl-7"
              required
            />
          </div>
          {data.price_4h && (
            <p className="text-xs text-ink-soft">
              You'll receive: ${Math.round(data.price_4h * 0.8)}
            </p>
          )}
          {errors.price_4h && (
            <p className="text-sm text-red-600">{errors.price_4h}</p>
          )}
        </div>

        {/* 6 Hours */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            6 Hours <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft">
              $
            </span>
            <Input
              type="number"
              min="75"
              max="750"
              step="5"
              placeholder="170"
              value={data.price_6h || ""}
              onChange={(e) => onChange("price_6h", parseFloat(e.target.value))}
              className="pl-7"
              required
            />
          </div>
          {data.price_6h && (
            <p className="text-xs text-ink-soft">
              You'll receive: ${Math.round(data.price_6h * 0.8)}
            </p>
          )}
          {errors.price_6h && (
            <p className="text-sm text-red-600">{errors.price_6h}</p>
          )}
        </div>

        {/* 8 Hours */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            8 Hours <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft">
              $
            </span>
            <Input
              type="number"
              min="100"
              max="1000"
              step="5"
              placeholder="220"
              value={data.price_8h || ""}
              onChange={(e) => onChange("price_8h", parseFloat(e.target.value))}
              className="pl-7"
              required
            />
          </div>
          {data.price_8h && (
            <p className="text-xs text-ink-soft">
              You'll receive: ${Math.round(data.price_8h * 0.8)}
            </p>
          )}
          {errors.price_8h && (
            <p className="text-sm text-red-600">{errors.price_8h}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step 5 - Availability
// ============================================================================

export function Step5Availability({
  data,
  onChange,
  errors,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: any;
}) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const timeRanges = ["Morning", "Afternoon", "Evening"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink mb-2">Availability</h2>
        <p className="text-ink-soft">
          Set your general weekly availability pattern.
        </p>
      </div>

      <div className="space-y-4">
        {/* Days */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            Available Days <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <label
                key={day}
                className={cn(
                  "px-4 py-2 border-2 rounded-lg cursor-pointer transition-all",
                  data.available_days?.includes(day)
                    ? "border-brand bg-brand/5 text-brand font-semibold"
                    : "border-slate-200 text-ink-soft hover:border-slate-300"
                )}
              >
                <input
                  type="checkbox"
                  checked={data.available_days?.includes(day) || false}
                  onChange={(e) => {
                    const current = data.available_days || [];
                    const updated = e.target.checked
                      ? [...current, day]
                      : current.filter((d: string) => d !== day);
                    onChange("available_days", updated);
                  }}
                  className="sr-only"
                />
                {day}
              </label>
            ))}
          </div>
          {errors.available_days && (
            <p className="text-sm text-red-600">{errors.available_days}</p>
          )}
        </div>

        {/* Time Ranges */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            Preferred Time Ranges <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {timeRanges.map((time) => (
              <label
                key={time}
                className={cn(
                  "flex items-center justify-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all",
                  data.time_ranges?.includes(time)
                    ? "border-brand bg-brand/5 text-brand font-semibold"
                    : "border-slate-200 text-ink-soft hover:border-slate-300"
                )}
              >
                <input
                  type="checkbox"
                  checked={data.time_ranges?.includes(time) || false}
                  onChange={(e) => {
                    const current = data.time_ranges || [];
                    const updated = e.target.checked
                      ? [...current, time]
                      : current.filter((t: string) => t !== time);
                    onChange("time_ranges", updated);
                  }}
                  className="sr-only"
                />
                {time}
              </label>
            ))}
          </div>
          {errors.time_ranges && (
            <p className="text-sm text-red-600">{errors.time_ranges}</p>
          )}
        </div>

        {/* Additional Notes */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            Additional Availability Notes
          </label>
          <Textarea
            placeholder="Any specific availability details, blackout dates, or scheduling preferences..."
            value={data.availability_notes || ""}
            onChange={(e) => onChange("availability_notes", e.target.value)}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step 6 - ID Verification
// ============================================================================

export function Step6IDUpload({
  data,
  onChange,
  errors,
}: {
  data: any;
  onChange: (field: string, value: any) => void;
  errors: any;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink mb-2">ID Verification</h2>
        <p className="text-ink-soft">
          For safety and trust, we verify all guides.
        </p>
      </div>

      <div className="space-y-4">
        {/* Privacy Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
          <p className="text-sm text-blue-900 font-medium">
            Your privacy is protected
          </p>
          <p className="text-sm text-blue-800">
            Your ID is stored securely, encrypted, and only reviewed by our
            admin team. It's never shown to travelers.
          </p>
        </div>

        {/* File Input (Mock) */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink">
            Government-Issued ID <span className="text-red-500">*</span>
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-brand/50 transition-colors">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onChange("id_document", file.name);
                }
              }}
              className="hidden"
              id="id-upload"
            />
            <label htmlFor="id-upload" className="cursor-pointer space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                <svg
                  className="h-8 w-8 text-ink-soft"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <div>
                <p className="text-ink font-medium">
                  {data.id_document || "Click to upload ID"}
                </p>
                <p className="text-sm text-ink-soft mt-1">
                  Passport, driver's license, or national ID
                </p>
                <p className="text-xs text-ink-soft mt-2">
                  PNG, JPG, or PDF • Max 10MB
                </p>
              </div>
            </label>
          </div>
          {errors.id_document && (
            <p className="text-sm text-red-600">{errors.id_document}</p>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-sm text-ink-soft">
            <strong className="text-ink">Requirements:</strong> Photo must be
            clear, all information visible, and not expired. This helps us keep
            the community safe.
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Step 7 - Review & Submit
// ============================================================================

export function Step7Review({
  data,
  cities,
  onChange,
  errors,
}: {
  data: any;
  cities: City[];
  onChange: (field: string, value: any) => void;
  errors: any;
}) {
  const selectedCity = cities.find((c) => c.id === data.city_id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-ink mb-2">Review & Submit</h2>
        <p className="text-ink-soft">
          Review your profile before submitting for approval.
        </p>
      </div>

      {/* Profile Preview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-ink">Profile Preview</h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <p className="text-xs text-ink-soft uppercase font-semibold mb-1">
                Name
              </p>
              <p className="text-ink">{data.name || "Not provided"}</p>
            </div>
            <div>
              <p className="text-xs text-ink-soft uppercase font-semibold mb-1">
                Location
              </p>
              <p className="text-ink">
                {selectedCity
                  ? `${selectedCity.name}, ${selectedCity.country_name}`
                  : "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-soft uppercase font-semibold mb-1">
                Languages
              </p>
              <p className="text-ink">
                {data.languages?.join(", ") || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-soft uppercase font-semibold mb-1">
                Experience Tags
              </p>
              <p className="text-ink">
                {data.experience_tags?.join(", ") || "Not provided"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-ink-soft uppercase font-semibold mb-1">
                Tagline
              </p>
              <p className="text-ink">{data.tagline || "Not provided"}</p>
            </div>
            <div>
              <p className="text-xs text-ink-soft uppercase font-semibold mb-1">
                Pricing
              </p>
              <p className="text-ink">
                4h: ${data.price_4h || "0"} • 6h: ${data.price_6h || "0"} • 8h: $
                {data.price_8h || "0"}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-soft uppercase font-semibold mb-1">
                Availability
              </p>
              <p className="text-ink">
                {data.available_days?.join(", ") || "Not provided"}
              </p>
            </div>
            <div>
              <p className="text-xs text-ink-soft uppercase font-semibold mb-1">
                ID Document
              </p>
              <p className="text-ink">{data.id_document || "Not uploaded"}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-ink-soft uppercase font-semibold mb-2">
            Bio
          </p>
          <p className="text-ink text-sm leading-relaxed">
            {data.bio || "Not provided"}
          </p>
        </div>
      </div>

      {/* Terms Agreement */}
      <div className="space-y-3">
        <label className="flex items-start gap-3 p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-brand/50 transition-colors">
          <input
            type="checkbox"
            checked={data.terms_accepted || false}
            onChange={(e) => onChange("terms_accepted", e.target.checked)}
            className="w-5 h-5 text-brand focus:ring-brand rounded mt-0.5"
            required
          />
          <div>
            <span className="text-ink font-medium">
              I agree to the Terms and Code of Conduct{" "}
              <span className="text-red-500">*</span>
            </span>
            <p className="text-sm text-ink-soft mt-1">
              By checking this box, you agree to follow our{" "}
              <Link href="/legal/terms" className="text-brand hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/legal/code-of-conduct"
                className="text-brand hover:underline"
              >
                Code of Conduct
              </Link>
              .
            </p>
          </div>
        </label>
        {errors.terms_accepted && (
          <p className="text-sm text-red-600">{errors.terms_accepted}</p>
        )}
      </div>
    </div>
  );
}

