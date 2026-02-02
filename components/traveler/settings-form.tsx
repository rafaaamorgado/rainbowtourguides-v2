"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface TravelerSettingsFormProps {
  initialData: {
    full_name: string;
    is_public: boolean;
    email_notifications: boolean;
    email: string;
  };
  onSubmit: (data: TravelerSettingsFormData) => Promise<{ success: boolean; error?: string }>;
  onPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
}

export interface TravelerSettingsFormData {
  full_name: string;
  is_public: boolean;
  email_notifications: boolean;
}

export function TravelerSettingsForm({
  initialData,
  onSubmit,
  onPasswordReset,
}: TravelerSettingsFormProps) {
  const [formData, setFormData] = useState<TravelerSettingsFormData>({
    full_name: initialData.full_name || "",
    is_public: initialData.is_public ?? true,
    email_notifications: initialData.email_notifications ?? true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  const handleChange = (field: keyof TravelerSettingsFormData, value: string | boolean) => {
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
        setError(result.error || "Failed to update settings");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsResettingPassword(true);
    setError(null);
    setPasswordResetSuccess(false);

    try {
      const result = await onPasswordReset(initialData.email);
      if (result.success) {
        setPasswordResetSuccess(true);
      } else {
        setError(result.error || "Failed to send password reset email");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Settings updated successfully!
        </div>
      )}

      {passwordResetSuccess && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          Password reset link sent to your email.
        </div>
      )}

      {/* Section 1: Identity */}
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
          <CardDescription>Manage your display name and profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="full_name">Display Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>Control your profile visibility and privacy settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="is_public">Make Profile Public</Label>
              <p className="text-sm text-muted-foreground">
                If disabled, your profile is hidden from search results.
              </p>
            </div>
            <Switch
              id="is_public"
              checked={formData.is_public}
              onCheckedChange={(checked) => handleChange("is_public", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your email notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email_notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive email updates about bookings, messages, and platform news.
              </p>
            </div>
            <Switch
              id="email_notifications"
              checked={formData.email_notifications}
              onCheckedChange={(checked) => handleChange("email_notifications", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground">
                Change your password by clicking the button below. A reset link will be sent to your email.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handlePasswordReset}
              disabled={isResettingPassword}
            >
              {isResettingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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
