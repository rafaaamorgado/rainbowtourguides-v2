import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth-helpers";
import { GuideProfileForm } from "@/components/guide/profile-form";
import { updateGuideProfile } from "./actions";

export default async function GuideProfilePage() {
  const { supabase, user, profile } = await requireUser();

  // Ensure the user is a guide; if profile role is stale, trust existing guide record
  if (profile.role !== "guide") {
    const { data: guideExists } = await supabase
      .from("guides")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!guideExists) {
      redirect("/auth/sign-in?role=guide");
    }
  }

  // Fetch guide record
  const { data: guide } = await supabase
    .from("guides")
    .select("*")
    .eq("id", user.id)
    .single();

  // If no guide record exists, redirect to onboarding
  if (!guide) {
    redirect("/guide/onboarding");
  }

  // Fetch cities for dropdown
  const { data: cities } = await supabase
    .from("cities")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-6 max-w-3xl">
      <GuideProfileForm
        profile={profile}
        guide={guide}
        cities={cities || []}
        onSubmit={updateGuideProfile}
      />
    </div>
  );
}
