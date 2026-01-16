import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { GuideCard } from "@/components/traveler/guide-card";

export const metadata = {
  title: "Local LGBTQ+ Guides",
  description: "Find verified local guides for your next trip.",
};

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();

  // Create server client to fetch data
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Server components cannot set cookies, but this is required for the interface
        },
      },
    }
  );

  // 1. Fetch City details
  // Note: RLS on cities is "public viewable", so strictly anon key works.
  const { data: city, error: cityError } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (cityError || !city) {
    notFound();
  }

  // 2. Fetch Guides in this city
  // We join profiles to get display_name and avatar
  const { data: guides, error: guidesError } = await supabase
    .from("guides")
    .select(`
      id,
      slug,
      tagline,
      base_price_4h,
      currency,
      status,
      city_id,
      themes,
      profile:profiles!inner (
        display_name,
        avatar_url
      )
    `)
    .eq("city_id", city.id)
    .eq("status", "approved") // Only show approved guides
    .limit(50);

  // Note on Typing: Supabase join typing can be tricky.
  // We'll coerce types slightly for the component if needed, or define a specific type.
  const formattedGuides = (guides || []).map((g: any) => ({
    slug: g.slug,
    display_name: g.profile.display_name,
    avatar_url: g.profile.avatar_url,
    tagline: g.tagline,
    city_name: city.name,
    specialties: g.themes,
    price_start: g.base_price_4h,
    currency: g.currency,
  }));

  return (
    <div className="container py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          LGBTQ+ Guides in {city.name}
        </h1>
        <p className="text-xl text-muted-foreground">
          Meet verified locals who share your values and know the best spots in town.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {formattedGuides.length > 0 ? (
          formattedGuides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center border rounded-lg bg-muted/20">
            <h3 className="text-lg font-medium">No guides found yet</h3>
            <p className="text-muted-foreground mt-2">
              We are just launching in {city.name}. Be the first guide!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
