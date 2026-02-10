import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  Sparkles,
  CheckCircle,
  Clock,
  Star,
  Users,
  DollarSign,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'How It Works - Rainbow Tour Guides',
  description:
    'Learn how to book authentic LGBTQ+ tours with local guides or become a guide yourself.',
};

const TRAVELER_STEPS: {
  step: string;
  title: string;
  description: string;
  bullets: string[];
  imageSrc: string;
  imageBadge: string;
  imageCopy: string;
}[] = [
  {
    step: '1',
    title: 'Find Your Guide',
    description:
      'Browse verified LGBTQ+ guides by city or country. Filter by language, interests, and tour themes to find your best fit.',
    bullets: [
      'Search by destination',
      'Filter by languages and interests',
      'Read verified reviews',
    ],
    imageSrc: '/images/how-it-works/step-find.png',
    imageBadge: 'Match by vibe',
    imageCopy: 'Choose guides by language, interests, and style before you book.',
  },
  {
    step: '2',
    title: 'Book Safely',
    description:
      'Send your booking request, confirm details directly with your guide, and pay securely through the platform.',
    bullets: [
      'Secure payment processing',
      'Flexible cancellation policy',
      'Direct messaging with your guide',
    ],
    imageSrc: '/images/how-it-works/step-book.png',
    imageBadge: 'Book securely',
    imageCopy: 'Pay safely on-platform and coordinate every detail directly.',
  },
  {
    step: '3',
    title: 'Explore Together',
    description:
      'Meet your local guide and experience the city through an LGBTQ+ lens with insider recommendations and community-safe spots.',
    bullets: [
      'Personalized local experiences',
      'Insider LGBTQ+ community access',
      'Share your experience',
    ],
    imageSrc: '/images/how-it-works/step-explore.png',
    imageBadge: 'Travel confidently',
    imageCopy: 'Enjoy curated queer-friendly spots and authentic local moments.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 pt-20 pb-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-32 top-12 h-80 w-80 rounded-full bg-brand/15 blur-3xl" />
          <div className="absolute right-6 top-20 h-72 w-72 rounded-full bg-amber-200/35 blur-3xl" />
          <div className="absolute left-1/2 bottom-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-200/35 blur-3xl" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03]" />
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-7">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-1.5 text-sm font-semibold text-brand shadow-sm">
                <Sparkles className="h-4 w-4" />
                Safe, inclusive, premium experiences
              </div>

              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-ink">
                  How Rainbow Tour Guides Works
                </h1>
                <p className="text-lg md:text-xl text-ink-soft max-w-2xl leading-relaxed">
                  Book trusted LGBTQ+ local guides in three simple steps and
                  explore every destination with confidence.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                  <Shield className="h-4 w-4 text-brand" />
                  <span className="text-sm font-semibold text-ink">
                    Verified guides
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                  <Users className="h-4 w-4 text-brand" />
                  <span className="text-sm font-semibold text-ink">
                    LGBTQ+ community focus
                  </span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative isolate overflow-hidden rounded-[30px] border border-slate-200 shadow-2xl aspect-[5/4]">
                <Image
                  src="/images/how-it-works/how-it-works-hero.png"
                  alt="Community hero"
                  fill
                  className="object-cover object-center -z-10"
                  priority
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-slate-900/10 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md">
                  <p className="text-xs uppercase tracking-[0.12em] text-white/80 mb-1">
                    Built for confidence
                  </p>
                  <p className="text-sm font-semibold text-white">
                    Verified guides, secure payments, and direct communication.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="container mx-auto px-4 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <p className="text-sm uppercase tracking-[0.18em] text-brand font-semibold">
              Three Steps
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight">
              A Safer Way to Explore
            </h2>
            <p className="text-lg text-ink-soft">
              From discovery to checkout to your day on the ground, everything
              is designed to feel effortless.
            </p>
          </div>

          <div className="space-y-8 sm:space-y-10">
            {TRAVELER_STEPS.map((step, index) => {
              const isImageFirst = index % 2 === 0;

              return (
                <Card
                  key={step.title}
                  className="overflow-hidden border border-slate-200 bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.65)]"
                >
                  <div className="grid lg:grid-cols-2 lg:items-stretch">
                    <div
                      className={`relative min-h-[260px] sm:min-h-[320px] ${
                        isImageFirst ? 'lg:order-1' : 'lg:order-2'
                      }`}
                    >
                      <Image
                        src={step.imageSrc}
                        alt={`${step.title} illustration`}
                        fill
                        className="object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 via-slate-900/10 to-transparent" />
                      <div className="absolute left-5 top-5 inline-flex items-center rounded-full border border-white/35 bg-slate-900/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
                        Step {step.step}
                      </div>
                      <div className="absolute left-5 right-5 bottom-5 rounded-2xl border border-white/30 bg-slate-900/35 p-4 backdrop-blur-md">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80">
                          {step.imageBadge}
                        </p>
                        <p className="mt-1 text-sm font-semibold leading-snug text-white sm:text-base">
                          {step.imageCopy}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`p-6 sm:p-8 lg:p-10 ${
                        isImageFirst ? 'lg:order-2' : 'lg:order-1'
                      }`}
                    >
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-brand/80">
                        Step {step.step}
                      </p>
                      <h3 className="mt-2 text-3xl sm:text-4xl font-black text-ink tracking-tight">
                        {step.title}
                      </h3>
                      <p className="mt-4 text-base sm:text-lg text-ink-soft leading-relaxed">
                        {step.description}
                      </p>
                      <ul className="mt-6 space-y-2.5 text-sm sm:text-base text-ink-soft">
                        {step.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2.5">
                            <CheckCircle className="w-5 h-5 text-brand mt-0.5 flex-shrink-0" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* For Guides Section */}
      <section className="bg-gradient-to-br from-lavender/10 via-mint/10 to-transparent py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-ink mb-4">
                Become a Guide
              </h2>
              <p className="text-xl text-ink-soft max-w-2xl mx-auto">
                Share your city with LGBTQ+ travelers and earn income doing what
                you love
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {/* How to Become a Guide */}
              <Card className="p-8 bg-white">
                <h3 className="text-2xl font-bold text-ink mb-6">
                  How to Get Started
                </h3>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-brand/10 text-brand rounded-full flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">
                        Create Your Profile
                      </h4>
                      <p className="text-sm text-ink-soft">
                        Sign up and share your local expertise, languages, and
                        tour themes
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-brand/10 text-brand rounded-full flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">
                        Get Verified
                      </h4>
                      <p className="text-sm text-ink-soft">
                        Our team reviews your application and verifies your
                        credentials
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-brand/10 text-brand rounded-full flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-ink mb-1">
                        Start Guiding
                      </h4>
                      <p className="text-sm text-ink-soft">
                        Receive booking requests and begin sharing your city
                      </p>
                    </div>
                  </li>
                </ol>
              </Card>

              {/* Benefits */}
              <Card className="p-8 bg-white">
                <h3 className="text-2xl font-bold text-ink mb-6">
                  Guide Benefits
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <DollarSign className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-ink mb-1">
                        Flexible Income
                      </h4>
                      <p className="text-sm text-ink-soft">
                        Set your own rates and schedule. Earn on your terms
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Globe className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-ink mb-1">
                        Global Platform
                      </h4>
                      <p className="text-sm text-ink-soft">
                        Connect with travelers from around the world
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Users className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-ink mb-1">
                        Community Impact
                      </h4>
                      <p className="text-sm text-ink-soft">
                        Support LGBTQ+ travelers and promote your local
                        community
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <Shield className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-ink mb-1">
                        Protected Payments
                      </h4>
                      <p className="text-sm text-ink-soft">
                        Secure transactions with guaranteed payouts
                      </p>
                    </div>
                  </li>
                </ul>
              </Card>
            </div>

            {/* CTA */}
            <div className="text-center">
              <Link href="/auth/sign-up?role=guide">
                <Button
                  size="lg"
                  className="bg-brand hover:bg-brand-dark text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  Become a Guide
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-ink mb-4">Safety & Trust</h2>
            <p className="text-xl text-ink-soft max-w-2xl mx-auto">
              Your safety and security are our top priorities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Verification */}
            <Card className="p-8 bg-white text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-brand" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-4">
                Verified Guides
              </h3>
              <p className="text-ink-soft leading-relaxed">
                Every guide is vetted through identity verification, background
                checks, and credential review before joining our platform.
              </p>
            </Card>

            {/* Support */}
            <Card className="p-8 bg-white text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-brand" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-4">24/7 Support</h3>
              <p className="text-ink-soft leading-relaxed">
                Our support team is available around the clock to assist with
                any issues before, during, or after your tour.
              </p>
            </Card>

            {/* Reviews */}
            <Card className="p-8 bg-white text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-8 h-8 text-brand" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-4">
                Verified Reviews
              </h3>
              <p className="text-ink-soft leading-relaxed">
                All reviews come from confirmed bookings, ensuring authentic
                feedback from real travelers to help you choose with confidence.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of travelers discovering authentic LGBTQ+ experiences
            worldwide
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/guides">
              <Button
                size="lg"
                variant="bordered"
                className="bg-white text-brand hover:bg-gray-50 px-8 py-6 text-lg rounded-full border-2 border-white"
              >
                Browse Guides
              </Button>
            </Link>
            <Link href="/cities">
              <Button
                size="lg"
                variant="bordered"
                className="bg-transparent text-white hover:bg-white/10 px-8 py-6 text-lg rounded-full border-2 border-white"
              >
                Explore Cities
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
