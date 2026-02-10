"use client";

import Image from "next/image";
import { Sparkles, ShieldCheck, MapPin } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { HomeSearchBar } from "@/components/home/home-search-bar";
import type { City } from "@/lib/mock-data";
import "swiper/css";
import "swiper/css/effect-fade";

interface HeroSectionProps {
  cities: City[];
  totalGuides: number;
}

const containerClasses = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
const heroImages = [
  "/images/home/carousel/hero-1.png",
  "/images/home/carousel/hero-2.png",
  "/images/home/carousel/hero-3.png",
];

export function HeroSection({ cities, totalGuides }: HeroSectionProps) {
  const cityCount = cities.length;
  const avatarFallbacks = ["AR", "MS", "JP", "LC"];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-brand/10 blur-3xl" />
        <div className="absolute right-10 bottom-10 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />
      </div>

      <div className={`${containerClasses} relative py-16 lg:py-20 space-y-8 lg:space-y-10`}>
        <HeroTop
          avatarFallbacks={avatarFallbacks}
          cityCount={cityCount}
          totalGuides={totalGuides}
        />
        <TrustChipsRow />
        <HomeSearchCard cities={cities} />
      </div>
    </section>
  );
}

interface HeroTopProps {
  avatarFallbacks: string[];
  cityCount: number;
  totalGuides: number;
}

function HeroTop({ avatarFallbacks, cityCount, totalGuides }: HeroTopProps) {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div className="space-y-7 lg:space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white shadow-sm border border-slate-200 px-4 py-1.5 text-sm font-medium text-brand">
          <Sparkles className="h-4 w-4" />
          Safe, inclusive, authentic
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-tight text-ink">
            Discover cities with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-indigo-500">
              LGBTQ+ local guides
            </span>
          </h1>
          <p className="text-lg md:text-xl text-ink-soft max-w-2xl leading-relaxed">
            Book verified guides who know every queer-friendly corner, hidden speakeasy,
            and community hotspot—so you can explore with confidence.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {avatarFallbacks.map((fallback) => (
              <Avatar
                key={fallback}
                className="border-2 border-white h-10 w-10 bg-brand/10 text-brand"
              >
                <AvatarFallback className="font-semibold">{fallback}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Trusted by travelers worldwide</p>
            <p className="text-sm text-ink-soft">
              {totalGuides}+ verified guides across {cityCount}+ cities
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="relative isolate overflow-hidden rounded-[28px] shadow-2xl ring-1 ring-black/5 aspect-[4/3] sm:aspect-[16/9] lg:aspect-[5/4]">
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            speed={1500}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={true}
            className="absolute inset-0 w-full h-full -z-10"
          >
            {heroImages.map((src, index) => (
              <SwiperSlide
                key={src}
                className="relative"
              >
                <Image
                  src={src}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                  alt="Hero background"
                />
                <div className="absolute inset-0 bg-black/40" />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-slate-900/10 to-transparent" />

          {/* Overlay content */}
          <div className="absolute bottom-6 left-6 right-6 grid gap-3 text-white">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-white/80">Safety first</p>
                <p className="font-semibold">Guides vetted by our community</p>
              </div>
            </div>
            <div className="h-px bg-white/20" />
            <div className="flex items-center justify-between text-sm text-white/80">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                Real-time availability
              </div>
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="h-2 w-2 rounded-full bg-white/70"
                    aria-hidden
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrustChipsRow() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200">
        <ShieldCheck className="h-4 w-4 text-brand" />
        <span className="text-sm font-semibold text-ink">Verified locals</span>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200">
        <MapPin className="h-4 w-4 text-brand" />
        <span className="text-sm font-semibold text-ink">Queer-owned spots</span>
      </div>
    </div>
  );
}

function HomeSearchCard({ cities }: { cities: City[] }) {
  return (
    <div className="w-full">
      <HomeSearchBar cities={cities} />
    </div>
  );
}
