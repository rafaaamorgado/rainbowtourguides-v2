import { HeroSection } from "@/components/home/hero-section";
import { ExploreCitiesSection } from "@/components/home/explore-cities-section";
import { TopGuidesSection } from "@/components/home/top-guides-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { getCitiesWithMeta, getGuidesWithMeta } from "@/lib/data-service";
import { getMockCities, getMockGuides } from "@/lib/mock-data";

export default async function HomePage() {
  const [{ data: cityData = [] }, { data: guideData = [] }] = await Promise.all([
    getCitiesWithMeta(),
    getGuidesWithMeta(),
  ]);

  const cities = cityData.length > 0 ? cityData : getMockCities().slice(0, 6);
  const guides = guideData.length > 0 ? guideData : getMockGuides().slice(0, 8);

  const guideCountFromCities = cities.reduce(
    (sum, city) => sum + (city.guide_count || 0),
    0,
  );
  const heroGuideCount = guideCountFromCities || guides.length || 12;

  return (
    <div className="bg-slate-50">
      <HeroSection cities={cities} totalGuides={heroGuideCount} />
      <ExploreCitiesSection cities={cities} />
      <TopGuidesSection guides={guides} />
      <HowItWorksSection />
    </div>
  );
}
