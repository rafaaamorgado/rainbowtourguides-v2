import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { sendBookingStatusEmail } from "@/lib/email";
import { getBaseUrl } from "@/lib/url-helpers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const body = await request.json();
    const { status, reason } = body;

    // Validate status
    if (!["accepted", "declined"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be 'accepted' or 'declined'" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Load booking and verify guide ownership
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(
        `
        *,
        traveler:profiles!bookings_traveler_id_fkey(id, full_name),
        guide:guides!bookings_guide_id_fkey(
          id,
          profile:profiles!guides_id_fkey(id, full_name)
        ),
        city:cities!bookings_city_id_fkey(name)
      `
      )
      .eq("id", bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify the user is the guide for this booking
    if (booking.guide_id !== user.id) {
      return NextResponse.json(
        { error: "You are not authorized to update this booking" },
        { status: 403 }
      );
    }

    // Check if booking is still pending
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: `Cannot update booking with status: ${booking.status}` },
        { status: 400 }
      );
    }

    // Update booking status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // Add timestamp for accepted status
    if (status === "accepted") {
      updateData.accepted_at = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", bookingId);

    if (updateError) {
      console.error("Error updating booking:", updateError);
      return NextResponse.json(
        { error: "Failed to update booking" },
        { status: 500 }
      );
    }

    // Send email notification to traveler (fire-and-forget)
    try {
      const travelerName = (booking.traveler as any)?.full_name || "Traveler";
      const guideName = (booking.guide as any)?.profile?.full_name || "Guide";
      const startDate = new Date(booking.start_at);
      const formattedDate = startDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });

      const baseUrl = getBaseUrl();

      sendBookingStatusEmail({
        travelerUserId: booking.traveler_id,
        travelerName,
        guideName,
        status: status as "accepted" | "declined",
        link: `${baseUrl}/traveler/bookings/${bookingId}`,
      }).catch((err) => {
        console.error("Failed to send email:", err);
      });
    } catch (emailError) {
      console.error("Error preparing email:", emailError);
    }

    return NextResponse.json({
      success: true,
      status,
      message: `Booking ${status === "accepted" ? "accepted" : "declined"} successfully`,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
