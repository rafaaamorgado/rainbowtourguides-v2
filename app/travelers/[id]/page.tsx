import { notFound } from 'next/navigation';
import { TravelerPublicHero } from '@/components/traveler/traveler-public-hero';
import { PublicProfileGallery } from '@/components/profile/PublicProfileGallery';
import { Badge } from '@/components/ui/badge';
import { createSupabaseServerClient } from '@/lib/supabase-server';

interface TravelerPageProps {
  params: Promise<{ id: string }>;
}

function formatJoinedDate(isoDate: string | null | undefined): string {
  if (!isoDate) return 'Unknown';
  try {
    const d = new Date(isoDate);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } catch {
    return 'Unknown';
  }
}

export default async function TravelerPublicPage({ params }: TravelerPageProps) {
  const { id } = await params;
  if (!id) notFound();

  const supabase = await createSupabaseServerClient();

  const { data: profileRow, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, full_name, avatar_url, cover_url, bio, country_of_origin, languages, created_at')
    .eq('id', id)
    .single();

  if (profileError || !profileRow) {
    notFound();
  }

  const profile = profileRow as {
    id: string;
    role: string;
    full_name: string;
    avatar_url: string | null;
    cover_url: string | null;
    bio: string | null;
    country_of_origin: string | null;
    languages: string[] | null;
    created_at: string;
  };

  if (profile.role !== 'traveler') {
    notFound();
  }

  const [travelerResult, countryResult, galleryResult] = await Promise.all([
    supabase.from('travelers').select('interests').eq('id', id).single(),
    profile.country_of_origin
      ? supabase
          .from('countries')
          .select('name')
          .eq('iso_code', profile.country_of_origin)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from('profile_images')
      .select('*')
      .eq('user_id', id)
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  const interests = ((travelerResult.data as { interests?: string[] } | null)?.interests ?? []) as string[];
  const countryName = (countryResult.data as { name?: string } | null)?.name ?? null;
  const galleryImages = galleryResult.data ?? [];

  const fullName = profile.full_name || 'Traveler';
  const joinedDate = formatJoinedDate(profile.created_at);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <TravelerPublicHero
          name={fullName}
          countryName={countryName}
          joinedDate={joinedDate}
          avatarUrl={profile.avatar_url}
          coverUrl={profile.cover_url}
        />

        <div className="space-y-8">
          {(profile.bio ?? '').trim() && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-ink mb-4">About</h2>
              <p className="text-ink-soft leading-relaxed">{profile.bio}</p>
            </section>
          )}

          {((profile.languages ?? []).length > 0 || interests.length > 0) && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
              {(profile.languages ?? []).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-ink">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {(profile.languages ?? []).map((lang) => (
                      <Badge
                        key={lang}
                        variant="secondary"
                        className="rounded-full px-3 py-1"
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {interests.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-ink">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="rounded-full px-3 py-1"
                      >
                        {tag.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {galleryImages.length > 0 && (
            <PublicProfileGallery
              images={galleryImages}
              userName={fullName}
            />
          )}
        </div>
      </div>
    </div>
  );
}
