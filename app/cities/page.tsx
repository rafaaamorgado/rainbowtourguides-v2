import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

type City = Database["public"]["Tables"]["cities"]["Row"];

export default async function CitiesPage() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("cities")
    .select("id, country_id, name, slug, is_active, is_featured, hero_image_url, created_at, updated_at")
    .eq("is_active", true) // Filter out unpublished cities
    .order("is_featured", { ascending: false }) // Featured cities first
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

  if (cities.length === 0) {
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
        {cities.map((city) => (
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
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-3">
                  Explore {city.name} with a trusted local LGBTQ+ guide.
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

