"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";

export interface GuideSettingsFormData {
  full_name: string;
  hide_public_profile: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

interface GuideSettingsFormProps {
  initialData: {
    full_name: string;
    hide_public_profile: boolean;
    email_notifications: boolean;
    sms_notifications: boolean;
    email: string;
  };
  onSubmit: (data: GuideSettingsFormData) => Promise<{ success: boolean; error?: string }>;
  onPasswordReset: (email: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteAccount?: () => Promise<{ success: boolean; error?: string }>;
}

export function GuideSettingsForm({
  initialData,
  onSubmit,
  onPasswordReset,
  onDeleteAccount,
}: GuideSettingsFormProps) {
  const [formData, setFormData] = useState<GuideSettingsFormData>({
    full_name: initialData.full_name || "",
    hide_public_profile: initialData.hide_public_profile ?? false,
    email_notifications: initialData.email_notifications ?? true,
    sms_notifications: initialData.sms_notifications ?? false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);

  const handleChange = (field: keyof GuideSettingsFormData, value: string | boolean) => {
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
        window.dispatchEvent(new Event("profile-updated"));
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

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
    if (!onDeleteAccount) {
      setError("Account deletion is not available. Please contact support.");
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      const result = await onDeleteAccount();
      if (result.success) {
        window.location.href = "/";
      } else {
        setError(result.error || "Failed to delete account");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsDeleting(false);
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

      {/* Identity */}
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

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>Control your public profile visibility (e.g. when on vacation or not ready to accept bookings).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="hide_public_profile">Hide Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                When enabled, your guide profile is hidden from search and public listing.
              </p>
            </div>
            <Switch
              id="hide_public_profile"
              checked={formData.hide_public_profile}
              onCheckedChange={(checked) => handleChange("hide_public_profile", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage how you receive updates about bookings and messages.</CardDescription>
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
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms_notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive text message alerts. (Coming soon.)
              </p>
            </div>
            <Switch
              id="sms_notifications"
              checked={formData.sms_notifications}
              onCheckedChange={(checked) => handleChange("sms_notifications", checked)}
              disabled
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
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

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Account"
            )}
          </Button>
        </CardContent>
      </Card>

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
