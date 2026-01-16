import { notFound } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Calendar } from "lucide-react";
import { SoftWall } from "@/components/marketing/soft-wall";
import { BookingRequestForm } from "@/components/booking/booking-request-form";

interface GuideProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function GuideProfilePage({ params }: GuideProfilePageProps) {
  const { slug } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) { },
      },
    }
  );

  // Check auth state for Soft Wall logic
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // Fetch Guide details
  const { data: guide, error } = await supabase
    .from("guides")
    .select(`
      *,
      profile:profiles!inner (
        display_name,
        avatar_url,
        bio
      ),
      city:cities (
        name,
        country_name
      )
    `)
    .eq("slug", slug)
    // .eq("status", "approved") // Usually yes, but maybe preview for guide themselves? 
    // For now strict public view
    .single();

  if (error || !guide) {
    notFound();
  }

  const guideProfile = guide.profile as any; // Type coercion
  const city = guide.city as any;

  return (
    <div className="container py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Basic Info (Public) */}
        <div className="md:col-span-2 space-y-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={guideProfile.avatar_url} />
              <AvatarFallback>{guideProfile.display_name[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{guideProfile.display_name}</h1>
                <p className="text-xl text-muted-foreground">{guide.tagline}</p>
                <div className="flex items-center gap-2 mt-2 text-sm font-medium">
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Check className="h-4 w-4" /> Verified Guide
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span>{city?.name}, {city?.country_name}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {guide.themes?.map((t: string) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="prose max-w-none">
            <h3>About Me</h3>
            <p className="whitespace-pre-wrap">{guide.bio}</p>

            <h3>What we'll do</h3>
            <p className="whitespace-pre-wrap">{guide.about}</p>
          </div>

          {/* Locked Section: Reviews */}
          <section className="pt-8 border-t">
            <h3 className="text-xl font-bold mb-4">Reviews</h3>
            {isAuthenticated ? (
              <div className="text-center p-8 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">No reviews yet.</p>
              </div>
            ) : (
              <SoftWall
                title="See what travelers verified say"
                description="Sign up to view detailed reviews and ratings."
              />
            )}
          </section>
        </div>

        {/* Right Column: Booking / Pricing (Partially Locked) */}
        <div className="md:col-span-1">
          <div className="sticky top-24 border rounded-xl p-6 shadow-sm bg-card">
            {isAuthenticated ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg">Detailed Rates</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between">
                      <span>4 Hours</span>
                      <span className="font-medium">{guide.base_price_4h} {guide.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>6 Hours</span>
                      <span className="font-medium">{guide.base_price_6h} {guide.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>8 Hours</span>
                      <span className="font-medium">{guide.base_price_8h} {guide.currency}</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full" size="lg">Request Booking</Button>

                <p className="text-xs text-center text-muted-foreground">
                  You won't be charged yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg">Rates</h3>
                  <div className="mt-4 px-4 py-3 bg-muted/20 rounded-lg text-center">
                    <span className="text-2xl font-bold">$$$</span>
                    <p className="text-xs text-muted-foreground">Sign up to view exact pricing</p>
                  </div>
                </div>

                <SoftWall
                  blur={false}
                  title="Join to Book"
                  description="Create a free account to contact this guide."
                  className="bg-transparent"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
