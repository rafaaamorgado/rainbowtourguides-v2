import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ChevronRight, MapPin, Shield } from "lucide-react";
import { GuideCard } from "@/components/cards/GuideCard";
import { Button } from "@/components/ui/button";
import { getGuides } from "@/lib/data-service";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Database } from "@/types/database";

type CityPageProps = {
  params: Promise<{ slug: string }>;
};

type CityRow = Database["public"]["Tables"]["cities"]["Row"] & {
  description?: string | null;
  country?: Pick<
    Database["public"]["Tables"]["countries"]["Row"],
    "name" | "iso_code"
  > | null;
};

type CityDetails = {
  id: string;
  name: string;
  slug: string;
  description: string;
  countryName: string;
  heroImageUrl: string | null;
};

const HERO_FALLBACKS: Record<string, string> = {
  berlin:
    "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?auto=format&fit=crop&w=2000&q=80",
  london:
    "https://images.unsplash.com/photo-1439416915279-68957d5720e5?auto=format&fit=crop&w=2000&q=80",
  paris:
    "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=2000&q=80",
};

const getCityBySlug = cache(async (slug: string): Promise<CityDetails | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cities")
    .select(
      `
        *,
        country:countries!cities_country_id_fkey(name, iso_code)
      `,
    )
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  const city = data as CityRow;

  if (!city.is_active) {
    return null;
  }

  return {
    id: city.id,
    name: city.name,
    slug: city.slug,
    description:
      (city.description ?? "").trim() ||
      `Inclusive, LGBTQ+ friendly travel experiences in ${city.name}.`,
    countryName: city.country?.name ?? city.country_name ?? "Unknown country",
    heroImageUrl: city.hero_image_url,
  };
});

function getHeroImage(city: CityDetails) {
  return (
    city.heroImageUrl ||
    HERO_FALLBACKS[city.slug] ||
    "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=2000&q=80"
  );
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCityBySlug(slug);

  if (!city) {
    return {
      title: "City Not Found - Rainbow Tour Guides",
    };
  }

  const title = `${city.name} LGBTQ+ Tour Guides | Rainbow Tour Guides`;
  const description = city.description;
  const heroImage = getHeroImage(city);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: `${city.name} skyline`,
        },
      ],
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  const city = await getCityBySlug(slug);

  if (!city) {
    notFound();
  }

  const guides = await getGuides(slug);
  const heroImage = getHeroImage(city);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroImage}
            alt={`${city.name} skyline`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/60 to-black/70" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-20 space-y-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-white/80">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/cities" className="hover:text-white transition-colors">
              Cities
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white font-medium">{city.name}</span>
          </nav>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
              <MapPin className="h-4 w-4 text-white" />
              <span className="text-sm text-white/90">{city.countryName}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-white leading-tight">
              {city.name}
            </h1>

            <p className="text-lg text-white/80 leading-relaxed">
              {city.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="flex items-center gap-2 text-white/85 text-sm">
                <Shield className="h-4 w-4" />
                <span>Vetted LGBTQ+ locals. Thoughtful, safe experiences.</span>
              </div>
              <Button asChild>
                <Link href="#guides">Browse guides</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Guides */}
      <main
        id="guides"
        className="max-w-6xl mx-auto px-6 py-14 sm:py-16 space-y-10"
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Guides
            </p>
            <h2 className="text-3xl font-serif text-ink">
              Guides in {city.name}
            </h2>
            <p className="text-ink-soft">
              LGBTQ+ locals ready to share safe spaces, hidden gems, and the
              city&apos;s queer history.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-soft">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>
              {guides.length} {guides.length === 1 ? "guide" : "guides"} available
            </span>
          </div>
        </div>

        {guides.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center space-y-4">
            <h3 className="text-2xl font-serif text-ink">
              We&apos;re launching in {city.name} soon! Become a guide.
            </h3>
            <p className="text-ink-soft max-w-2xl mx-auto">
              Join as a founding guide to welcome travelers, spotlight queer
              culture, and shape the first experiences in this city.
            </p>
            <div className="flex justify-center">
              <Button asChild>
                <Link href="/auth/sign-up?role=guide">Become a guide</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.map((guide) => (
              <GuideCard
                key={guide.id}
                guide={{
                  id: guide.id,
                  slug: guide.slug,
                  name: guide.name,
                  avatar_url: guide.avatar_url ?? guide.photo_url,
                  photo_url: guide.photo_url,
                  city_name: guide.city_name,
                  tagline: guide.bio || guide.tagline, // mapped bio/tagline
                  rating: guide.rating,
                  review_count: guide.review_count,
                  price_4h: guide.price_4h,
                  // Pass original prices if needed, keeping it simple for now as per component logic
                  experience_tags: guide.experience_tags || [],
                  verified: false, // Defaults
                  instant_book: false, // Defaults
                }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
