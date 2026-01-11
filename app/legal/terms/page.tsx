import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
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
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink mb-3">
            Terms of Service
          </h1>
          <p className="text-ink-soft">Last updated: January 12, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg prose-slate max-w-none space-y-12">
          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              1. Marketplace Platform
            </h2>
            <p className="text-ink-soft leading-relaxed">
              Rainbow Tour Guides is a marketplace platform that connects
              travelers with verified local LGBTQ+ guides. We are not a travel
              agency, tour operator, or booking service. We facilitate
              connections between users, but all agreements, transactions, and
              services are directly between travelers and guides.
            </p>
            <p className="text-ink-soft leading-relaxed">
              Rainbow Tour Guides is not a party to any booking or service
              agreement and is not responsible for the actions of guides or
              travelers.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              2. LGBTQ+ Community Commitment
            </h2>
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-6 rounded-r-xl">
              <p className="text-emerald-900 leading-relaxed">
                <strong>Our Mission:</strong> Rainbow Tour Guides is dedicated
                to creating safe, inclusive travel experiences for the LGBTQ+
                community. All guides commit to our Code of Conduct, which
                includes respect, inclusivity, and zero tolerance for
                discrimination.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              3. Guide Verification Process
            </h2>
            <p className="text-ink-soft leading-relaxed mb-4">
              All guides undergo a thorough verification process:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <Shield className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">ID Verification:</strong>{" "}
                  Government-issued ID required and verified by our team
                </span>
              </li>
              <li className="flex gap-3">
                <Shield className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">Background Interview:</strong>{" "}
                  Video interview with our team to assess authenticity
                </span>
              </li>
              <li className="flex gap-3">
                <Shield className="h-5 w-5 text-brand mt-1 flex-shrink-0" />
                <span className="text-ink-soft leading-relaxed">
                  <strong className="text-ink">Community Connection:</strong>{" "}
                  Verification of connection to local LGBTQ+ community
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              4. Booking & Cancellation Policy
            </h2>
            <h3 className="text-xl font-semibold text-ink mb-3">
              Cancellation by Travelers
            </h3>
            <ul className="space-y-2 mb-6">
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">More than 48 hours:</strong> Full
                refund minus service fee
              </li>
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">24-48 hours:</strong> 50% refund
              </li>
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Less than 24 hours:</strong> No
                refund
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-ink mb-3">
              Cancellation by Guides
            </h3>
            <p className="text-ink-soft leading-relaxed">
              Guides who cancel confirmed bookings may face account restrictions.
              Emergency cancellations are evaluated case-by-case. Travelers
              receive full refunds if a guide cancels.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              5. Fees & Commission Structure
            </h2>
            <p className="text-ink-soft leading-relaxed mb-4">
              Rainbow Tour Guides charges a 20% commission on all bookings:
            </p>
            <ul className="space-y-2">
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Guides receive:</strong> 80% of the
                booking price
              </li>
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Platform fee:</strong> 20% covers
                payment processing, verification, support, and platform
                maintenance
              </li>
            </ul>
            <p className="text-ink-soft leading-relaxed mt-4">
              Travelers pay the listed price. Guides receive their portion minus
              the platform commission. All fees are clearly displayed before
              booking confirmation.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              6. Prohibited Services
            </h2>
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
              <p className="text-red-900 leading-relaxed font-semibold mb-3">
                Strictly Prohibited:
              </p>
              <ul className="space-y-2">
                <li className="text-red-900">
                  Escorting services or sexual services of any kind
                </li>
                <li className="text-red-900">
                  Any illegal activities or services
                </li>
                <li className="text-red-900">
                  Harassment, discrimination, or hate speech
                </li>
                <li className="text-red-900">
                  Misrepresenting services or identity
                </li>
              </ul>
            </div>
            <p className="text-ink-soft leading-relaxed mt-4">
              Violations result in immediate account termination and may be
              reported to law enforcement.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              7. User Responsibilities
            </h2>
            <p className="text-ink-soft leading-relaxed mb-4">
              All users agree to:
            </p>
            <ul className="space-y-2">
              <li className="text-ink-soft leading-relaxed">
                Comply with all applicable local, state, and federal laws
              </li>
              <li className="text-ink-soft leading-relaxed">
                Provide accurate and truthful information
              </li>
              <li className="text-ink-soft leading-relaxed">
                Conduct themselves in a safe and respectful manner
              </li>
              <li className="text-ink-soft leading-relaxed">
                Report any suspicious or inappropriate behavior
              </li>
              <li className="text-ink-soft leading-relaxed">
                Use public meeting points for initial encounters
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-ink-soft leading-relaxed">
              Rainbow Tour Guides provides the platform "as is" without
              warranties. We do not guarantee the quality of services, safety of
              interactions, or accuracy of guide profiles. Users engage with
              each other at their own risk and agree to hold Rainbow Tour Guides
              harmless from any claims related to platform use.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              9. Changes to Terms
            </h2>
            <p className="text-ink-soft leading-relaxed">
              We may update these terms periodically. Material changes will be
              communicated via email. Continued use after changes constitutes
              acceptance of updated terms.
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/legal/privacy" className="text-brand hover:underline">
              Privacy Policy
            </Link>
            <Link href="/legal/safety" className="text-brand hover:underline">
              Safety Guidelines
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
