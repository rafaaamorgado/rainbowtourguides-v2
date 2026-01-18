"use client";

import Image from "next/image";

interface GuideHighlightsProps {
  images: string[];
  highlightTexts?: string[];
}

export function GuideHighlights({ images, highlightTexts = [] }: GuideHighlightsProps) {
  if (!images.length && !highlightTexts.length) return null;

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold text-ink">Tour Highlights</h3>
      {highlightTexts.length > 0 ? (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-ink-soft">
          {highlightTexts.map((item, idx) => (
            <li
              key={`${item}-${idx}`}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
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
      )}
    </section>
  );
}
