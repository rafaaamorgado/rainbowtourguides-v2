"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import {
  createSupabaseBrowserClient,
  isSupabaseConfiguredOnClient,
} from "@/lib/supabase-browser";
import { uploadAvatar } from "@/lib/storage-helpers";

export default function TravelerOnboardingPage() {
  const router = useRouter();
  const isConfigured = isSupabaseConfiguredOnClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/sign-in");
        return;
      }

      setUserId(user.id);

      // Check if traveler profile already exists
      const { data: traveler } = await supabase
        .from("travelers")
        .select("id")
        .eq("id", user.id)
        .single();

      if (traveler) {
        // Already completed onboarding
        router.replace("/traveler/bookings");
        return;
      }

      // Get profile data to pre-fill
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, bio")
        .eq("id", user.id)
        .single();

      if (profile) {
        setFormData({
          full_name: (profile as any).full_name || "",
          bio: (profile as any).bio || "",
          avatar_url: (profile as any).avatar_url || "",
        });
      }

      setIsLoading(false);
    }

    loadProfile();
  }, [router]);

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (!userId) {
        return { success: false, error: "Not authenticated" };
      }
      return uploadAvatar(userId, file);
    },
    [userId]
  );

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.full_name.trim()) {
      setError("Please enter your name");
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError("Supabase not configured");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/sign-in");
        return;
      }

      // Update profile
      const { error: profileError } = await (supabase as any)
        .from("profiles")
        .update({
          full_name: formData.full_name.trim(),
          bio: formData.bio.trim() || null,
          avatar_url: formData.avatar_url.trim() || null,
        })
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      // Create traveler record
      const { error: travelerError } = await (supabase as any)
        .from("travelers")
        .insert({
          id: user.id,
        });

      if (travelerError) {
        throw travelerError;
      }

      setShowSuccess(true);

      // Redirect after success
      setTimeout(() => {
        router.replace("/traveler/bookings");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">
          Supabase is not configured. Check your environment variables.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-ink mb-2">
              Welcome aboard!
            </h2>
            <p className="text-ink-soft">
              Your profile is set up. Let's find you an amazing guide!
            </p>
          </div>
          <p className="text-sm text-ink-soft">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ink mb-2">Complete Your Profile</h1>
        <p className="text-ink-soft">
          Just a few details to help guides get to know you better.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
          {/* Avatar Upload */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">
              Profile Photo <span className="text-ink-soft font-normal">(optional)</span>
            </label>
            <AvatarUpload
              value={formData.avatar_url}
              onChange={(url) => handleChange("avatar_url", url || "")}
              onUpload={handleAvatarUpload}
              size="lg"
              disabled={isSubmitting}
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">
              Your Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter your name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              required
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-ink">
              About You <span className="text-ink-soft font-normal">(optional)</span>
            </label>
            <Textarea
              placeholder="Tell guides a bit about yourself - your interests, travel style, or what you're hoping to experience..."
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              rows={4}
            />
            <p className="text-xs text-ink-soft">
              This helps guides personalize your experience
            </p>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center">{error}</p>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.replace("/traveler/bookings")}
            disabled={isSubmitting}
          >
            Skip for now
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Complete Profile"}
          </Button>
        </div>
      </form>
    </div>
  );
}
