import Link from "next/link";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Rainbow Tour Guides - Premium LGBTQ+ Travel Experiences",
  description: "Connect with verified local LGBTQ+ guides for safe, authentic travel experiences. Curated destinations, vetted guides, and 24/7 traveler support.",
  openGraph: {
    title: "Rainbow Tour Guides - Premium LGBTQ+ Travel Experiences",
    description: "Connect with verified local LGBTQ+ guides for safe, authentic travel experiences.",
    type: "website",
  },
};

export default function MarketingPage() {
  return (
    <section className="space-y-12 py-16">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        <Badge variant="secondary">Community-first travel</Badge>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Rainbow Tour Guides
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            A premium marketplace connecting LGBTQ+ travelers with verified local guides, curated
            experiences, and safe places to stay in every corner of the world.
          </p>
          <p className="text-sm text-muted-foreground italic">
            Private, safe, LGBTQ+ friendly experiences with vetted local guides.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/cities">Explore destinations</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/auth/sign-up?role=guide">Become a guide</Link>
          </Button>
        </div>
      </div>

      <Card className="mx-auto max-w-4xl">
        <CardContent className="grid gap-6 p-8 sm:grid-cols-3">
          {[
            ["50+", "cities launching soon"],
            ["12", "partner tour collectives"],
            ["24/7", "traveler concierge"],
          ].map(([stat, label]) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-semibold">{stat}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}
