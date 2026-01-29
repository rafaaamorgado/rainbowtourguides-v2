import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth-helpers";
import { getStripe } from "@/lib/stripe";
import { getBaseUrl } from "@/lib/url-helpers";
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

    // Load guide to get pricing
    // Note: New schema uses price_4h, price_6h, price_8h instead of hourly_rate
    const { data: guideData, error: guideError } = await supabase
      .from("guides")
      .select("price_4h, price_6h, price_8h, currency")
      .eq("id", booking.guide_id)
      .single();

    if (guideError || !guideData) {
      return NextResponse.json(
        { error: "Guide not found" },
        { status: 404 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guide = guideData as any;

    // Calculate amount based on duration
    // TODO: Use price from booking.price_total if available, otherwise calculate from guide prices
    const durationHours = booking.duration_hours || 4;
    let amount = 0;
    if (durationHours <= 4) {
      amount = guide.price_4h ? parseFloat(guide.price_4h.toString()) : 0;
    } else if (durationHours <= 6) {
      amount = guide.price_6h ? parseFloat(guide.price_6h.toString()) : 0;
    } else {
      amount = guide.price_8h ? parseFloat(guide.price_8h.toString()) : 0;
    }

    // Fallback to booking price_total if guide prices not set
    if (amount === 0) {
      amount = parseFloat(booking.price_total.toString());
    }

    const currency = guide.currency || booking.currency || "USD";

    // Get guide name for line item
    const { data: guideProfile } = await supabase
      .from("profiles")
      .select("full_name") // ⚠️ full_name, not display_name
      .eq("id", booking.guide_id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guideName = (guideProfile as any)?.full_name || "Guide";

    // Initialize Stripe
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    // Get base URL
    const baseUrl = getBaseUrl();

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
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

