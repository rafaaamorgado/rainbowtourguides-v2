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

const heroSlides = [
  {
    src: "/images/home/carousel/hero-1.png",
    alt: "Verified LGBTQ+ Guides",
  },
  {
    src: "/images/home/carousel/hero-2.png",
    alt: "Secure Booking Platform",
  },
  {
    src: "/images/home/carousel/hero-3.png",
    alt: "Inclusive Travel Experiences",
  },
];

export function HeroSection({ cities, totalGuides }: HeroSectionProps) {
  const avatarFallbacks = ["AR", "MS", "JP", "LC"];

  return (
    <section className="relative w-full h-[85dvh] min-h-[500px] md:h-screen overflow-hidden bg-ink">
      {/* Background Swiper */}
      <div className="absolute inset-0 -z-10">
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          speed={1500}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          className="h-full w-full"
        >
          {heroSlides.map((slide, index) => (
            <SwiperSlide key={slide.src} className="relative h-full w-full">
              <Image
                src={slide.src}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
                alt={slide.alt}
              />
              {/* Dark overlay for text readability */}
              <div className="absolute inset-0 bg-black/40" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Content Container */}
      <div className="relative z-10 h-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full space-y-8 lg:space-y-10">
          
          {/* Main Text Content */}
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 text-sm font-medium text-white shadow-sm">
              <Sparkles className="h-4 w-4 text-brand-lighter" />
              Safe, inclusive, authentic
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold leading-tight text-white tracking-tight drop-shadow-sm">
              Discover cities with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-lighter to-indigo-300">
                LGBTQ+ local guides
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed drop-shadow-sm">
              Book verified guides who know every queer-friendly corner, hidden speakeasy,
              and community hotspot—so you can explore with confidence.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {avatarFallbacks.map((fallback) => (
                    <Avatar
                      key={fallback}
                      className="border-2 border-white/20 h-10 w-10 bg-brand/20 text-white backdrop-blur-sm"
                    >
                      <AvatarFallback className="font-semibold bg-transparent">{fallback}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="text-white">
                  <p className="text-sm font-semibold">Trusted by travelers</p>
                  <p className="text-xs text-white/70">
                    {totalGuides}+ verified guides
                  </p>
                </div>
              </div>
              
              <TrustChipsRow />
            </div>
          </div>

          {/* Search Card */}
          <HomeSearchCard cities={cities} />
          
        </div>
      </div>
    </section>
  );
}

function TrustChipsRow() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm transition-colors hover:bg-white/20">
        <ShieldCheck className="h-4 w-4 text-brand-lighter" />
        <span className="text-sm font-semibold text-white">Verified locals</span>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm transition-colors hover:bg-white/20">
        <MapPin className="h-4 w-4 text-brand-lighter" />
        <span className="text-sm font-semibold text-white">Queer-owned spots</span>
      </div>
    </div>
  );
}

function HomeSearchCard({ cities }: { cities: City[] }) {
  return (
    <div className="w-full max-w-4xl">
      <HomeSearchBar cities={cities} />
    </div>
  );
}
