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
    <div className="space-y-6 max-w-3xl">
      {/* Single "My Profile" container: Cover, Profile Photo, form, then gallery */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and photos.</p>
        </div>

        {/* Cover Image (full width) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cover Image</label>
          <CoverUploader
            currentCoverUrl={profile.cover_url}
            userId={user.id}
          />
        </div>

        {/* Profile Photo (single source; can replace Google Avatar) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Profile Photo</label>
          <p className="text-sm text-muted-foreground mb-2">
            Your main photo visible to guides. You can replace a Google sign-in avatar here.
          </p>
          <AvatarUploader
            currentAvatarUrl={profile.avatar_url}
            userId={user.id}
          />
        </div>

        {/* Profile Form: name, bio, pronouns, country, languages, interests */}
        <TravelerProfileForm
          profile={profile}
          countries={countries || []}
          interests={interests}
          onSubmit={updateTravelerProfile}
        />
      </div>

      {/* Profile Gallery (same component as Guides; stored in profile_images) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <h2 className="text-xl font-semibold mb-4">Travel Photos</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Upload multiple photos to showcase your travels. No limit.
        </p>
        <ProfileGallery
          userId={user.id}
          isOwner={true}
          initialImages={profileImages || []}
        />
      </div>
    </div>
  );
}
