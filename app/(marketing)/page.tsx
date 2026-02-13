import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  Shield,
  Map,
  Users,
  ArrowRight,
  Search,
  CheckCircle,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CityCard } from '@/components/ui/CityCard';
import { GuideCard } from '@/components/cards/GuideCard';
import { HeroSearch } from '@/components/home/hero-search';
import { getCities, getTopGuides } from '@/lib/data-service';
import type { Guide } from '@/lib/mock-data';

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

// Adapter function to convert mock Guide to GuideCard format
function adaptGuideForCard(guide: Guide) {
  return {
    id: guide.id,
    slug: guide.slug,
    name: guide.name, // Added
    city_name: guide.city_name, // Added
    avatar_url: guide.avatar_url, // Direct map
    photo_url: guide.photo_url, // Direct map
    tagline: guide.tagline,
    rating: guide.rating,
    review_count: guide.review_count, // Added
    price_4h: guide.price_4h,
    experience_tags: guide.experience_tags,
    verified: true, // Mocked as true for top guides
    instant_book: false, // Default
  };
}

export default async function MarketingPage() {
  // Fetch all cities for search
  const allCities = await getCities();

  // Fetch featured cities (top 4 by guide count) - mock first
  const featuredCities = allCities
    .sort((a, b) => b.guide_count - a.guide_count)
    .slice(0, 4);

  // Fetch top guides from data service
  const topGuidesRaw = await getTopGuides(4);
  const topGuides = topGuidesRaw.map(adaptGuideForCard);

  return (
    <>
      {/* Hero Section - Light Background */}
      <section className="bg-background py-12 md:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Top: Text + Image Grid */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Column: Text Content */}
            <div className="space-y-6 lg:space-y-8">
              <div className="inline-flex items-center gap-2 text-brand text-sm font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                </span>
                Safe, inclusive, authentic
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-ink leading-[1.1] tracking-tight">
                Discover cities with
                <br />
                <span className="text-brand">LGBTQ+ local guides</span>
              </h1>

              <p className="text-base md:text-lg text-ink-soft max-w-[55ch] font-light leading-relaxed">
                Book verified guides who know every queer-friendly corner,
                hidden speakeasy, and community hotspot—so you can explore with
                confidence.
              </p>

              {/* Trusted By Section */}
              <div className="space-y-2 pt-2">
                <p className="text-sm text-ink-soft font-medium">
                  Trusted by travelers worldwide
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🇦🇷</span>
                  <span className="text-lg">🇲🇽</span>
                  <span className="text-lg">🇯🇵</span>
                  <span className="text-lg">🇱🇨</span>
                  <span className="text-xs text-ink-soft ml-1">
                    8+ verified guides across 56 cities
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image Card */}
            <div className="relative w-full max-w-xl mx-auto lg:mx-0 lg:ml-auto">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-editorial">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand/80 via-purple-500/70 to-pink-400/60" />

                {/* Hero Image */}
                <Image
                  src="/images/hero.png"
                  alt="Travel safely with Rainbow Tour Guides"
                  fill
                  className="object-cover mix-blend-overlay opacity-50"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />

                {/* Card Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-white/80 text-xs font-medium uppercase tracking-wider">
                      Safety first
                    </p>
                    <p className="text-white text-lg font-semibold">
                      Guides vetted by our community
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-white/90 text-sm">
                      Book now availability
                    </p>
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-white/40" />
                      <span className="w-2 h-2 rounded-full bg-white/40" />
                      <span className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Chips Row - Below Hero Grid */}
          <div className="flex flex-wrap justify-start gap-3 mt-10 lg:mt-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-warm border border-border text-ink/80 text-sm font-medium">
              <Shield className="h-4 w-4 text-brand" />
              Verified locals
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-warm border border-border text-ink/80 text-sm font-medium">
              <Map className="h-4 w-4 text-brand" />
              Queer-owned spots
            </div>
          </div>

          {/* Full-Width Search Card - Below Chips */}
          <div className="w-full mt-8 lg:mt-10">
            <HeroSearch cities={allCities} />
          </div>
        </div>
      </section>

      {/* Manifesto / Introduction */}
      <section className="py-20 md:py-28 bg-background relative">
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div
            className="opacity-0 animate-fade-in-up"
            style={{ animationDelay: '0.1s', animationFillMode: 'forwards' }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-ink mb-6 leading-tight">
              Not just a guide.
              <br />
              <span className="text-ink-soft/50">A friend in the city.</span>
            </h2>
            <div className="space-y-4 text-base md:text-lg font-light text-ink-soft leading-relaxed max-w-2xl">
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
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"
              alt="Queer travelers connecting in the city"
              width={400}
              height={320}
              className="rounded-2xl w-full h-80 object-cover mt-12 shadow-sm border border-black/5 hover:shadow-editorial transition-shadow"
            />
            <Image
              src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80"
              alt="Authentic travel moment"
              width={400}
              height={320}
              className="rounded-2xl w-full h-80 object-cover shadow-sm border border-black/5 hover:shadow-editorial transition-shadow"
            />
          </div>
        </div>
      </section>

      {/* Modern How It Works */}
      <section className="py-20 md:py-28 bg-surface-warm border-t border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                className="group relative p-8 bg-card rounded-2xl border border-border hover:bg-ink transition-all duration-500 shadow-warm-md hover:shadow-editorial hover:-translate-y-1"
              >
                <span className="text-6xl font-display font-bold text-border group-hover:text-ink/80 transition-colors absolute top-4 right-6 select-none">
                  {item.num}
                </span>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-brand rounded-2xl flex items-center justify-center text-white mb-8 shadow-warm-md group-hover:scale-110 transition-transform">
                    <item.icon size={28} />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-ink group-hover:text-white mb-4 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-ink-soft group-hover:text-ink-soft/50 leading-relaxed transition-colors">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Curated Destinations */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <span className="text-brand font-bold uppercase tracking-widest text-xs mb-3 block">
                Destinations
              </span>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-ink">
                Where next?
              </h2>
            </div>
            <Button asChild variant="ghost">
              <Link href="/cities" className="flex items-center gap-2">
                View all cities <ArrowRight size={20} />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCities.slice(0, 3).map((city) => (
              <CityCard key={city.id} city={city} />
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Top Guides */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-ink mb-3">
                Meet Our Top Guides
              </h2>
              <p className="text-base md:text-lg text-ink-soft font-light max-w-2xl">
                Verified locals who share authentic experiences and safe spaces
                in their cities.
              </p>
            </div>
            <Button asChild variant="ghost" className="mt-2 md:mt-0">
              <Link href="/guides" className="flex items-center gap-2">
                View all guides <ArrowRight size={18} />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {topGuides.map((guide) => (
              <div
                key={guide.id}
                className="group hover:-translate-y-1 transition-all duration-300"
              >
                <GuideCard guide={guide} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-28 bg-surface-warm">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface-warm shadow-sm border border-black/5">
              <Image
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80"
                alt="Two men connecting through travel"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Content */}
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-ink mb-3">
                  How It Works
                </h2>
                <p className="text-base md:text-lg text-ink-soft font-light">
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
                      <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center shadow-warm-md">
                        <step.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl font-display font-bold text-ink-soft/30">
                          {step.number}
                        </span>
                        <h3 className="text-xl font-display font-bold text-ink">
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-ink-soft leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                asChild
                size="lg"
                className="shadow-warm-md hover:shadow-editorial hover:-translate-y-0.5 transition-all rounded-full"
              >
                <Link href="/cities">Browse Cities</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why a Local LGBTQ+ Guide? */}
      <section className="py-20 md:py-28 bg-background">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-ink mb-3">
                  Why a Local LGBTQ+ Guide?
                </h2>
                <p className="text-base md:text-lg text-ink-soft font-light">
                  More than just sightseeing—it's about connection, safety, and
                  authentic experiences.
                </p>
              </div>

              {/* Benefits */}
              <div className="space-y-6">
                <div className="flex gap-4 p-5 bg-surface-warm rounded-2xl border border-border">
                  <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield size={24} className="text-brand" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-ink mb-1">
                      Safer First Impressions
                    </h4>
                    <p className="text-sm text-ink-soft leading-relaxed">
                      All guides are ID-verified, interviewed, and
                      background-checked. Know who you're meeting before you
                      arrive.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 bg-surface-warm rounded-2xl border border-border">
                  <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Map size={24} className="text-brand" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-ink mb-1">
                      Cultural Context
                    </h4>
                    <p className="text-sm text-ink-soft leading-relaxed">
                      Navigate queer-friendly spaces, local etiquette, and
                      LGBTQ+ rights with someone who knows the community
                      intimately.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-5 bg-surface-warm rounded-2xl border border-border">
                  <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users size={24} className="text-brand" />
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-ink mb-1">
                      Personal Fit
                    </h4>
                    <p className="text-sm text-ink-soft leading-relaxed">
                      Match with guides based on interests, pace, and vibe.
                      Whether you want nightlife or museums, find your perfect
                      companion.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="bordered" asChild>
                  <Link href="/legal/safety">Learn About Safety</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="hover:-translate-y-0.5 transition-all"
                >
                  <Link href="/legal/terms">Community Guidelines</Link>
                </Button>
              </div>
            </div>

            {/* Image */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface-warm shadow-warm-md border border-black/5 lg:order-last">
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

      {/* Final CTA */}
      <section className="relative py-20 md:py-24 bg-background overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-ink mb-6 leading-tight tracking-tight">
            YOUR CITY.
            <br />
            YOUR RULES.
          </h2>
          <p className="text-base md:text-xl text-ink-soft mb-10 max-w-2xl mx-auto font-light">
            Whether you want to explore history, architecture, or the
            underground scene, do it with someone who gets it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="shadow-warm-md hover:shadow-editorial hover:-translate-y-0.5 transition-all rounded-full"
            >
              <Link href="/cities">Start Exploring</Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="hover:-translate-y-0.5 transition-all"
            >
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
