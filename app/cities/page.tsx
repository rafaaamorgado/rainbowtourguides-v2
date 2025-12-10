import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CityCard } from "@/components/ui/CityCard";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LGBTQ+ Friendly Cities - Rainbow Tour Guides",
  description: "Discover LGBTQ+ friendly cities around the world with vetted local guides. Safe, authentic travel experiences in curated destinations.",
  openGraph: {
    title: "LGBTQ+ Friendly Cities - Rainbow Tour Guides",
    description: "Discover LGBTQ+ friendly cities around the world with vetted local guides.",
    type: "website",
  },
};

type City = Database["public"]["Tables"]["cities"]["Row"];

type CityWithGuideCount = City & {
  guide_count: number;
};

export default async function CitiesPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch active cities with country_name
  const { data, error } = await supabase
    .from("cities")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error("[CitiesPage] Failed to load cities", error);
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          Cities unavailable
        </h1>
        <p className="text-sm text-muted-foreground">
          Something went wrong while loading destinations. Please try again in a
          moment.
        </p>
      </div>
    );
  }

  const cities = (data ?? []) as City[];

  // Fetch country names for cities that don't have country_name set
  const citiesNeedingCountryName = cities.filter((city) => !city.country_name);
  if (citiesNeedingCountryName.length > 0) {
    const countryIds = [...new Set(citiesNeedingCountryName.map((c) => c.country_id))];
    const { data: countriesData } = await supabase
      .from("countries")
      .select("id, name")
      .in("id", countryIds);

    // Type assertion needed because select("id, name") returns a narrowed type
    const countries = (countriesData ?? []) as Array<{ id: string; name: string }>;
    const countriesMap = new Map(
      countries.map((c) => [c.id, c.name])
    );

    // Update cities with country names from countries table
    cities.forEach((city) => {
      if (!city.country_name) {
        city.country_name = countriesMap.get(city.country_id) ?? null;
      }
    });
  }

  // Fetch guide counts for all cities in parallel
  const cityGuideCountsPromises = cities.map(async (city) => {
    const { count } = await supabase
      .from("guides")
      .select("*", { count: "exact", head: true })
      .eq("city_id", city.id)
      .eq("status", "approved");
    return { cityId: city.id, count: count ?? 0 };
  });

  const guideCountsResults = await Promise.all(cityGuideCountsPromises);
  const guideCountsMap = new Map(
    guideCountsResults.map((r) => [r.cityId, r.count])
  );

  // Merge guide counts with cities
  const citiesWithCounts: CityWithGuideCount[] = cities.map((city) => ({
    ...city,
    guide_count: guideCountsMap.get(city.id) ?? 0,
  }));

  if (citiesWithCounts.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          LGBTQ+ friendly cities, curated for you
        </h1>
        <p className="text-sm text-muted-foreground">
          We&apos;re still setting up our first wave of destinations. Check back soon
          as we roll out vetted cities and local guides.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <header className="space-y-4 text-center max-w-3xl mx-auto">
        <span className="text-brand font-bold uppercase tracking-widest text-xs block">
          Destinations
        </span>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight">
          LGBTQ+ friendly cities,
          <br />
          curated for you
        </h1>
        <p className="text-lg text-slate-600 font-light leading-relaxed">
          Choose a city where we have vetted local guides and up-to-date LGBTQ+ context — then dive
          into their profiles and experiences.
        </p>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {citiesWithCounts.map((city) => (
          <CityCard key={city.id} city={city as any} />
        ))}
      </div>
    </div>
  );
}

