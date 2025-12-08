export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">1. Marketplace Platform</h2>
          <p>
            Rainbow Tour Guides is a marketplace platform that connects travelers with local guides.
            We are not a travel agency, tour operator, or booking service. We facilitate connections
            between users, but all agreements, transactions, and services are directly between travelers
            and guides. Rainbow Tour Guides is not a party to any booking or service agreement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">2. Prohibited Services</h2>
          <p className="font-semibold text-destructive">
            Rainbow Tour Guides does not provide, facilitate, or allow escorting services, sexual
            services, or any form of compensated companionship that involves sexual activity.
          </p>
          <p>
            Any use of the platform for such purposes is strictly prohibited and will result in
            immediate account termination and potential legal action.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">3. User Responsibilities</h2>
          <p>
            All users (travelers and guides) are responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Complying with all applicable local, state, and federal laws</li>
            <li>Verifying the identity and credentials of other users</li>
            <li>Conducting themselves in a safe and respectful manner</li>
            <li>Using public meeting points for initial meetups</li>
            <li>Reporting any suspicious or inappropriate behavior</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">4. No Warranties</h2>
          <p>
            Rainbow Tour Guides provides the platform &quot;as is&quot; without warranties of any kind. We do
            not guarantee the accuracy of guide profiles, the quality of services, or the safety of
            any interactions. Users engage with each other at their own risk.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">5. Limitation of Liability</h2>
          <p>
            Rainbow Tour Guides shall not be liable for any damages arising from the use of the
            platform, including but not limited to personal injury, property damage, or financial loss.
            Users agree to hold Rainbow Tour Guides harmless from any claims related to their use of
            the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">6. Account Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate these terms, engage in
            prohibited activities, or otherwise misuse the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">7. Changes to Terms</h2>
          <p>
            We may update these terms from time to time. Continued use of the platform after changes
            constitutes acceptance of the updated terms.
          </p>
        </section>
      </div>

      {/* TODO: This legal text should be reviewed by a qualified attorney before production deployment */}
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-900 dark:text-yellow-100">
          <strong>Legal Review Required:</strong> This terms of service document is a draft and must
          be reviewed and approved by qualified legal counsel before production deployment.
        </p>
      </div>
    </div>
  );
}

