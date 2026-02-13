import Link from 'next/link';
import { requireRole } from '@/lib/auth-helpers';
import { TravelerProfileForm } from '@/components/traveler/profile-form';
import { AvatarUploader } from '@/components/profile/AvatarUploader';
import { CoverUploader } from '@/components/profile/CoverUploader';
import { ProfileGallery } from '@/components/profile/ProfileGallery';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { updateTravelerProfile } from './actions';

export default async function TravelerProfilePage() {
  const { supabase, user, profile } = await requireRole('traveler');

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
      <div className="bg-card rounded-2xl border border-border p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display tracking-tight text-ink">
              My Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your personal information and photos.
            </p>
          </div>
          <Link
            href={`/travelers/${user.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="bordered" type="button">
              <Eye className="mr-2 h-4 w-4" />
              View Public Profile
            </Button>
          </Link>
        </div>

        {/* Cover Image (full width) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cover Image</label>
          <CoverUploader
            currentImageUrl={profile.cover_url}
            onUpload={async (file) => {
              "use server";
              // TODO: Implement actual upload logic here.
              // For now, this is a placeholder to satisfy the prop type.
              console.log("Uploading cover:", file.name);
            }}
          />
        </div>

        {/* Profile Photo (single source; can replace Google Avatar) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Profile Photo</label>
          <p className="text-sm text-muted-foreground mb-2">
            Your main photo visible to guides. You can replace a Google sign-in
            avatar here.
          </p>
          <AvatarUploader
            currentAvatarUrl={profile.avatar_url}
            userId={user.id}
          />
        </div>

        {/* Profile Form: name, bio, pronouns, country, languages, interests */}
        <TravelerProfileForm
          profile={profile}
          interests={interests}
          onSubmit={updateTravelerProfile}
        />
      </div>

      {/* Profile Gallery (same component as Guides; stored in profile_images) */}
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
