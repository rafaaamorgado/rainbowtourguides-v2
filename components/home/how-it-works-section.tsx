"use client";

import { ArrowRight, CheckCircle2, Sparkles, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Find your guide",
    description: "Browse cities and filter by interests, language, and vibe to match with locals who get you.",
    icon: Sparkles,
  },
  {
    title: "Book your experience",
    description: "Pick your dates, confirm availability, and chat securely to fine-tune the itinerary.",
    icon: CheckCircle2,
  },
  {
    title: "Explore together",
    description: "Meet your guide and discover queer-friendly neighborhoods, hidden gems, and safe spaces.",
    icon: Users,
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-10">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.2em] text-brand font-semibold">
            How it works
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-ink">Your trip, guided with pride</h2>
          <p className="text-ink-soft max-w-2xl mx-auto">
            Three simple steps to book a verified LGBTQ+ local who knows every welcoming spot.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="h-full rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center text-lg font-bold">
                    {index + 1}
                  </div>
                  <Icon className="h-5 w-5 text-brand" />
                </div>
                <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
                <p className="text-sm text-ink-soft leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button asChild className="px-6 h-12 text-base font-semibold rounded-xl">
            <Link href="/guides">Get Started</Link>
          </Button>
          <Link href="/how-it-works" className="inline-flex items-center gap-2 text-brand font-semibold">
            Learn more
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
