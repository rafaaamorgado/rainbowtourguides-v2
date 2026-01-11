import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Star, CheckCircle, Globe, MapPin } from "lucide-react";
import { getGuide, getReviews } from "@/lib/data-service";
import { BookingCard } from "./booking-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuide(slug);

  if (!guide) {
    return {
      title: "Guide Not Found - Rainbow Tour Guides",
    };
  }

  return {
    title: `${guide.name} - ${guide.city_name} LGBTQ+ Tour Guide | Rainbow Tour Guides`,
    description: guide.bio.slice(0, 155),
    openGraph: {
      title: `${guide.name} - ${guide.city_name} Tour Guide`,
      description: guide.bio.slice(0, 155),
      type: "profile",
    },
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;

  // Fetch guide and reviews
  const guide = await getGuide(slug);
  const reviews = guide ? await getReviews(guide.id) : [];

  // 404 if guide not found
  if (!guide) {
    notFound();
  }

  // Mock authentication check (replace with real auth)
  const isAuthenticated = false;

  // Mock city image (in production, this would come from city data)
  const cityImageUrl =
    "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1600";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-80 overflow-hidden bg-slate-900">
        {/* Background City Image */}
        <div className="absolute inset-0">
          <Image
            src={cityImageUrl}
            alt={guide.city_name}
            fill
            className="object-cover blur-sm opacity-50"
            sizes="100vw"
            priority
          />
        </div>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black/80" />

        {/* Content */}
        <div className="relative h-full max-w-7xl mx-auto px-6 flex items-end pb-8">
          <div className="flex items-end gap-6">
            {/* Guide Photo */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                <Image
                  src={guide.photo_url}
                  alt={guide.name}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              {guide.verified && (
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1.5 border-4 border-white">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
              )}
            </div>

            {/* Guide Info */}
            <div className="flex-1 pb-2">
              <h1 className="text-4xl font-bold text-white mb-2">
                {guide.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{guide.city_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(guide.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-white/30"
                      )}
                    />
                  ))}
                  <span className="ml-1">
                    {guide.rating.toFixed(1)} ({guide.review_count} reviews)
                  </span>
                </div>
                {guide.verified && (
                  <Badge className="bg-emerald-500/20 text-emerald-100 border-emerald-500/30">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10">
            {/* About Section */}
            <section className="space-y-4">
              <h2 className="text-3xl font-bold text-ink">About {guide.name}</h2>
              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-ink-soft leading-relaxed">
                  {guide.bio}
                </p>
              </div>

              {/* Tagline */}
              <div className="bg-brand/5 border-l-4 border-brand rounded-r-xl p-4">
                <p className="text-ink font-medium italic">&ldquo;{guide.tagline}&rdquo;</p>
              </div>
            </section>

            {/* Languages */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-ink-soft" />
                <h3 className="text-xl font-semibold text-ink">Languages</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {guide.languages.map((language) => (
                  <Badge
                    key={language}
                    className="px-3 py-1 bg-pride-lilac/30 text-ink border-0 font-medium"
                  >
                    {language}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Interests/Experience Tags */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-ink">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {guide.experience_tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="px-3 py-1 bg-pride-mint/30 text-ink border-0 font-medium"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Tour Highlights */}
            <section className="space-y-4">
              <h3 className="text-xl font-semibold text-ink">Tour Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400",
                  "https://images.unsplash.com/photo-1523531294919-4bcd7c65e216?w=400",
                  "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400",
                ].map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100"
                  >
                    <Image
                      src={imageUrl}
                      alt={`Tour highlight ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="space-y-6">
              <h3 className="text-2xl font-bold text-ink">
                Reviews ({reviews.length})
              </h3>

              {reviews.length === 0 ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                  <p className="text-ink-soft">
                    No reviews yet. Be the first to book with {guide.name}!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-panel-light border border-slate-200 rounded-xl p-6 space-y-3"
                    >
                      {/* Reviewer Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pride-lilac to-pride-mint flex items-center justify-center text-white font-semibold">
                            {review.traveler_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-ink">
                              {review.traveler_name}
                            </p>
                            <p className="text-sm text-ink-soft">
                              {new Date(review.date).toLocaleDateString("en-US", {
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        {/* Rating */}
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={cn(
                                "h-4 w-4",
                                i < review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-slate-300"
                              )}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Review Text */}
                      <p className="text-ink-soft leading-relaxed">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <BookingCard guide={guide} isAuthenticated={isAuthenticated} />
          </div>
        </div>
      </div>
    </div>
  );
}

