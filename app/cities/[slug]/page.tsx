import { notFound } from "next/navigation";
import { CityHero } from "@/components/city/city-hero";
import { CityFilters } from "@/components/city/city-filters";
import { getGuidesWithMeta, getLiveCityBySlug } from "@/lib/data-service";
import { getMockCity, getMockGuides } from "@/lib/mock-data";
import Link from "next/link";

interface CityPageProps {
  params: { slug: string };
}

export default async function CityPage({ params }: CityPageProps) {
  const slug = params?.slug;
  if (!slug) {
    notFound();
  }

  let city = await getLiveCityBySlug(slug);

  if (!city) {
    const mock = getMockCity(slug);
    if (mock) {
      city = {
        city_id: mock.id,
        name: mock.name,
        slug: mock.slug,
        hero_image_url: mock.image_url || null,
        hero_image_backup_url: null,
        hero_image_attribution: null,
        hero_image_attribution_url: null,
        approved_guide_count: mock.guide_count,
        country_name: mock.country_name,
      };
    }
  }

  if (!city) {
    notFound();
  }

  const hasGuides = (city.approved_guide_count || 0) > 0;
  const heroImage = city.hero_image_url || city.hero_image_backup_url || "/images/cities/default.svg";
  const fallbackImage = city.hero_image_backup_url || "/images/cities/default.svg";

  if (!hasGuides) {
    return (
      <div className="bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          <CityHero
            name={city.name}
            country={city.country_name || undefined}
            guideCount={0}
            imageSrc={heroImage}
            fallbackImageSrc={fallbackImage}
            attribution={city.hero_image_attribution}
            attributionUrl={city.hero_image_attribution_url || undefined}
          />

          <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold text-ink">Coming soon</h2>
            <p className="text-ink-soft">
              We&apos;re onboarding trusted guides in this city. Be the first to offer welcoming experiences.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/become-a-guide"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-brand text-white font-semibold hover:bg-brand/90 transition-colors"
              >
                Become a Guide
              </Link>
              <Link
                href="/cities"
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-slate-200 text-ink hover:bg-slate-50 transition-colors"
              >
                Browse other cities
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { data: guidesData = [], error: guidesError } = await getGuidesWithMeta(slug);
  const guides =
    guidesData.length > 0
      ? guidesData.filter((g) => g.city_id === city.city_id)
      : getMockGuides(slug);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <CityHero
          name={city.name}
          country={city.country_name || undefined}
          guideCount={guides.length}
          imageSrc={heroImage}
          fallbackImageSrc={fallbackImage}
          attribution={city.hero_image_attribution}
          attributionUrl={city.hero_image_attribution_url || undefined}
        />

        <CityFilters
          guides={guides}
          cityName={city.name}
          country={city.country_name || undefined}
          fetchError={guidesError}
        />
      </div>
    </div>
  );
}
