import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Star, ShieldCheck, MapPin, Languages, Clock } from "lucide-react";
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

  const isVerified = guideWithRelations.status === "approved";
  const rating = (guideWithRelations as any).rating_avg || 5.0;
  const hourlyRate = guideWithRelations.hourly_rate ? parseFloat(guideWithRelations.hourly_rate) : 50;

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
    <div className="pb-16">
      {/* Hero Section with Avatar */}
      <section className="relative h-[50vh] min-h-[400px] bg-slate-950 overflow-hidden">
        {guideWithRelations.profile.avatar_url ? (
          <>
            <Image
              src={guideWithRelations.profile.avatar_url}
              alt={guideWithRelations.profile.display_name}
              fill
              className="object-cover opacity-40 filter grayscale-[30%]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
        )}

        <div className="absolute inset-0 flex items-end">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex items-end gap-6">
              {/* Large Avatar Circle */}
              <div className="relative">
                {guideWithRelations.profile.avatar_url ? (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl">
                    <Image
                      src={guideWithRelations.profile.avatar_url}
                      alt={guideWithRelations.profile.display_name}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 bg-slate-800 flex items-center justify-center shadow-2xl">
                    <span className="text-5xl md:text-6xl font-bold text-white">
                      {guideWithRelations.profile.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-brand p-2 rounded-full shadow-lg">
                    <ShieldCheck size={20} className="text-white" />
                  </div>
                )}
              </div>

              {/* Name and Location */}
              <div className="flex-1 pb-2">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">
                  {guideWithRelations.profile.display_name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/80">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span className="text-sm font-medium">
                      {guideWithRelations.city.name}
                      {guideWithRelations.city.country_name && `, ${guideWithRelations.city.country_name}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                    <Star size={14} className="fill-brand text-brand" />
                    <span className="text-sm font-bold">{rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Headline Card */}
            {guideWithRelations.headline && (
              <Card className="bg-white shadow-lg">
                <CardContent className="p-8">
                  <p className="text-xl font-light text-slate-700 leading-relaxed">
                    {guideWithRelations.headline}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Key Info Grid */}
            <div className="grid sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center">
                      <Clock size={24} className="text-brand" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">Starting at</p>
                  <p className="text-2xl font-bold text-slate-900">${hourlyRate}/hr</p>
                </CardContent>
              </Card>

              {guideWithRelations.languages && guideWithRelations.languages.length > 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center">
                        <Languages size={24} className="text-brand" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">Languages</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {guideWithRelations.languages.join(", ")}
                    </p>
                  </CardContent>
                </Card>
              )}

              {guideWithRelations.themes && guideWithRelations.themes.length > 0 && (
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 bg-brand/10 rounded-2xl flex items-center justify-center">
                        <Star size={24} className="text-brand" />
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">Specialties</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {guideWithRelations.themes.length} themes
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* About Section */}
            {guideWithRelations.about && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-serif font-bold">About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 font-light leading-relaxed whitespace-pre-wrap">
                    {guideWithRelations.about}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Themes Section */}
            {guideWithRelations.themes && guideWithRelations.themes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-3xl font-serif font-bold">
                    What We Can Do Together
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {guideWithRelations.themes.map((theme, idx) => (
                      <Badge key={idx} variant="outline" className="text-sm px-4 py-2">
                        {formatTheme(theme)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-serif">Book an Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    ⚠️ Use public meeting points for first meetups. No sexual services are allowed
                    on Rainbow Tour Guides.
                  </p>
                </div>
                {!user ? (
                  // Not logged in - show sign in CTA
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Sign in to request a booking with {guideWithRelations.profile.display_name}.
                    </p>
                    <Button asChild className="w-full" size="lg">
                      <Link href="/auth/sign-in">Sign in</Link>
                    </Button>
                    <p className="text-xs text-slate-600 text-center">
                      Don&apos;t have an account?{" "}
                      <Link href="/auth/sign-up?role=traveler" className="text-brand font-semibold underline">
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
                    <p className="text-sm text-slate-600">
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
    </div>
  );
}
