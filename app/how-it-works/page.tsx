import { Metadata } from 'next';
import Link from 'next/link';
import {
  Search,
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

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-lavender via-mint/30 to-canvas pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-ink mb-6">
              How Rainbow Tour Guides Works
            </h1>
            <p className="text-xl text-ink-soft max-w-2xl mx-auto">
              Connect with verified LGBTQ+ local guides for authentic
              experiences around the world
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <Card className="relative p-8 bg-white border-2 border-border hover:border-brand transition-all duration-300 hover:shadow-xl group">
              <div className="absolute -top-6 left-8 bg-brand text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                1
              </div>
              <div className="mt-4 mb-6">
                <div className="w-16 h-16 bg-lavender/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Search className="w-8 h-8 text-brand" />
                </div>
                <h3 className="text-2xl font-bold text-ink mb-4">
                  Find Your Guide
                </h3>
                <p className="text-ink-soft leading-relaxed">
                  Browse verified LGBTQ+ guides by city or country. Filter by
                  language, interests, and tour themes. Read reviews from other
                  travelers to find the perfect match for your journey.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-ink-soft">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>Search by destination</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>Filter by languages and interests</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>Read verified reviews</span>
                </li>
              </ul>
            </Card>

            {/* Step 2 */}
            <Card className="relative p-8 bg-white border-2 border-border hover:border-brand transition-all duration-300 hover:shadow-xl group">
              <div className="absolute -top-6 left-8 bg-brand text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                2
              </div>
              <div className="mt-4 mb-6">
                <div className="w-16 h-16 bg-mint/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="w-8 h-8 text-brand" />
                </div>
                <h3 className="text-2xl font-bold text-ink mb-4">
                  Book Safely
                </h3>
                <p className="text-ink-soft leading-relaxed">
                  Submit a booking request with your preferred dates and
                  details. Your guide confirms availability and you complete
                  payment securely through our platform. Your funds are
                  protected until the tour is completed.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-ink-soft">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>Secure payment processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>Flexible cancellation policy</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>Direct messaging with your guide</span>
                </li>
              </ul>
            </Card>

            {/* Step 3 */}
            <Card className="relative p-8 bg-white border-2 border-border hover:border-brand transition-all duration-300 hover:shadow-xl group">
              <div className="absolute -top-6 left-8 bg-brand text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                3
              </div>
              <div className="mt-4 mb-6">
                <div className="w-16 h-16 bg-lavender/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-8 h-8 text-brand" />
                </div>
                <h3 className="text-2xl font-bold text-ink mb-4">
                  Explore Together
                </h3>
                <p className="text-ink-soft leading-relaxed">
                  Meet your guide and discover the city through a local LGBTQ+
                  lens. Enjoy personalized experiences, insider tips, and
                  authentic connections. Leave a review to help future
                  travelers.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-ink-soft">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>Personalized local experiences</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>Insider LGBTQ+ community access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-brand mt-0.5 flex-shrink-0" />
                  <span>Share your experience</span>
                </li>
              </ul>
            </Card>
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
