import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

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

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Server action to create a booking
  async function createBooking(formData: FormData): Promise<{ success: boolean; error?: string }> {
    "use server";

    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in to request a booking." };
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return { success: false, error: "Profile not found." };
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
    const { data: guide } = await supabase
      .from("guides")
      .select("*")
      .eq("slug", slug)
      .single();

    if (!guide) {
      return { success: false, error: "Guide not found." };
    }

    // Calculate price (using hourly_rate if available, otherwise use a default)
    const hourlyRate = guide.hourly_rate ? parseFloat(guide.hourly_rate) : 50;
    const priceTotal = (hourlyRate * durationHours).toFixed(2);

    // Create booking
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from("bookings").insert({
      traveler_id: user.id,
      guide_id: guide.id,
      city_id: guide.city_id,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      duration_hours: durationHours,
      notes: notes || null,
      price_total: priceTotal,
      currency: guide.currency || "USD",
      status: "pending",
    });

    if (error) {
      console.error("[createBooking] Error:", error);
      return { success: false, error: "Failed to create booking. Please try again." };
    }

    revalidatePath(`/guides/${slug}`);
    revalidatePath("/traveler/bookings");

    return { success: true };
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
              {user ? (
                <BookingForm onSubmit={createBooking} />
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Sign in to request a booking with {guideWithRelations.profile.display_name}.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/auth/sign-in">Sign in</Link>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/sign-up" className="text-primary underline">
                      Sign up
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Client component for the booking form
function BookingForm({
  onSubmit,
}: {
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}) {
  return (
    <form
      action={async (formData: FormData) => {
        const result = await onSubmit(formData);
        if (result.success) {
          // Redirect to bookings page on success
          redirect("/traveler/bookings?booking_created=true");
        } else if (result.error) {
          alert(result.error);
        }
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <label htmlFor="date" className="text-sm font-medium">
          Date
        </label>
        <Input id="date" name="date" type="date" required />
      </div>

      <div className="space-y-2">
        <label htmlFor="time" className="text-sm font-medium">
          Time
        </label>
        <Input id="time" name="time" type="time" required />
      </div>

      <div className="space-y-2">
        <label htmlFor="duration" className="text-sm font-medium">
          Duration (hours)
        </label>
        <Input
          id="duration"
          name="duration"
          type="number"
          min="1"
          max="12"
          step="0.5"
          defaultValue="4"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes (optional)
        </label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any special requests or information for the guide..."
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full">
        Send booking request
      </Button>

      <p className="text-xs text-muted-foreground">
        Your request will be sent to the guide for approval. You&apos;ll be notified once they respond.
      </p>
    </form>
  );
}

