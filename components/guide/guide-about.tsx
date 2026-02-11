'use client';

import { Chip } from "@heroui/react";

interface GuideAboutProps {
  name: string;
  bio?: string | null;
  tour_description?: string | null;
  lgbtq_alignment?: any | null;
  languages?: string[] | null;
  interests?: string[] | null;
}

export function GuideAbout({
  name,
  bio,
  tour_description,
  lgbtq_alignment,
  languages = [],
  interests = [],
}: GuideAboutProps) {
  const languageList = languages ?? [];
  const interestList = interests ?? [];
  const whyGuiding = lgbtq_alignment?.why_guiding;

  return (
    <section className="space-y-8">
      {/* Languages & Interests Chips (Top) */}
      <div className="flex flex-wrap gap-6">
         {languageList.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {languageList.map((lang) => (
                  <Chip key={lang} variant="flat" color="primary" size="sm">
                    {lang}
                  </Chip>
                ))}
              </div>
            </div>
         )}
         
         {interestList.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {interestList.map((tag) => (
                  <Chip key={tag} variant="flat" color="secondary" size="sm">
                    {tag.replace(/-/g, ' ')}
                  </Chip>
                ))}
              </div>
            </div>
         )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">About {name}</h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {bio || `${name} is a local expert who loves crafting welcoming experiences for LGBTQ+ travelers.`}
        </p>
      </div>

      {tour_description && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">About The Tour</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {tour_description}
          </p>
        </div>
      )}
      
      {whyGuiding && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Why I Guide</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {whyGuiding}
          </p>
        </div>
      )}
    </section>
  );
}
