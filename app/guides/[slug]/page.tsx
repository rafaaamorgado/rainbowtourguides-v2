import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requireUser } from "@/lib/auth-helpers";
import { sendBookingRequestEmail } from "@/lib/email";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookingForm } from "@/components/guide/BookingForm";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: guide } = await supabase
    .from("guides")
    .select("id, headline")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (!guide) {
    return {
      title: "Guide Not Found - Rainbow Tour Guides",
    };
  }

  const typedGuide = guide as { id: string; headline: string | null };

  // Fetch profile name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", typedGuide.id)
    .single();

  const typedProfile = profile as { display_name: string } | null;
  const guideName = typedProfile?.display_name || "Local Guide";
  const headline = typedGuide.headline || "LGBTQ+ Local Guide";

  return {
    title: `${guideName} - ${headline} | Rainbow Tour Guides`,
    description: `Book an authentic LGBTQ+ travel experience with ${guideName}. Verified local guide offering safe, personalized tours.`,
    openGraph: {
      title: `${guideName} - LGBTQ+ Local Guide`,
      description: `Book an authentic LGBTQ+ travel experience with ${guideName}.`,
      type: "profile",
    },
  };
}

type Guide = Database["public"]["Tables"]["guides"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type City = Database["public"]["Tables"]["cities"]["Row"];

type GuideWithRelations = Guide & {
  profile: Profile;
  city: City;
};

// Helper to format themes into readable strings
function formatTheme(theme: string): string {
  return theme
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  // Fetch guide by slug
  const { data: guide, error: guideError } = await supabase
    .from("guides")
    .select("*")
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (guideError || !guide) {
    notFound();
  }

  const typedGuide = guide as Guide;

  // Fetch related profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", typedGuide.id)
    .single();

  // Fetch related city
  const { data: city } = await supabase
    .from("cities")
    .select("*")
    .eq("id", typedGuide.city_id)
    .single();

  if (!profile || !city) {
    notFound();
  }

  const guideWithRelations: GuideWithRelations = {
    ...typedGuide,
    profile: profile as Profile,
    city: city as City,
  };

  // Check if user is logged in and get their profile
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userProfile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    userProfile = data as Profile | null;
  }

  // Server action to create a booking
  async function createBooking(formData: FormData): Promise<{ success: boolean; error?: string; guideName?: string }> {
    "use server";

    // Use requireUser() helper for consistent auth handling
    const { supabase, profile } = await requireUser();

    // Ensure user is a traveler
    if (profile.role !== "traveler") {
      return { success: false, error: "Only travelers can request bookings." };
    }

    // Parse form data
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const durationHours = parseFloat(formData.get("duration") as string);
    const notes = formData.get("notes") as string;

    // Validate required fields
    if (!date || !time || !durationHours) {
      return { success: false, error: "Please fill in all required fields." };
    }

    // Combine date and time into starts_at
    const startsAt = new Date(`${date}T${time}`);
    if (isNaN(startsAt.getTime())) {
      return { success: false, error: "Invalid date or time." };
    }

    // Calculate ends_at
    const endsAt = new Date(startsAt);
    endsAt.setHours(endsAt.getHours() + durationHours);

    // Get guide details for this booking
    const { data: guideData } = await supabase
      .from("guides")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!guideData) {
      return { success: false, error: "Guide not found." };
    }

    // Type assertion needed because select("*") returns a narrowed type
    const guide = guideData as Guide;

    // Calculate price (using hourly_rate if available, otherwise use a default)
    const hourlyRate = guide.hourly_rate ? parseFloat(guide.hourly_rate) : 50;
    const priceTotal = (hourlyRate * durationHours).toFixed(2);

    // Create booking with typed insert
    const bookingInsert: Database["public"]["Tables"]["bookings"]["Insert"] = {
      traveler_id: profile.id,
      guide_id: guide.id,
      city_id: guide.city_id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      duration_hours: durationHours,
      notes: notes || null,
      price_total: priceTotal,
      currency: guide.currency || "USD",
      status: "pending",
    };

    // Type assertion needed for Supabase insert operation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("bookings")
      .insert(bookingInsert);

    if (error) {
      console.error("[createBooking] Error:", error);
      return { success: false, error: "Failed to create booking. Please try again." };
    }

    revalidatePath(`/guides/${slug}`);
    revalidatePath("/traveler/bookings");

    // Get guide name for success message
    const { data: guideProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", guide.id)
      .single();

    const guideName = (guideProfile as { display_name: string } | null)?.display_name || "the guide";

    // Send email to guide (fire-and-forget, don't await)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   "http://localhost:3000");
    
    // Get city name
    const { data: cityData } = await supabase
      .from("cities")
      .select("name")
      .eq("id", guide.city_id)
      .single();
    
    const cityName = (cityData as { name: string } | null)?.name || "the city";
    const formattedDate = startsAt.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    sendBookingRequestEmail({
      guideUserId: guide.id,
      guideName,
      travelerName: profile.display_name,
      cityName,
      date: formattedDate,
      link: `${baseUrl}/guide/dashboard`,
    }).catch((error) => {
      console.error("[createBooking] Failed to send email:", error);
    });

    return { 
      success: true, 
      guideName
    };
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 space-y-12">
      {/* Hero Section */}
      <section className="space-y-6">
        <div className="flex items-start gap-6">
          {guideWithRelations.profile.avatar_url ? (
            <Image
              src={guideWithRelations.profile.avatar_url}
              alt={guideWithRelations.profile.display_name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
              <span className="text-3xl font-medium text-muted-foreground">
                {guideWithRelations.profile.display_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">
                {guideWithRelations.profile.display_name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {guideWithRelations.city.name}
                {guideWithRelations.city.country_name && `, ${guideWithRelations.city.country_name}`}
              </p>
            </div>
            {guideWithRelations.headline && (
              <p className="text-lg text-foreground">{guideWithRelations.headline}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {guideWithRelations.themes?.map((theme, idx) => (
                <Badge key={idx} variant="secondary">
                  {formatTheme(theme)}
                </Badge>
              ))}
            </div>
            {guideWithRelations.languages && guideWithRelations.languages.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Speaks: {guideWithRelations.languages.join(", ")}
              </p>
            )}
            {guideWithRelations.hourly_rate && (
              <p className="text-xl font-semibold text-foreground">
                From ${parseFloat(guideWithRelations.hourly_rate).toFixed(0)}/hour
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          {guideWithRelations.about && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">About</h2>
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                {guideWithRelations.about}
              </p>
            </section>
          )}

          {/* What We Can Do Together */}
          {guideWithRelations.themes && guideWithRelations.themes.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold tracking-tight">What we can do together</h2>
              <ul className="space-y-2 list-disc list-inside">
                {guideWithRelations.themes.map((theme, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {formatTheme(theme)} experiences
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Booking Form Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Request a booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4 pb-4 border-b">
                Use public meeting points for first meetups. No sexual services are allowed on Rainbow Tour Guides.
              </p>
              {!user ? (
                // Not logged in - show sign in CTA
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Sign in to request a booking with {guideWithRelations.profile.display_name}.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/auth/sign-in">Sign in</Link>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/sign-up?role=traveler" className="text-primary underline">
                      Sign up as a traveler
                    </Link>
                  </p>
                </div>
              ) : userProfile?.role === "traveler" ? (
                // Logged in as traveler - show booking form
                <BookingForm onSubmit={createBooking} guideName={guideWithRelations.profile.display_name} />
              ) : (
                // Logged in as guide or admin - show message
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {userProfile?.role === "guide"
                      ? "Guides cannot request bookings with other guides."
                      : "Admins cannot request bookings. Please use a traveler account."}
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={userProfile?.role === "guide" ? "/guide/dashboard" : "/admin"}>
                      Go to dashboard
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


