import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Shield, Map, Users, ArrowRight, Search, CheckCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { CityCard } from '@/components/ui/CityCard';
import { GuideCard } from '@/components/ui/GuideCard';
import { HeroSearch } from '@/components/home/hero-search';
import { getCities, getTopGuides } from '@/lib/data-service';

export const metadata: Metadata = {
  title: 'Rainbow Tour Guides - Premium LGBTQ+ Travel Experiences',
  description:
    'Connect with verified local LGBTQ+ guides for safe, authentic travel experiences. Curated destinations, vetted guides, and 24/7 traveler support.',
  openGraph: {
    title: 'Rainbow Tour Guides - Premium LGBTQ+ Travel Experiences',
    description:
      'Connect with verified local LGBTQ+ guides for safe, authentic travel experiences.',
    type: 'website',
  },
};

export default async function MarketingPage() {
  const supabase = await createSupabaseServerClient();

  // Fetch all cities for search
  const allCities = await getCities();

  // Fetch featured cities
  const { data: cities } = await supabase
    .from('cities')
    .select('*, guides:guides(count)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .limit(4);

  const citiesWithCounts = (cities ?? []).map((city: any) => ({
    ...city,
    guide_count: city.guides?.[0]?.count ?? 0,
  }));

  // Fetch top guides from data service
  const topGuides = await getTopGuides(4);

  return (
    <>
      {/* Avant-Garde Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-end items-center px-4 pb-12 overflow-hidden">
        {/* Cinematic Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2574&auto=format&fit=crop"
            alt="LGBTQ+ Travel Connection"
            fill
            className="object-cover object-center animate-scale-slow"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
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

            <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-serif font-bold text-white leading-[0.88] tracking-tighter mb-8 animate-fade-in-up">
              TRAVEL SOLO.
              <br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
                NEVER ALONE.
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-white/90 max-w-lg font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Curated local companions for gay men who value authentic
              connection, safety, and culture over crowds.
            </p>
          </div>

          {/* Hero Search Bar */}
          <div className="pt-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <HeroSearch cities={allCities} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button asChild size="lg" className="shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
              <Link href="/cities">Start Exploring</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white/40 hover:bg-white/20 backdrop-blur-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <Link href="/auth/sign-up?role=guide">Become a Guide</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Manifesto / Introduction */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}>
            <h2 className="text-5xl md:text-6xl font-serif font-bold text-slate-900 mb-8 leading-tight">
              Not just a guide.
              <br />
              <span className="text-slate-300">A friend in the city.</span>
            </h2>
            <div className="space-y-6 text-lg font-light text-slate-600 leading-relaxed">
              <p>
                We believe travel is about who you meet, not just what you see.
                Traditional tours feel transactional. Dating apps feel risky. We
                built the middle ground.
              </p>
              <p>
                Our guides are "Cultural Curators"—locals who share your
                community, know the hidden history, and create a safe space for
                you to be your authentic self.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Image
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1000&auto=format&fit=crop"
              alt="Men talking in city"
              width={400}
              height={320}
              className="rounded-2xl w-full h-80 object-cover mt-12 shadow-lg border border-black/5 hover:shadow-xl transition-shadow"
            />
            <Image
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop"
              alt="Authentic moment"
              width={400}
              height={320}
              className="rounded-2xl w-full h-80 object-cover shadow-lg border border-black/5 hover:shadow-xl transition-shadow"
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
                num: '01',
                icon: Map,
                title: 'Curated Cities',
                desc: 'We only launch in destinations with thriving, safe LGBTQ+ communities.',
              },
              {
                num: '02',
                icon: Users,
                title: 'Vetted Locals',
                desc: 'Every guide is ID-verified and interviewed. No randoms. No ambiguity.',
              },
              {
                num: '03',
                icon: Shield,
                title: 'Total Safety',
                desc: 'Secure payments, support, and a code of conduct that protects you.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group relative p-8 bg-white rounded-2xl border border-slate-100 hover:bg-slate-900 transition-all duration-500 shadow-md hover:shadow-2xl hover:-translate-y-1"
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

      {/* Meet Our Top Guides */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
                Meet Our Top Guides
              </h2>
              <p className="text-lg text-slate-500 font-light max-w-2xl">
                Verified locals who share authentic experiences and safe
                spaces in their cities.
              </p>
            </div>
            <Button asChild variant="ghost" className="mt-2 md:mt-0">
              <Link href="/guides" className="flex items-center gap-2">
                View all guides <ArrowRight size={18} />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {topGuides.map((guide) => (
              <div
                key={guide.id}
                className="group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl"
              >
                <GuideCard guide={guide as any} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 shadow-lg border border-black/5">
              <Image
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800"
                alt="How it works"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Content */}
            <div className="space-y-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
                  How It Works
                </h2>
                <p className="text-lg text-slate-500 font-light">
                  Three simple steps to authentic local experiences
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-8">
                {[
                  {
                    number: '01',
                    icon: Search,
                    title: 'Find Your Guide',
                    description:
                      'Browse verified LGBTQ+ guides in your destination. Filter by interests, languages, and availability.',
                  },
                  {
                    number: '02',
                    icon: CheckCircle,
                    title: 'Request Your Experience',
                    description:
                      'Send a booking request with your preferences. Your guide will confirm and personalize the itinerary.',
                  },
                  {
                    number: '03',
                    icon: Heart,
                    title: 'Explore Together',
                    description:
                      'Meet your guide and discover hidden gems, safe spaces, and authentic culture together.',
                  },
                ].map((step) => (
                  <div key={step.number} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center shadow-md">
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl font-serif font-bold text-slate-200">
                          {step.number}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button asChild size="lg" className="shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                <Link href="/cities">Browse Cities</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why a Local LGBTQ+ Guide? */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4">
                  Why a Local LGBTQ+ Guide?
                </h2>
                <p className="text-lg text-slate-500 font-light">
                  More than just sightseeing—it's about connection, safety, and
                  authentic experiences.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-6">
                <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield size={24} className="text-brand" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Safer First Impressions
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      All guides are ID-verified, interviewed, and background-checked.
                      Know who you're meeting before you arrive.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Map size={24} className="text-brand" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Cultural Context
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Navigate queer-friendly spaces, local etiquette, and LGBTQ+
                      rights with someone who knows the community intimately.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users size={24} className="text-brand" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-1">
                      Personal Fit
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Match with guides based on interests, pace, and vibe. Whether
                      you want nightlife or museums, find your perfect companion.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button asChild variant="outline" className="hover:-translate-y-0.5 transition-all">
                  <Link href="/legal/safety">Learn About Safety</Link>
                </Button>
                <Button asChild variant="ghost" className="hover:-translate-y-0.5 transition-all">
                  <Link href="/legal/terms">Community Guidelines</Link>
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200 shadow-lg border border-black/5 lg:order-last">
              <Image
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800"
                alt="Why a local LGBTQ+ guide"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Avant-Garde CTA */}
      <section className="relative py-40 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-8xl font-serif font-bold text-slate-900 mb-10 leading-[0.85] tracking-tight">
            YOUR CITY.
            <br />
            YOUR RULES.
          </h2>
          <p className="text-xl md:text-2xl text-slate-500 mb-16 max-w-2xl mx-auto font-light">
            Whether you want to explore history, architecture, or the
            underground scene, do it with someone who gets it.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
              <Link href="/cities">Start Exploring</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="hover:-translate-y-0.5 transition-all">
              <Link
                href="/auth/sign-up?role=guide"
                className="flex items-center gap-2"
              >
                Become a Guide <ArrowRight size={20} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
