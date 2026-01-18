import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { CityHero } from "@/components/city/city-hero";
import { CityFilters } from "@/components/city/city-filters";
import { getCity, getGuidesWithMeta } from "@/lib/data-service";
import { getMockCity, getMockGuides } from "@/lib/mock-data";

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

function resolveCityImage(slug: string) {
  const publicDir = path.join(process.cwd(), "public", "images", "cities");
  const candidates = [
    path.join(publicDir, `${slug}.jpg`),
    path.join(publicDir, `${slug}.png`),
    path.join(publicDir, `${slug}.svg`),
  ];

  const found = candidates.find((filePath) => fs.existsSync(filePath));
  if (found) {
    return `/images/cities/${path.basename(found)}`;
  }
  return "/images/cities/default.svg";
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  if (!slug) {
    notFound();
  }

  const city = (await getCity(slug)) || getMockCity(slug);

  if (!city) {
    notFound();
  }

  const { data: guidesData = [], error: guidesError } = await getGuidesWithMeta(slug);
  const guides =
    guidesData.length > 0
      ? guidesData.filter((g) => g.city_id === city.id)
      : getMockGuides(slug);

  const heroImage = resolveCityImage(slug);

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <CityHero
          name={city.name}
          country={city.country_name}
          guideCount={guides.length}
          imageSrc={heroImage}
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
