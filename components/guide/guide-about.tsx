'use client';

import { Badge } from '@/components/ui/badge';

interface GuideAboutProps {
  name: string;
  bio?: string | null;
  languages?: string[] | null;
  interests?: string[] | null;
}

export function GuideAbout({
  name,
  bio,
  languages = [],
  interests = [],
}: GuideAboutProps) {
  const languageList = languages ?? [];
  const interestList = interests ?? [];

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-ink">About {name}</h2>
        <p className="text-ink-soft leading-relaxed">
          {bio ||
            `${name} is a local expert who loves crafting welcoming experiences for LGBTQ+ travelers.`}
        </p>
      </div>

      {languageList.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-ink">Languages</h3>
          <div className="flex flex-wrap gap-2">
            {languageList.map((lang) => (
              <Badge
                key={lang}
                variant="secondary"
                className="rounded-full px-3 py-1"
              >
                {lang}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {interestList.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-ink">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {interestList.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="rounded-full px-3 py-1"
              >
                {tag.replace(/-/g, ' ')}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
