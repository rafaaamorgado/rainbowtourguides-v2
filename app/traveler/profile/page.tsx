import { requireRole } from '@/lib/auth-helpers';
import { TravelerProfileForm } from '@/components/traveler/profile-form';
import { AvatarUploader } from '@/components/profile/AvatarUploader';
import { CoverUploader } from '@/components/profile/CoverUploader';
import { ProfileGallery } from '@/components/profile/ProfileGallery';
import { updateTravelerProfile } from './actions';

export default async function TravelerProfilePage() {
  const { supabase, user, profile } = await requireRole('traveler');

  // Fetch countries for dropdown
  const { data: countries } = await supabase
    .from('countries')
    .select('*')
    .order('name');

  // Fetch traveler record for interests
  const travelerResult = await supabase
    .from('travelers')
    .select('interests')
    .eq('id', user.id)
    .single();

  // Extract interests safely (cast to any to handle Supabase typing)
  const interests = ((travelerResult.data as any)?.interests as string[]) || [];

  // Fetch profile images for gallery
  const { data: profileImages } = await supabase
    .from('profile_images')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-ink">My Profile</h1>
        <p className="text-ink-soft">Manage your personal information.</p>
      </div>

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
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <TravelerProfileForm
          profile={profile}
          countries={countries || []}
          interests={interests}
          onSubmit={updateTravelerProfile}
        />
      </div>
    </div>
  );
}
