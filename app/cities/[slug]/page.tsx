import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Shield, MapPin, Heart } from "lucide-react";
import { getCity, getGuides } from "@/lib/data-service";
import { GuidesSection } from "./guides-section";
import { cn } from "@/lib/utils";

type CityPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = await getCity(slug);

  if (!city) {
    return {
      title: "City Not Found - Rainbow Tour Guides",
    };
  }

  return {
    title: `${city.name} LGBTQ+ Tour Guides | Rainbow Tour Guides`,
    // TODO: add description field to cities table
    description: `Find verified LGBTQ+ tour guides in ${city.name}`,
    openGraph: {
      title: `${city.name} LGBTQ+ Tour Guides`,
      description: `Find verified LGBTQ+ tour guides in ${city.name}`,
      type: "website",
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;

  // Fetch city and guides data
  const city = await getCity(slug);
  const allGuides = await getGuides(slug);

  // 404 if city not found
  if (!city) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative aspect-[21/9] w-full overflow-hidden bg-slate-900">
        {/* TODO: add image_url field to cities table */}
        <Image
          src="https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1600"
          alt={`${city.name}, ${city.country_name}`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto w-full px-6 pb-12 space-y-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-white/70">
              <Link
                href="/"
                className="hover:text-white transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link
                href="/cities"
                className="hover:text-white transition-colors"
              >
                Cities
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-white font-medium">{city.name}</span>
            </nav>

            {/* City Info */}
            <div className="space-y-3">
              <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight">
                {city.name}
              </h1>
              <p className="text-xl text-white/90">
                {city.country_name} • {city.guide_count}{" "}
                {city.guide_count === 1 ? "guide" : "guides"} available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* City Info Section */}
        <section className="max-w-4xl mx-auto space-y-12">
          {/* About City */}
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-ink">
              About {city.name}
            </h2>
            {/* TODO: add description field to cities table */}
            <p className="text-lg text-ink-soft leading-relaxed">
              Discover {city.name} with our verified LGBTQ+ tour guides. Experience authentic local culture, safe spaces, and hidden gems in this vibrant destination.
            </p>
          </div>

          {/* Safety Notes Box */}
          <div className="bg-emerald-50/50 border-l-4 border-emerald-500 rounded-r-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Shield className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-ink">
                Safety & LGBTQ+ Context
              </h3>
            </div>

            <ul className="space-y-3 text-ink-soft">
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Shield className="h-3 w-3 text-emerald-600" />
                </div>
                <span className="leading-relaxed">
                  All guides are ID-verified and interviewed by our team to
                  ensure authentic, safe experiences for LGBTQ+ travelers.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin className="h-3 w-3 text-emerald-600" />
                </div>
                <span className="leading-relaxed">
                  {city.name} has established LGBTQ+ neighborhoods and venues
                  where you can connect with the local community safely.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Heart className="h-3 w-3 text-emerald-600" />
                </div>
                <span className="leading-relaxed">
                  Our guides provide up-to-date local knowledge about LGBTQ+
                  rights, cultural norms, and safe spaces in {city.name}.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Guides Section with Filtering */}
        <GuidesSection guides={allGuides} cityName={city.name} />
      </div>
    </div>
  );
}
