export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Information We Collect</h2>
          <p>
            We collect information you provide directly, including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account information (name, email, profile details)</li>
            <li>Booking and transaction information</li>
            <li>Communication records between users</li>
            <li>Usage data and analytics</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p>
            We use collected information to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and improve our platform services</li>
            <li>Facilitate connections between travelers and guides</li>
            <li>Process payments and transactions</li>
            <li>Send transactional emails and notifications</li>
            <li>Ensure platform safety and prevent fraud</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. Information Sharing</h2>
          <p>
            We share information only as necessary to operate the platform:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Profile information is visible to other users as part of the marketplace</li>
            <li>Booking details are shared between matched travelers and guides</li>
            <li>Payment information is processed through secure third-party providers (Stripe)</li>
            <li>We may disclose information if required by law or to protect user safety</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your information. However,
            no system is completely secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access and update your account information</li>
            <li>Request deletion of your account and data</li>
            <li>Opt out of marketing communications</li>
            <li>Export your data in a portable format</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Cookies and Tracking</h2>
          <p>
            We use cookies and similar technologies to improve your experience, analyze usage, and
            provide personalized content. You can manage cookie preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Third-Party Services</h2>
          <p>
            Our platform integrates with third-party services (e.g., Stripe for payments, Resend for
            emails). These services have their own privacy policies governing data handling.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">8. Children&apos;s Privacy</h2>
          <p>
            Our platform is not intended for users under 18 years of age. We do not knowingly collect
            information from children.
          </p>
        </section>
      </div>

      {/* TODO: This legal text should be reviewed by a qualified attorney before production deployment */}
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-900 dark:text-yellow-100">
          <strong>Legal Review Required:</strong> This privacy policy is a draft and must be reviewed
          and approved by qualified legal counsel before production deployment.
        </p>
      </div>
    </div>
  );
}

