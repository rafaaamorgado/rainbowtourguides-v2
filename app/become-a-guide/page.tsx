import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Sparkles,
  Shield,
  Wallet,
  Zap,
  CheckCircle2,
  Headset,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    title: 'Make a Difference',
    description:
      'Welcome LGBTQ+ travelers with safe, authentic, inclusive experiences in your city.',
    icon: Heart,
  },
  {
    title: 'Flexible Schedule',
    description:
      'Set your own hours and prices. You’re in control of availability and pace.',
    icon: Zap,
  },
  {
    title: 'Earn Money',
    description:
      'Keep ~80% after platform fees while sharing the places and stories you love.',
    icon: Wallet,
  },
];

const steps = [
  {
    title: 'Create Profile',
    description: 'Tell us about you and your city.',
    number: '01',
  },
  {
    title: 'Get Verified',
    description: 'We review your profile for safety and quality.',
    number: '02',
  },
  {
    title: 'Set Your Rates',
    description: 'Choose pricing and availability that works for you.',
    number: '03',
  },
  {
    title: 'Start Guiding',
    description: 'Accept requests and welcome travelers.',
    number: '04',
  },
];

const checklistLeft = [
  'Local Expertise',
  'Flexible Availability',
  'Commitment to Safety',
];

const checklistRight = [
  'Passion for Hospitality',
  'Good Communication',
  'Valid ID',
];

const safetyCards = [
  {
    title: 'Verified Travelers Only',
    description:
      'We’re rolling out traveler verification so you know who you’re meeting before every tour.',
    icon: Shield,
  },
  {
    title: '24/7 Support',
    description:
      'We’re building dedicated support coverage during launch—so you have help when you need it.',
    icon: Headset,
  },
];

export const metadata = {
  title: 'Become a Guide | Rainbow Tour Guides',
  description:
    'Share your city with LGBTQ+ travelers from around the world. Earn money and make meaningful connections.',
};

export default function BecomeAGuidePage() {
  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Hero */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 border border-slate-200 text-sm font-semibold text-brand">
              <Sparkles className="h-4 w-4" />
              Become a Guide
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-display font-bold text-ink leading-tight">
                Become a Guide
              </h1>
              <p className="text-lg text-ink-soft leading-relaxed">
                Share your city with LGBTQ+ travelers from around the world.
                Build meaningful connections while earning money doing what you
                love.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="h-12 px-6 rounded-full">
                <Link href="/guide/onboarding">Get Started</Link>
              </Button>
              <Button
                size="lg"
                variant="bordered"
                asChild
                className="h-12 px-6 rounded-full"
              >
                <Link href="/guides">Browse Guides</Link>
              </Button>
            </div>
          </div>

          <div className="relative w-full overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/5 aspect-[16/10]">
            <Image
              src="/images/guide-hero.png"
              alt="Rainbow Tour Guides — Become a Guide"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </div>
        </section>

        {/* Why Guide with Us */}
        <section className="space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-display font-bold text-ink">Why Guide with Us?</h2>
            <p className="text-ink-soft">
              Safe, inclusive, and built for the community.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-none hover:shadow-warm-md transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-display font-semibold text-ink">
                  {feature.title}
                </h3>
                <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-bold text-ink">How It Works</h2>
            <p className="text-ink-soft">
              From profile to first tour in four simple steps.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {steps.map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-none flex flex-col gap-3"
              >
                <div className="text-brand text-xl font-semibold">
                  {step.number}
                </div>
                <h3 className="text-lg font-display font-semibold text-ink">{step.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* What You'll Need */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-bold text-ink">What You'll Need</h2>
            <p className="text-ink-soft">
              A few essentials to offer safe, memorable experiences.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-none">
              {checklistLeft.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <p className="text-sm text-ink">{item}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3 rounded-2xl border border-border bg-card p-6 shadow-none">
              {checklistRight.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <p className="text-sm text-ink">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Safety & Support */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-display font-bold text-ink">Safety & Support</h2>
            <p className="text-ink-soft">
              We’re building features to keep you and travelers comfortable
              every step of the way.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-none flex gap-4"
              >
                <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                  <card.icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-semibold text-ink">
                    {card.title}
                  </h3>
                  <p className="text-sm text-ink-soft leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center space-y-4 rounded-3xl border border-border bg-card p-10 shadow-editorial">
          <h2 className="text-3xl font-display font-bold text-ink">
            Ready to Start Guiding?
          </h2>
          <p className="text-ink-soft max-w-2xl mx-auto">
            Join our community of passionate local guides and start sharing your
            city today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="h-12 px-6">
              <Link href="/guide/onboarding">Sign Up Now</Link>
            </Button>
            <Button size="lg" variant="bordered" asChild className="h-12 px-6">
              <Link href="/faq">Check FAQ</Link>
            </Button>
          </div>
          <p className="text-sm text-ink-soft">
            Have questions? Check out our FAQ or contact us.
          </p>
        </section>
      </main>
    </div>
  );
}
