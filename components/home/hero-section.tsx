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
const heroSlides = [
  {
    src: "/images/home/carousel/hero-1.png",
    eyebrow: "Verified Guides",
    copy: "Identity-checked LGBTQ+ locals who prioritize comfort, safety, and authenticity.",
  },
  {
    src: "/images/home/carousel/hero-2.png",
    eyebrow: "Secure Booking",
    copy: "Protected payments and direct messaging keep every detail clear before you arrive.",
  },
  {
    src: "/images/home/carousel/hero-3.png",
    eyebrow: "Inclusive Experiences",
    copy: "Discover queer-friendly neighborhoods, culture, and nightlife with local confidence.",
  },
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
            {heroSlides.map((slide, index) => (
              <SwiperSlide
                key={slide.src}
                className="relative"
              >
                <Image
                  src={slide.src}
                  fill
                  className="object-cover object-center"
                  priority={index === 0}
                  alt="Hero background"
                />
                <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                  <div className="rounded-3xl border border-white/35 bg-slate-900/35 px-5 py-4 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.95)] backdrop-blur-md sm:px-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 sm:text-xs">
                      {slide.eyebrow}
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-snug text-white sm:text-xl">
                      {slide.copy}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
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
