import { notFound } from "next/navigation";
import { CityHero } from "@/components/city/city-hero";
import { CityFilters } from "@/components/city/city-filters";
import { CityComingSoon } from "@/components/city/city-coming-soon";
import { getCity, getGuidesWithMeta, getCities } from "@/lib/data-service";
import { getMockCity, getMockGuides, getMockCities } from "@/lib/mock-data";
import { getCityImageUrl } from "@/lib/city-images";
import { formatSlug } from "@/lib/utils";

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }

  const city = (await getCity(slug)) || getMockCity(slug);

  // City not found in DB or mocks — show "Coming Soon" retention page
  if (!city) {
    const activeCities = (await getCities()) ?? [];
    const suggestionCities = activeCities.length > 0 ? activeCities : getMockCities();

    return <CityComingSoon cityName={formatSlug(slug)} cities={suggestionCities} />;
  }

  const { data: guidesData = [], error: guidesError } = await getGuidesWithMeta(slug);
  const guides =
    guidesData.length > 0
      ? guidesData.filter((g) => g.city_id === city.id)
      : getMockGuides(slug);

  // Prefer DB hero_image_url (Cloudinary), fallback to local SVG map
  const heroImage = getCityImageUrl(slug, city.image_url);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <CityHero
          name={city.name}
          country={city.country_name}
          guideCount={guides.length}
          imageSrc={heroImage}
          attribution={city.hero_image_attribution}
          attributionUrl={city.hero_image_attribution_url}
          imageSource={city.hero_image_source}
        />

        <CityFilters
          guides={guides}
          cityName={city.name}
          country={city.country_name}
          fetchError={guidesError}
        />
      </div>
    </div>
  );
}
