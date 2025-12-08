export default function SafetyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold mb-2">Safety Guidelines</h1>
        <p className="text-muted-foreground">Your safety is our priority</p>
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-3">For Travelers</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Meet in public places:</strong> Always arrange first meetups at public locations
              like cafes, landmarks, or tourist information centers.
            </li>
            <li>
              <strong>Verify guide identity:</strong> Confirm the guide&apos;s identity matches their
              profile before starting the tour.
            </li>
            <li>
              <strong>Share your itinerary:</strong> Let friends or family know where you&apos;re going
              and who you&apos;re meeting.
            </li>
            <li>
              <strong>Trust your instincts:</strong> If something feels off, leave the situation
              immediately.
            </li>
            <li>
              <strong>Report concerns:</strong> Contact us immediately if you experience any safety
              issues or inappropriate behavior.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">For Guides</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Maintain professional boundaries:</strong> Keep interactions appropriate and
              respectful at all times.
            </li>
            <li>
              <strong>Know local laws:</strong> Ensure you understand and comply with all local
              regulations regarding tour guiding and tourism.
            </li>
            <li>
              <strong>Be transparent:</strong> Clearly communicate tour details, pricing, and any
              limitations before booking.
            </li>
            <li>
              <strong>Respect traveler privacy:</strong> Do not share traveler information or photos
              without explicit consent.
            </li>
            <li>
              <strong>Report issues:</strong> Contact us if you encounter any safety concerns or
              inappropriate behavior from travelers.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Platform Rules</h2>
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
            <p className="font-semibold text-destructive mb-2">
              Prohibited Activities:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Escorting services or sexual services of any kind</li>
              <li>Any illegal activities or services</li>
              <li>Harassment, discrimination, or hate speech</li>
              <li>Sharing false information or misrepresenting services</li>
              <li>Circumventing platform fees or payment systems</li>
            </ul>
          </div>
          <p>
            Violations of these rules will result in immediate account termination and may be reported
            to law enforcement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Emergency Contacts</h2>
          <p>
            In case of emergency:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Contact local emergency services (911 in the US, 112 in EU, etc.)</li>
            <li>Report safety incidents to Rainbow Tour Guides immediately</li>
            <li>Contact your embassy or consulate if traveling internationally</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Legal Compliance</h2>
          <p>
            All users must comply with applicable local, state, and federal laws. Rainbow Tour Guides
            is a marketplace platform and does not provide legal advice. Users are responsible for
            understanding and following all relevant regulations in their jurisdiction.
          </p>
        </section>
      </div>

      {/* TODO: This legal text should be reviewed by a qualified attorney before production deployment */}
      <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-sm text-yellow-900 dark:text-yellow-100">
          <strong>Legal Review Required:</strong> This safety guidelines document is a draft and must
          be reviewed and approved by qualified legal counsel before production deployment.
        </p>
      </div>
    </div>
  );
}

