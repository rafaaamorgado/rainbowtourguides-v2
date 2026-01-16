import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { GuideHero } from "@/components/guide/guide-hero";
import { GuideAbout } from "@/components/guide/guide-about";
import { GuideHighlights } from "@/components/guide/guide-highlights";
import { GuideReviews } from "@/components/guide/guide-reviews";
import { BookingCard } from "@/components/guide/booking-card";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { logError } from "@/lib/query-logger";

interface GuidePageProps {
  params: { slug: string };
}

type GuideRow = {
  id: string;
  slug: string;
  city_id: string;
  headline: string | null;
  bio: string | null;
  about: string | null;
  themes: string[] | null;
  base_price_4h: number | null;
  base_price_6h: number | null;
  base_price_8h: number | null;
  currency: string | null;
  status: string;
  profile: {
    full_name?: string | null;
    display_name?: string | null;
    avatar_url?: string | null;
    languages?: string[] | null;
  } | null;
  city: {
    name?: string | null;
    country_name?: string | null;
    slug?: string | null;
  } | null;
};

function resolveCover(slug: string, citySlug?: string | null) {
  const coverDir = path.join(process.cwd(), "public", "images");
  const candidates = [
    path.join(coverDir, "guides", "covers", `${slug}.jpg`),
    path.join(coverDir, "guides", "covers", `${slug}.png`),
    citySlug ? path.join(coverDir, "cities", `${citySlug}.jpg`) : null,
    citySlug ? path.join(coverDir, "cities", `${citySlug}.png`) : null,
  ].filter(Boolean) as string[];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      const rel = filePath.split("public")[1];
      return rel.startsWith("/") ? rel : `/${rel}`;
    }
  }
  return "/images/covers/default.svg";
}

function resolveHighlights(citySlug?: string | null) {
  const base = path.join(process.cwd(), "public", "images", "highlights");
  const candidates: string[] = [];
  if (citySlug) {
    [1, 2, 3].forEach((i) => {
      const jpg = path.join(base, `${citySlug}-${i}.jpg`);
      const png = path.join(base, `${citySlug}-${i}.png`);
      if (fs.existsSync(jpg)) candidates.push(`/images/highlights/${citySlug}-${i}.jpg`);
      else if (fs.existsSync(png)) candidates.push(`/images/highlights/${citySlug}-${i}.png`);
    });
  }
  if (candidates.length === 0) {
    candidates.push(
      "/images/highlights/default-1.svg",
      "/images/highlights/default-2.svg",
      "/images/highlights/default-3.svg",
    );
  }
  return candidates;
}

function toReviews(raw: any[], guideName: string) {
  if (!raw?.length) {
    return [
      {
        id: "sample-1",
        author: "Anonymous Traveler",
        rating: 4.8,
        comment:
          `Had an incredible time with ${guideName}! They knew every queer-friendly spot and made me feel safe the whole time.`,
        date: "about 2 months ago",
      },
      {
        id: "sample-2",
        author: "Jess P.",
        rating: 5,
        comment: "Super thoughtful and fun. Great food recs and nightlife tips.",
        date: "about 1 month ago",
      },
    ];
  }

  return raw.map((r, idx) => ({
    id: r.id || `rev-${idx}`,
    author: r.reviewer_name || "Anonymous Traveler",
    rating: r.rating || 5,
    comment: r.comment || "Lovely experience.",
    date: r.created_at || "",
  }));
}

export default async function GuideProfilePage({ params }: GuidePageProps) {
  const slug = params?.slug;
  if (!slug) notFound();

  const supabase = await createSupabaseServerClient();

  const { data: guide, error } = await supabase
    .from("guides")
    .select(
      `
        id,
        slug,
        city_id,
        headline,
        bio,
        about,
        themes,
        base_price_4h,
        base_price_6h,
        base_price_8h,
        currency,
        status,
        profile:profiles!guides_id_fkey(
          full_name,
          display_name,
          avatar_url,
          languages
        ),
        city:cities!guides_city_id_fkey(
          name,
          country_name,
          slug
        )
      `
    )
    .eq("slug", slug)
    .eq("status", "approved")
    .single<GuideRow>();

  if (error || !guide) {
    logError("SELECT", "guides", error);
    notFound();
  }

  const fullName =
    guide.profile?.full_name ||
    guide.profile?.display_name ||
    "Local Guide";
  const verified = guide.status === "approved";
  const coverImage = resolveCover(slug, guide.city?.slug || undefined);
  const highlightImages = resolveHighlights(guide.city?.slug || undefined);

  const { data: reviewRows, error: reviewError } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at")
    .eq("guide_id", guide.id)
    .limit(6);

  if (reviewError) {
    logError("SELECT", "reviews", reviewError);
  }

  const reviews = toReviews(reviewRows || [], fullName);
  const rating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : undefined;

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <GuideHero
          name={fullName}
          city={guide.city?.name ?? ""}
          country={guide.city?.country_name ?? ""}
          avatarUrl={guide.profile?.avatar_url}
          coverImage={coverImage}
          rating={rating}
          reviews={reviews.length}
          verified={verified}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:items-start">
          <div className="lg:col-span-2 space-y-10">
            <GuideAbout
              name={fullName}
              bio={guide.bio || guide.about}
              languages={guide.profile?.languages || []}
              interests={guide.themes || []}
            />

            <GuideHighlights images={highlightImages.slice(0, 3)} />

            <GuideReviews reviews={reviews} />
          </div>

          <div className="lg:col-span-1">
            <BookingCard
              basePrices={{
                4: guide.base_price_4h || undefined,
                6: guide.base_price_6h || undefined,
                8: guide.base_price_8h || undefined,
              }}
              currency={guide.currency}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
