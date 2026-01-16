"use client";

import Image from "next/image";

interface GuideHighlightsProps {
  images: string[];
}

export function GuideHighlights({ images }: GuideHighlightsProps) {
  if (!images.length) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold text-ink">Tour Highlights</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {images.map((src, idx) => (
          <div
            key={`${src}-${idx}`}
            className="relative h-32 sm:h-36 rounded-2xl overflow-hidden bg-slate-100 shadow-sm"
          >
            <Image
              src={src}
              alt="Tour highlight"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
