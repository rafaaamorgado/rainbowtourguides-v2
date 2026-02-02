import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth-helpers';
import { GuideProfileForm } from '@/components/guide/profile-form';
import { AvatarUploader } from '@/components/profile/AvatarUploader';
import { CoverUploader } from '@/components/profile/CoverUploader';
import { ProfileGallery } from '@/components/profile/ProfileGallery';
import { updateGuideProfile } from './actions';

export default async function GuideProfilePage() {
  const { supabase, user, profile } = await requireRole('guide');

  // Fetch guide record
  const { data: guide } = await supabase
    .from('guides')
    .select('*')
    .eq('id', user.id)
    .single();

  // If no guide record exists, redirect to onboarding
  if (!guide) {
    redirect('/guide/onboarding');
  }

  // Fetch cities for dropdown
  const { data: cities } = await supabase
    .from('cities')
    .select('*')
    .eq('is_active', true)
    .order('name');

  // Fetch profile images for gallery
  const { data: profileImages } = await supabase
    .from('profile_images')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Cover and Avatar Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Profile Images</h2>

          {/* Cover Image */}
          <div className="space-y-2 mb-6">
            <label className="text-sm font-medium">Cover Image</label>
            <CoverUploader
              currentCoverUrl={profile.cover_url}
              userId={user.id}
            />
          </div>

          {/* Avatar Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Avatar</label>
            <AvatarUploader
              currentAvatarUrl={profile.avatar_url}
              userId={user.id}
            />
          </div>
        </div>
      </div>

      {/* Profile Gallery */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <ProfileGallery
          userId={user.id}
          isOwner={true}
          initialImages={profileImages || []}
        />
      </div>

      {/* Profile Form */}
      <GuideProfileForm
        profile={profile}
        guide={guide}
        cities={cities || []}
        onSubmit={updateGuideProfile}
      />
    </div>
  );
}
