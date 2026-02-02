import { requireRole } from "@/lib/auth-helpers";
import { TravelerSettingsForm } from "@/components/traveler/settings-form";
import { updateTravelerSettings, resetPasswordForTraveler } from "./actions";

export default async function TravelerSettingsPage() {
  const { supabase, user, profile } = await requireRole("traveler");

  // Get user email from auth
  const { data: { user: authUser } } = await supabase.auth.getUser();
  const email = authUser?.email || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">Settings</h1>
        <p className="text-ink-soft">Manage your account preferences.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <TravelerSettingsForm
          initialData={{
            full_name: profile.full_name || "",
            is_public: (profile as any).is_public ?? true,
            email_notifications: (profile as any).email_notifications ?? true,
            email: email,
          }}
          onSubmit={updateTravelerSettings}
          onPasswordReset={resetPasswordForTraveler}
        />
      </div>
    </div>
  );
}
