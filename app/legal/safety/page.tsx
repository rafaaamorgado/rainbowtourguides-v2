import Link from "next/link";
import { Shield, AlertTriangle, Phone, MapPin, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <Shield className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink">
                Safety Guidelines
              </h1>
              <p className="text-ink-soft mt-1">Your safety is our priority</p>
            </div>
          </div>
          <p className="text-ink-soft text-sm">Last updated: January 12, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg prose-slate max-w-none space-y-12">
          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              Our LGBTQ+ Safety Commitment
            </h2>
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-xl">
              <p className="text-emerald-900 leading-relaxed">
                <strong>We Promise:</strong> Every guide is ID-verified,
                interviewed, and committed to creating safe, inclusive
                experiences for LGBTQ+ travelers. We maintain zero tolerance for
                discrimination, harassment, or unsafe behavior.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              For Travelers
            </h2>

            <h3 className="text-2xl font-semibold text-ink mb-4">
              Before Your Tour
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <Shield className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">Verify Guide Identity:</strong>{" "}
                  Check the verified badge and review their profile thoroughly
                </span>
              </li>
              <li className="flex gap-3">
                <Shield className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">Read Reviews:</strong> See what
                  other travelers have experienced
                </span>
              </li>
              <li className="flex gap-3">
                <Shield className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">Share Your Itinerary:</strong>{" "}
                  Tell friends or family where you're going and with whom
                </span>
              </li>
              <li className="flex gap-3">
                <Shield className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">Communicate Through Platform:</strong>{" "}
                  Keep initial conversations on-platform for safety
                </span>
              </li>
            </ul>

            <h3 className="text-2xl font-semibold text-ink mb-4 mt-8">
              During Your Tour
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">Meet in Public:</strong> Always
                  start tours at public locations like cafés or landmarks
                </span>
              </li>
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">Trust Your Instincts:</strong> If
                  something feels off, end the tour immediately
                </span>
              </li>
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">Stay Connected:</strong> Keep your
                  phone charged and share your location with trusted contacts
                </span>
              </li>
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">Set Boundaries:</strong> Clearly
                  communicate your comfort levels and expectations
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">For Guides</h2>

            <h3 className="text-2xl font-semibold text-ink mb-4">
              Professional Standards
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <Shield className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">
                    Maintain Professional Boundaries:
                  </strong>{" "}
                  Keep all interactions respectful and appropriate
                </span>
              </li>
              <li className="flex gap-3">
                <Shield className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">Know Local Laws:</strong> Stay
                  informed about regulations and licensing requirements
                </span>
              </li>
              <li className="flex gap-3">
                <Shield className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">Be Transparent:</strong> Clearly
                  communicate tour details, pricing, and limitations
                </span>
              </li>
              <li className="flex gap-3">
                <Shield className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">Respect Privacy:</strong> Never
                  share traveler information or photos without consent
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              Platform Safety Features
            </h2>
            <ul className="space-y-3">
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">ID Verification:</strong> All guides
                submit government-issued ID for admin review
              </li>
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Video Interviews:</strong> Guides
                complete video interviews with our team
              </li>
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Review System:</strong> Transparent
                ratings and reviews from verified bookings
              </li>
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Secure Messaging:</strong> In-app
                communication for initial contact
              </li>
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">24/7 Support:</strong> Report issues
                anytime for immediate response
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              Prohibited Activities
            </h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
              <p className="text-red-900 font-semibold mb-3">
                Strictly Prohibited:
              </p>
              <ul className="space-y-2 text-red-900">
                <li>Escorting or sexual services of any kind</li>
                <li>Any illegal activities</li>
                <li>Harassment, discrimination, or hate speech</li>
                <li>Sharing false information or misrepresenting services</li>
                <li>Circumventing platform fees or payment systems</li>
              </ul>
              <p className="text-red-900 mt-4 leading-relaxed">
                Violations result in immediate account termination and potential
                legal action.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              Emergency Contacts
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-brand mt-1" />
                <div>
                  <p className="font-semibold text-ink mb-1">
                    In Case of Emergency
                  </p>
                  <ul className="text-sm text-ink-soft space-y-1">
                    <li>Contact local emergency services (911 US, 112 EU)</li>
                    <li>Report incidents to Rainbow Tour Guides immediately</li>
                    <li>Contact your embassy or consulate if traveling abroad</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-brand mt-1" />
                <div>
                  <p className="font-semibold text-ink mb-1">
                    Report Safety Concerns
                  </p>
                  <p className="text-sm text-ink-soft">
                    Email:{" "}
                    <a
                      href="mailto:safety@rainbowtourguides.com"
                      className="text-brand hover:underline"
                    >
                      safety@rainbowtourguides.com
                    </a>
                  </p>
                  <p className="text-sm text-ink-soft">
                    We review all reports within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              LGBTQ+ Specific Safety
            </h2>
            <p className="text-ink-soft leading-relaxed mb-4">
              Additional considerations for LGBTQ+ travelers:
            </p>
            <ul className="space-y-2">
              <li className="text-ink-soft leading-relaxed">
                Research local laws and cultural attitudes toward LGBTQ+ people
              </li>
              <li className="text-ink-soft leading-relaxed">
                Ask your guide about safe spaces and neighborhoods
              </li>
              <li className="text-ink-soft leading-relaxed">
                Be aware of local customs regarding public displays of affection
              </li>
              <li className="text-ink-soft leading-relaxed">
                Know emergency contacts for LGBTQ+ organizations in your
                destination
              </li>
              <li className="text-ink-soft leading-relaxed">
                Trust your guide's local knowledge about safe times and places
              </li>
            </ul>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/legal/terms" className="text-brand hover:underline">
              Terms of Service
            </Link>
            <Link href="/legal/privacy" className="text-brand hover:underline">
              Privacy Policy
            </Link>
            <Link href="/" className="text-ink-soft hover:text-ink">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
