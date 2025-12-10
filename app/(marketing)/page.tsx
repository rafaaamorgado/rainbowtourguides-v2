import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Shield, Map, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { CityCard } from "@/components/ui/CityCard";
import { GuideCard } from "@/components/ui/GuideCard";

export const metadata: Metadata = {
  title: "Rainbow Tour Guides - Premium LGBTQ+ Travel Experiences",
  description: "Connect with verified local LGBTQ+ guides for safe, authentic travel experiences. Curated destinations, vetted guides, and 24/7 traveler support.",
  openGraph: {
    title: "Rainbow Tour Guides - Premium LGBTQ+ Travel Experiences",
    description: "Connect with verified local LGBTQ+ guides for safe, authentic travel experiences.",
    type: "website",
  },
};

export default async function MarketingPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch featured cities
  const { data: cities } = await supabase
    .from("cities")
    .select("*, guides:guides(count)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(4);

  const citiesWithCounts = (cities ?? []).map((city: any) => ({
    ...city,
    guide_count: city.guides?.[0]?.count ?? 0,
  }));

  // Fetch featured guides
  const { data: guidesData } = await supabase
    .from("guides")
    .select("*, profile:profiles(display_name, avatar_url)")
    .eq("status", "approved")
    .limit(3);

  const guides = (guidesData ?? []) as any[];

  return (
    <>
      {/* Avant-Garde Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-end items-center px-4 pb-12 overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1519671482538-581b5db3acc6?q=80&w=2574&auto=format&fit=crop"
            alt="Authentic Connection"
            fill
            className="object-cover object-center animate-scale-slow"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto space-y-12 animate-fade-in-up">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              <span className="text-white text-xs font-bold uppercase tracking-[0.2em]">
                The New Standard in Queer Travel
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-bold text-white leading-[0.9] tracking-tight mb-8">
              TRAVEL SOLO.
              <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
                NEVER ALONE.
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-white/80 max-w-xl font-light leading-relaxed">
              Curated local companions for gay men who value authentic connection, safety, and
              culture over crowds.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <Button asChild size="lg">
              <Link href="/cities">Start Exploring</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
              <Link href="/auth/sign-up?role=guide">Become a Guide</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Manifesto / Introduction */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              Not just a guide.
              <br />
              <span className="text-slate-300">A friend in the city.</span>
            </h2>
            <div className="space-y-6 text-lg font-light text-slate-600 leading-relaxed">
              <p>
                We believe travel is about who you meet, not just what you see. Traditional tours
                feel transactional. Dating apps feel risky. We built the middle ground.
              </p>
              <p>
                Our guides are "Cultural Curators"—locals who share your community, know the hidden
                history, and create a safe space for you to be your authentic self.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="https://images.unsplash.com/photo-1535497258079-22a8323630f9?q=80&w=1000&auto=format&fit=crop"
              alt="Men talking in city"
              width={400}
              height={320}
              className="rounded-3xl w-full h-80 object-cover mt-12"
            />
            <Image
              src="https://images.unsplash.com/photo-1523588289457-36c1ae360707?q=80&w=1000&auto=format&fit=crop"
              alt="Authentic moment"
              width={400}
              height={320}
              className="rounded-3xl w-full h-80 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Modern How It Works */}
      <section className="py-32 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                num: "01",
                icon: Map,
                title: "Curated Cities",
                desc: "We only launch in destinations with thriving, safe LGBTQ+ communities.",
              },
              {
                num: "02",
                icon: Users,
                title: "Vetted Locals",
                desc: "Every guide is ID-verified and interviewed. No randoms. No ambiguity.",
              },
              {
                num: "03",
                icon: Shield,
                title: "Total Safety",
                desc: "Secure payments, support, and a code of conduct that protects you.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative p-8 bg-white rounded-3xl hover:bg-slate-900 transition-colors duration-500 shadow-sm hover:shadow-2xl"
              >
                <span className="text-6xl font-serif font-bold text-slate-100 group-hover:text-slate-800 transition-colors absolute top-4 right-6 select-none">
                  {item.num}
                </span>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center text-white mb-8 shadow-lg group-hover:scale-110 transition-transform">
                    <item.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-4 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 group-hover:text-slate-400 leading-relaxed transition-colors">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Destinations */}
      {citiesWithCounts.length > 0 && (
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
              <div>
                <span className="text-brand font-bold uppercase tracking-widest text-xs mb-4 block">
                  Destinations
                </span>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900">
                  Where next?
                </h2>
              </div>
              <Button asChild variant="ghost">
                <Link href="/cities" className="flex items-center gap-2">
                  View all cities <ArrowRight size={20} />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {citiesWithCounts.map((city) => (
                <CityCard key={city.id} city={city} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Guides */}
      {guides && guides.length > 0 && (
        <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
          {/* Abstract Background */}
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-brand rounded-full blur-[120px] opacity-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start mb-20">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-serif font-bold mb-6">
                  Meet the Insiders
                </h2>
                <p className="text-xl text-slate-400 font-light">
                  Skip the tourist traps. Our guides unlock the city&apos;s authentic pulse.
                </p>
              </div>
              <Button asChild variant="secondary" size="lg" className="mt-8 md:mt-0">
                <Link href="/cities">Browse All Guides</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {guides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-white rounded-3xl p-2 transform hover:-translate-y-2 transition-transform duration-500"
                >
                  <GuideCard guide={guide} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Avant-Garde CTA */}
      <section className="relative py-40 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-8xl font-serif font-bold text-slate-900 mb-10 leading-[0.85] tracking-tight">
            YOUR CITY.
            <br />
            YOUR RULES.
          </h2>
          <p className="text-xl md:text-2xl text-slate-500 mb-16 max-w-2xl mx-auto font-light">
            Whether you want to explore history, architecture, or the underground scene, do it with
            someone who gets it.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button asChild size="lg">
              <Link href="/cities">Start Exploring</Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href="/auth/sign-up?role=guide" className="flex items-center gap-2">
                Become a Guide <ArrowRight size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
