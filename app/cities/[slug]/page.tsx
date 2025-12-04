import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

type CityPageProps = {
  params: Promise<{ slug: string }>;
};

type City = Database["public"]["Tables"]["cities"]["Row"];
type Guide = Database["public"]["Tables"]["guides"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type GuideWithProfile = Guide & {
  profile: Profile;
};

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  // Fetch city by slug
  const { data: city, error: cityError } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (cityError || !city) {
    notFound();
  }

  const typedCity = city as City;

  // Fetch approved guides for this city with their profile data
  const { data: guidesData, error: guidesError } = await supabase
    .from("guides")
    .select("*")
    .eq("city_id", typedCity.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (guidesError) {
    console.error("[CityPage] Failed to load guides", guidesError);
  }

  const guides = (guidesData ?? []) as Guide[];

  // Fetch profiles for all guides
  const guideIds = guides.map((g) => g.id);
  const { data: profilesData } = await supabase
    .from("profiles")
    .select("*")
    .in("id", guideIds);

  const profiles = (profilesData ?? []) as Profile[];
  const profilesMap = new Map(profiles.map((p) => [p.id, p]));

  // Merge guides with their profiles
  const guidesWithProfiles: GuideWithProfile[] = guides
    .map((guide) => {
      const profile = profilesMap.get(guide.id);
      if (!profile) return null;
      return { ...guide, profile };
    })
    .filter((g): g is GuideWithProfile => g !== null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 space-y-10">
      {/* City Header */}
      <header className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight">
            {typedCity.name}
          </h1>
          {typedCity.country_name && (
            <p className="text-sm text-muted-foreground">
              {typedCity.country_name}
            </p>
          )}
        </div>
        <div className="max-w-3xl">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {typedCity.name} is a welcoming destination for LGBTQ+ travelers, offering
            vibrant culture, inclusive spaces, and a supportive community. Our local
            guides are here to help you discover the best queer-friendly neighborhoods,
            events, and hidden gems while ensuring a safe and authentic experience.
          </p>
        </div>
      </header>

      {/* Guides Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Local Guides
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {guidesWithProfiles.length} {guidesWithProfiles.length === 1 ? "guide" : "guides"} available
            </p>
          </div>
        </div>

        {guidesWithProfiles.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No approved guides yet in {typedCity.name}. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {guidesWithProfiles.map((guide) => (
              <Card key={guide.id} className="flex flex-col h-full">
                <CardHeader className="space-y-3">
                  <div className="flex items-start gap-3">
                    {guide.profile.avatar_url ? (
                      <Image
                        src={guide.profile.avatar_url}
                        alt={guide.profile.display_name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-lg font-medium text-muted-foreground">
                          {guide.profile.display_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">
                        {guide.profile.display_name}
                      </CardTitle>
                      {guide.headline && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {guide.headline}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {/* Themes */}
                  {guide.themes && guide.themes.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Themes</p>
                      <div className="flex flex-wrap gap-1">
                        {guide.themes.slice(0, 3).map((theme, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px]">
                            {theme}
                          </Badge>
                        ))}
                        {guide.themes.length > 3 && (
                          <Badge variant="secondary" className="text-[10px]">
                            +{guide.themes.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {guide.languages && guide.languages.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Languages</p>
                      <p className="text-xs text-foreground">
                        {guide.languages.join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Pricing */}
                  {guide.hourly_rate && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium">
                        From ${parseFloat(guide.hourly_rate).toFixed(0)}/hour
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="pt-2">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Link href={`/guides/${guide.slug}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
