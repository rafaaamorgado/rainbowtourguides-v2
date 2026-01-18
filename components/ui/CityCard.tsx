import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { getCityImageSrc } from "@/lib/city-images";

type CityCardProps = {
  city: {
    slug: string;
    name: string;
    country_name: string;
    image_url: string;
    description?: string | null;
    guide_count?: number;
  };
};

export function CityCard({ city }: CityCardProps) {
  const imageSrc = getCityImageSrc(city.slug, city.image_url);

  return (
    <Link
      href={`/cities/${city.slug}`}
      className="group block relative overflow-hidden rounded-3xl aspect-[3/4] shadow-lg cursor-pointer"
    >
      <Image
        src={imageSrc|| "/placeholder-city.svg"}
        alt={city.name}
        fill
        className="object-cover transition-transform duration-1000 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

      <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/20">
        <ArrowUpRight size={20} className="text-white" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70 mb-2 block">
          {city.country_name}
        </span>
        <h3 className="text-4xl font-serif font-bold mb-2 leading-none">{city.name}</h3>
        {/* TODO: add description field to cities table */}
        {/* {city.description && (
          <p className="text-sm text-white/80 line-clamp-2 mb-0 h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 group-hover:mb-4 transition-all duration-500 delay-100 font-light leading-relaxed">
            {city.description}
          </p>
        )} */}
        {city.guide_count !== undefined && (
          <div className="flex items-center gap-3 opacity-80">
            <div className="h-px flex-grow bg-white/30"></div>
            <span className="text-xs font-medium">{city.guide_count} Guides</span>
          </div>
        )}
      </div>
    </Link>
  );
}
