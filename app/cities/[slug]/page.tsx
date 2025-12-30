import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Shield, Heart, Users, ArrowRight } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { GuideCard } from "@/components/ui/GuideCard";
import { Button } from "@/components/ui/button";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

type CityPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: city } = await supabase
    .from("cities")
    .select("name, country_name")
    .eq("slug", slug)
    .single();

  if (!city) {
    return {
      title: "City Not Found - Rainbow Tour Guides",
    };
  }

  const typedCity = city as { name: string; country_name: string | null };
  const location = typedCity.country_name ? `${typedCity.name}, ${typedCity.country_name}` : typedCity.name;

  return {
    title: `${location} - LGBTQ+ Travel Guides | Rainbow Tour Guides`,
    description: `Discover ${location} with vetted LGBTQ+ local guides. Safe, authentic travel experiences with expert local knowledge.`,
    openGraph: {
      title: `${location} - LGBTQ+ Travel Guides`,
      description: `Discover ${location} with vetted LGBTQ+ local guides.`,
      type: "website",
    },
  };
}

type City = Database["public"]["Tables"]["cities"]["Row"];
type Guide = Database["public"]["Tables"]["guides"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type GuideWithProfile = Guide & {
  profile: Profile;
};

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  // Fetch city by slug
  const { data: city, error: cityError } = await supabase
    .from("cities")
    .select("*")
    .eq("slug", slug)
    .single();

  if (cityError || !city) {
    notFound();
  }

  const typedCity = city as City;

  // Fetch country name if not present in city
  if (!typedCity.country_name) {
    const { data: countryData } = await supabase
      .from("countries")
      .select("name")
      .eq("id", typedCity.country_id)
      .single();

    // Type assertion needed because select("name") returns a narrowed type
    const country = countryData as { name: string } | null;
    if (country) {
      typedCity.country_name = country.name;
    }
  }

  // Fetch approved guides for this city with their profile data
  const { data: guidesData, error: guidesError } = await supabase
    .from("guides")
    .select("*, profile:profiles(display_name, avatar_url)")
    .eq("city_id", typedCity.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (guidesError) {
    console.error("[CityPage] Failed to load guides", guidesError);
  }

  // Type assertion for guides with joined profile data
  const guides = (guidesData ?? []) as any[];

  return (
    <div className="space-y-0">
      {/* Hero Section with City Image */}
      {typedCity.hero_image_url && (
        <section className="relative h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden">
          <Image
            src={typedCity.hero_image_url}
            alt={typedCity.name}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          <div className="absolute inset-0 flex items-end">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full">
              <div className="max-w-3xl space-y-4">
                <span className="inline-block text-white/90 font-bold uppercase tracking-widest text-xs px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                  {typedCity.country_name || "Destination"}
                </span>
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-white tracking-tight">
                  {typedCity.name}
                </h1>
                <p className="text-xl text-white/90 font-light leading-relaxed">
                  {guides.length} {guides.length === 1 ? "local guide" : "local guides"} ready to show you the authentic side of the city
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Header (if no hero image) */}
      {!typedCity.hero_image_url && (
        <header className="py-16 bg-slate-50 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-6 text-center max-w-3xl mx-auto">
              <div className="space-y-3">
                <span className="text-brand font-bold uppercase tracking-widest text-xs block">
                  {typedCity.country_name || "Destination"}
                </span>
                <h1 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 tracking-tight">
                  {typedCity.name}
                </h1>
              </div>
              <p className="text-xl text-slate-600 font-light leading-relaxed">
                {guides.length} {guides.length === 1 ? "local guide" : "local guides"} ready to show you around
              </p>
            </div>
          </div>
        </header>
      )}

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 space-y-20">
        {/* About This City Section */}
        <section className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div>
              <span className="text-brand font-bold uppercase tracking-widest text-xs block mb-3">
                About
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6">
                Why Visit {typedCity.name}?
              </h2>
            </div>
            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-slate-600 font-light leading-relaxed">
                {typedCity.name} is a welcoming destination for LGBTQ+ travelers, offering vibrant
                culture, inclusive spaces, and a supportive community. Our local guides are here to help
                you discover the best queer-friendly neighborhoods, events, and hidden gems while ensuring
                a safe and authentic experience.
              </p>
            </div>
          </div>

          {/* LGBTQ+ Safety & Community Section */}
          <div className="space-y-6">
            <div>
              <span className="text-brand font-bold uppercase tracking-widest text-xs block mb-3">
                Safety & Community
              </span>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-6">
                LGBTQ+ Travel Info
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield size={20} className="text-brand" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Vetted Guides</h4>
                  <p className="text-sm text-slate-600 font-light leading-relaxed">
                    All our guides are ID-verified, interviewed, and part of the local LGBTQ+ community.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart size={20} className="text-brand" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Safe Spaces</h4>
                  <p className="text-sm text-slate-600 font-light leading-relaxed">
                    Explore queer-friendly neighborhoods, bars, events, and cultural spots with locals who know them best.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Users size={20} className="text-brand" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Community Support</h4>
                  <p className="text-sm text-slate-600 font-light leading-relaxed">
                    Connect with local LGBTQ+ communities and get insider knowledge you won&apos;t find in guidebooks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Guides Section */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
              Meet Your Guides in {typedCity.name}
            </h2>
            <p className="text-lg text-slate-600 font-light">
              {guides.length > 0
                ? `Browse ${guides.length} ${guides.length === 1 ? "verified guide" : "verified guides"} ready to create your perfect experience`
                : "Be the first to offer tours in this amazing city"
              }
            </p>
          </div>

          {guides.length === 0 ? (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Users size={36} className="text-slate-400" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-serif font-bold text-slate-900">
                    No Guides Yet in {typedCity.name}
                  </h3>
                  <p className="text-slate-600 font-light leading-relaxed">
                    We&apos;re looking for passionate local LGBTQ+ guides to join our community.
                    <br />
                    Know this city like the back of your hand?
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button asChild size="lg">
                    <Link href="/auth/sign-up?role=guide" className="gap-2">
                      Become a Guide <ArrowRight size={18} />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/cities">
                      Browse Other Cities
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {guides.map((guide: any) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          )}
        </section>

        {/* CTA Section (only show if guides exist) */}
        {guides.length > 0 && (
          <section className="bg-slate-900 rounded-3xl px-8 py-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif font-bold">
                Ready to Explore {typedCity.name}?
              </h2>
              <p className="text-lg text-slate-300 font-light">
                Book a verified local guide and discover the authentic LGBTQ+ experience in {typedCity.name}.
              </p>
              <div className="pt-4">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/auth/sign-up?role=traveler">
                    Sign Up to Book
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
