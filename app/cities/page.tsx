import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

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
    <div className="mx-auto max-w-5xl px-4 py-12 space-y-8">
      <header className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Destinations
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          LGBTQ+ friendly cities, curated for you
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Choose a city where we have vetted local guides and up-to-date
          LGBTQ+ context — then dive into their profiles and experiences.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {citiesWithCounts.map((city) => (
          <Link key={city.id} href={`/cities/${city.slug}`}>
            <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-md">
              <CardHeader className="space-y-1">
                <CardTitle className="flex items-center justify-between text-base">
                  <span>{city.name}</span>
                  {city.is_featured && (
                    <Badge variant="secondary" className="text-[11px]">
                      Featured
                    </Badge>
                  )}
                </CardTitle>
                {city.country_name && (
                  <p className="text-xs text-muted-foreground">
                    {city.country_name}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-xs text-muted-foreground line-clamp-2">
                  Explore {city.name} with a trusted local LGBTQ+ guide.
                </p>
                <p className="text-xs font-medium text-foreground">
                  {city.guide_count} {city.guide_count === 1 ? "guide" : "guides"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

