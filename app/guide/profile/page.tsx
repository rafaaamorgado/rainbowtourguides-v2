import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-helpers';
import { GuideProfileForm } from '@/components/guide/profile-form';
import { ProfileGallery } from '@/components/profile/ProfileGallery';
import { updateGuideProfile, updateProfileAvatar } from './actions';

export default async function GuideProfilePage() {
  const { supabase, user, profile } = await requireRole('guide');

  // Fetch guide record with city + country data for initial form values
  const { data: guide } = await (supabase as any)
    .from('guides')
    .select('*, city:cities!guides_city_id_fkey(name, country_code, country_name)')
    .eq('id', user.id)
    .single();

  // If no guide record exists, redirect to onboarding
  if (!guide) {
    redirect('/guide/onboarding');
  }

  // Fetch profile images for gallery
  const { data: profileImages } = await supabase
    .from('profile_images')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Single "Profile & Listing" section: Cover, Profile Photo, fields, then gallery */}
      <div className="bg-card rounded-2xl border border-border p-8">
        <GuideProfileForm
          profile={profile}
          guide={guide}
          initialCityName={guide.city?.name || ''}
          initialCountryCode={guide.city?.country_code || ''}
          onSubmit={updateGuideProfile}
          onProfilePhotoUpdate={updateProfileAvatar}
        />
      </div>

      {/* Profile Gallery */}
      <div className="bg-card rounded-2xl border border-border p-8">
        <ProfileGallery
          userId={user.id}
          isOwner={true}
          initialImages={profileImages || []}
        />
      </div>
    </div>
  );
}
