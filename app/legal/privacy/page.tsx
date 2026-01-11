import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-ink-soft">Last updated: January 12, 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg prose-slate max-w-none space-y-12">
          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              1. Information We Collect
            </h2>
            <p className="text-ink-soft leading-relaxed mb-4">
              We collect information you provide directly to us:
            </p>
            <ul className="space-y-2">
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Account Information:</strong> Name,
                email, profile details, preferences
              </li>
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Booking Information:</strong> Tour
                dates, locations, special requests, payment details
              </li>
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Communications:</strong> Messages
                between travelers and guides
              </li>
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Usage Data:</strong> How you
                interact with our platform, analytics
              </li>
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Verification Documents:</strong>{" "}
                Guide ID documents (securely encrypted)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              2. GDPR Compliance
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
              <p className="text-blue-900 leading-relaxed mb-3">
                <strong>Your Rights Under GDPR:</strong>
              </p>
              <ul className="space-y-2 text-blue-900">
                <li>Right to access your personal data</li>
                <li>Right to rectification (correction of inaccurate data)</li>
                <li>Right to erasure ("right to be forgotten")</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
                <li>Right to withdraw consent</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-ink-soft leading-relaxed mb-4">
              We use collected information to:
            </p>
            <ul className="space-y-2">
              <li className="text-ink-soft leading-relaxed">
                Provide and improve our platform services
              </li>
              <li className="text-ink-soft leading-relaxed">
                Facilitate connections between travelers and guides
              </li>
              <li className="text-ink-soft leading-relaxed">
                Process payments and transactions securely
              </li>
              <li className="text-ink-soft leading-relaxed">
                Send transactional emails and booking confirmations
              </li>
              <li className="text-ink-soft leading-relaxed">
                Ensure platform safety and prevent fraud
              </li>
              <li className="text-ink-soft leading-relaxed">
                Verify guide credentials and maintain community standards
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              4. Data Security & Protection
            </h2>
            <p className="text-ink-soft leading-relaxed mb-4">
              We implement industry-standard security measures:
            </p>
            <ul className="space-y-2">
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Encryption:</strong> All sensitive
                data encrypted in transit and at rest
              </li>
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Secure Storage:</strong> ID
                documents stored with enterprise-grade encryption
              </li>
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Limited Access:</strong>{" "}
                Verification documents only accessible to admin team
              </li>
              <li className="text-ink-soft leading-relaxed">
                <strong className="text-ink">Regular Audits:</strong> Security
                practices reviewed and updated regularly
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              5. Information Sharing
            </h2>
            <p className="text-ink-soft leading-relaxed mb-4">
              We share information only as necessary:
            </p>
            <ul className="space-y-2">
              <li className="text-ink-soft leading-relaxed">
                Profile information is visible to users as part of the
                marketplace
              </li>
              <li className="text-ink-soft leading-relaxed">
                Booking details are shared between matched travelers and guides
              </li>
              <li className="text-ink-soft leading-relaxed">
                Payment processing through Stripe (PCI-DSS compliant)
              </li>
              <li className="text-ink-soft leading-relaxed">
                We may disclose information if required by law or to protect user
                safety
              </li>
              <li className="text-ink-soft leading-relaxed">
                We never sell personal data to third parties
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              6. Cookies & Tracking
            </h2>
            <p className="text-ink-soft leading-relaxed">
              We use cookies and similar technologies to improve your experience,
              analyze usage, and provide personalized content. Essential cookies
              are required for platform functionality. You can manage preferences
              through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">
              7. Data Retention
            </h2>
            <p className="text-ink-soft leading-relaxed">
              We retain your data as long as your account is active. Upon account
              deletion, personal data is removed within 90 days, except where
              legal retention requirements apply. Booking records may be retained
              for tax and legal compliance purposes.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-ink mb-4">8. Contact Us</h2>
            <p className="text-ink-soft leading-relaxed">
              For privacy-related questions or to exercise your rights, contact
              us at{" "}
              <a
                href="mailto:privacy@rainbowtourguides.com"
                className="text-brand hover:underline"
              >
                privacy@rainbowtourguides.com
              </a>
            </p>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <div className="flex flex-wrap gap-6 text-sm">
            <Link href="/legal/terms" className="text-brand hover:underline">
              Terms of Service
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
