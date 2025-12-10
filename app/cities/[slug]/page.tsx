import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { GuideCard } from "@/components/ui/GuideCard";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

type CityPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: city } = await supabase
    .from("cities")
    .select("name, country_name")
    .eq("slug", slug)
    .single();

  if (!city) {
    return {
      title: "City Not Found - Rainbow Tour Guides",
    };
  }

  const typedCity = city as { name: string; country_name: string | null };
  const location = typedCity.country_name ? `${typedCity.name}, ${typedCity.country_name}` : typedCity.name;

  return {
    title: `${location} - LGBTQ+ Travel Guides | Rainbow Tour Guides`,
    description: `Discover ${location} with vetted LGBTQ+ local guides. Safe, authentic travel experiences with expert local knowledge.`,
    openGraph: {
      title: `${location} - LGBTQ+ Travel Guides`,
      description: `Discover ${location} with vetted LGBTQ+ local guides.`,
      type: "website",
    },
  };
}

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

  // Fetch country name if not present in city
  if (!typedCity.country_name) {
    const { data: countryData } = await supabase
      .from("countries")
      .select("name")
      .eq("id", typedCity.country_id)
      .single();
    
    // Type assertion needed because select("name") returns a narrowed type
    const country = countryData as { name: string } | null;
    if (country) {
      typedCity.country_name = country.name;
    }
  }

  // Fetch approved guides for this city with their profile data
  const { data: guidesData, error: guidesError } = await supabase
    .from("guides")
    .select("*, profile:profiles(display_name, avatar_url)")
    .eq("city_id", typedCity.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (guidesError) {
    console.error("[CityPage] Failed to load guides", guidesError);
  }

  // Type assertion for guides with joined profile data
  const guides = (guidesData ?? []) as any[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-16">
      {/* City Header */}
      <header className="space-y-6 text-center max-w-3xl mx-auto">
        <div className="space-y-3">
          <span className="text-brand font-bold uppercase tracking-widest text-xs block">
            {typedCity.country_name || "Destination"}
          </span>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight">
            {typedCity.name}
          </h1>
        </div>
        <p className="text-lg text-slate-600 font-light leading-relaxed">
          {typedCity.name} is a welcoming destination for LGBTQ+ travelers, offering vibrant
          culture, inclusive spaces, and a supportive community. Our local guides are here to help
          you discover the best queer-friendly neighborhoods, events, and hidden gems while ensuring
          a safe and authentic experience.
        </p>
      </header>

      {/* Guides Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-2">
            Meet Your Guides
          </h2>
          <p className="text-slate-600 font-light">
            {guides.length} {guides.length === 1 ? "guide" : "guides"} ready to show you around
          </p>
        </div>

        {guides.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500">
              No approved guides yet in {typedCity.name}. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {guides.map((guide: any) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
