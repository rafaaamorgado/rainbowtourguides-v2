import { requireRole } from "@/lib/auth-helpers";
import { GuideSettingsForm } from "@/components/guide/settings-form";
import { updateGuideSettings, resetPasswordForGuide, deleteGuideAccount } from "./actions";

export default async function GuideSettingsPage() {
  const { supabase, profile } = await requireRole("guide");

  const { data: { user: authUser } } = await supabase.auth.getUser();
  const email = authUser?.email ?? "";

  const profileAny = profile as { is_public?: boolean | null; email_notifications?: boolean | null };
  const isPublic = profileAny.is_public ?? true;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold font-display text-ink">Settings</h1>
        <p className="text-ink-soft">Manage your account preferences.</p>
      </div>
      <div className="bg-card rounded-2xl border border-border p-8">
        <GuideSettingsForm
          initialData={{
            full_name: profile.full_name || "",
            hide_public_profile: !isPublic,
            email_notifications: profileAny.email_notifications ?? true,
            sms_notifications: false,
            email,
          }}
          onSubmit={updateGuideSettings}
          onPasswordReset={resetPasswordForGuide}
          onDeleteAccount={deleteGuideAccount}
        />
      </div>
    </div>
  );
}
