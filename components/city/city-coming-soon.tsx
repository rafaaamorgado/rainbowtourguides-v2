"use client";

import Link from "next/link";
import { MapPin, Bell, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { useCityComingSoon } from "./lib/useCityComingSoon";
import type { City } from "@/lib/mock-data";
import { ExploreCitiesSection } from "@/components/home/explore-cities-section";

interface CityComingSoonProps {
  cityName: string;
  cities?: City[];
}

export function CityComingSoon({ cityName, cities = [] }: CityComingSoonProps) {
  const { email, setEmail, submitted, toast, hideToast, handleSubmit } =
    useCityComingSoon(cityName);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100 py-20 lg:py-28">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-brand/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-purple-500/5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-4 py-1.5 text-sm font-medium text-amber-800">
            <MapPin className="h-4 w-4" />
            Coming Soon
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-ink">
            We don&apos;t have verified guides in{" "}
            <span className="text-brand">{cityName}</span> yet
          </h1>

          <p className="text-lg text-ink-soft max-w-xl mx-auto leading-relaxed">
            We&apos;re growing fast! Be the first to know when local LGBTQ+ friendly guides
            launch in {cityName}.
          </p>
        </div>
      </section>

      {/* Actions */}
      <section className="relative -mt-8 mx-auto max-w-2xl px-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-8 space-y-8">
          {/* Email Capture */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-brand">
              <Bell className="h-4 w-4" />
              Get Notified
            </div>
            <p className="text-ink-soft text-sm">
              Drop your email and we&apos;ll let you know the moment guides are available
              in {cityName}.
            </p>
            {submitted ? (
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800 text-sm font-medium">
                <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
                You&apos;re on the list! We&apos;ll reach out when {cityName} goes live.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">
                  Notify Me
                </Button>
              </form>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">
              or
            </span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Guide CTA */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-ink">
              Live in {cityName}? Become a guide!
            </h3>
            <p className="text-ink-soft text-sm">
              Share your city with LGBTQ+ travelers and earn on your own schedule.
            </p>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/become-a-guide" className="inline-flex items-center gap-2">
                Apply as a Guide
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Explore other destinations */}
      <div className="mt-16">
        <ExploreCitiesSection cities={cities} />
      </div>
    </div>
  );
}
