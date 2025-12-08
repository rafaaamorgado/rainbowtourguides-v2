import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { requireUser } from "@/lib/auth-helpers";
import type { Database } from "@/types/database";

type Guide = Database["public"]["Tables"]["guides"]["Row"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"];

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { supabase, profile } = await requireUser();

    // Parse request body
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId || typeof bookingId !== "string") {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    // Load booking and verify ownership
    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingError || !bookingData) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    const booking = bookingData as Booking;

    // Verify the booking belongs to the current user
    if (booking.traveler_id !== profile.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Load guide to get hourly_rate
    const { data: guideData, error: guideError } = await supabase
      .from("guides")
      .select("hourly_rate, currency")
      .eq("id", booking.guide_id)
      .single();

    if (guideError || !guideData) {
      return NextResponse.json(
        { error: "Guide not found" },
        { status: 404 }
      );
    }

    const guide = guideData as Pick<Guide, "hourly_rate" | "currency">;

    // Calculate amount
    const hourlyRate = guide.hourly_rate ? parseFloat(guide.hourly_rate) : 50;
    const durationHours = booking.duration_hours || 4;
    const amount = hourlyRate * durationHours;
    const currency = guide.currency || booking.currency || "USD";

    // Get guide name for line item
    const { data: guideProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", booking.guide_id)
      .single();

    const guideName = (guideProfile as { display_name: string } | null)?.display_name || "Guide";

    // Initialize Stripe
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("[create-session] STRIPE_SECRET_KEY is not set");
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-02-24.acacia",
    });

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   "http://localhost:3000");

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Rainbow Tour Guides – Private tour with ${guideName}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/traveler/bookings?session={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/traveler/bookings?cancelled=1`,
      metadata: {
        booking_id: bookingId,
      },
    });

    // Store checkout session ID on booking
    const bookingUpdate: Database["public"]["Tables"]["bookings"]["Update"] = {
      stripe_checkout_session_id: session.id,
    };

    // Type assertion needed for Supabase update operation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("bookings")
      .update(bookingUpdate)
      .eq("id", bookingId);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[create-session] Error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

