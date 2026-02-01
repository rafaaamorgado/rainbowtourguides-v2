import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-helpers";
import { isMessagingEnabled } from "@/lib/messaging-rules";
import { ChatWindow } from "@/components/messaging/chat-window";
import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ threadId: string }>;
}

export default async function GuideMessageThreadPage({ params }: PageProps) {
  const { supabase, user } = await requireRole("guide");
  const { threadId } = await params;

  // Fetch booking with traveler name and city — threadId is the booking_id
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      traveler_id,
      guide_id,
      traveler:profiles!bookings_traveler_id_fkey(full_name),
      city:cities!bookings_city_id_fkey(name)
    `
    )
    .eq("id", threadId)
    .single();

  if (bookingError || !booking) {
    notFound();
  }

  // Ownership check: user must be the guide
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookingData = booking as any;
  if (bookingData.guide_id !== user.id) {
    notFound();
  }

  // Messaging gate: only confirmed or completed
  if (!isMessagingEnabled(bookingData.status)) {
    const travelerName = bookingData.traveler?.full_name || "the traveler";
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/guide/messages">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-ink">Message {travelerName}</h1>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 min-h-[300px] flex flex-col items-center justify-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
            <Lock className="h-5 w-5 text-ink-soft" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ink">Messaging not available yet</h2>
            <p className="text-ink-soft mt-1 max-w-md">
              Messaging unlocks once the booking is confirmed. The traveler needs to complete payment first.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/guide/bookings">View Bookings</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Fetch messages for the booking
  const { data: messages } = await supabase
    .from("messages")
    .select(
      `
      id,
      text,
      sender_id,
      created_at,
      sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
    `
    )
    .eq("booking_id", threadId)
    .order("created_at", { ascending: true });

  const travelerName = bookingData.traveler?.full_name || "Traveler";
  const cityName = bookingData.city?.name || "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/guide/messages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-ink">Chat with {travelerName}</h1>
          {cityName && <p className="text-sm text-ink-soft">{cityName}</p>}
        </div>
      </div>

      <ChatWindow
        bookingId={threadId}
        currentUserId={user.id}
        initialMessages={(messages as any[]) || []}
      />
    </div>
  );
}
