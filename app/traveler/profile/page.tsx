import { requireRole } from "@/lib/auth-helpers";
import { TravelerProfileForm } from "@/components/traveler/profile-form";
import { updateTravelerProfile } from "./actions";

export default async function TravelerProfilePage() {
  const { supabase, user, profile } = await requireRole("traveler");

  // Fetch countries for dropdown
  const { data: countries } = await supabase
    .from("countries")
    .select("*")
    .order("name");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">My Profile</h1>
        <p className="text-ink-soft">Manage your personal information.</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <TravelerProfileForm
          profile={profile}
          countries={countries || []}
          onSubmit={updateTravelerProfile}
        />
      </div>
    </div>
  );
}
