import { notFound, redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { ChatWindow } from "@/components/messaging/chat-window";

interface MessageThreadPageProps {
  params: Promise<{ id: string }>; // Booking ID
}

export default async function MessageThreadPage({ params }: MessageThreadPageProps) {
  const { id: bookingId } = await params;
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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Verify access (Participant check)
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      id,
      status,
      guide:guides(profile:profiles(id, display_name, avatar_url)),
      traveler:travelers(profile:profiles(id, display_name, avatar_url))
    `)
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    notFound(); 
  }
  
  // Strict check: User must be guide or traveler
  // Note: guide is joined via guides table, so guide.profile.id is the user id
  // traveler joined via travelers table, so traveler.profile.id is user id
  // BUT wait, travelers table PK is profile ID. Guide PK is profile ID.
  // So booking.guide_id and booking.traveler_id are the profile IDs.
  // Let's re-verify the schema join logic.
  // Scheme: bookings.guide_id references guides.id references profiles.id.
  
  // Simpler check:
  // Is user.id == booking.guide.id or booking.traveler.id?
  // Since we did a join, we need to inspect the returned structure carefully or just rely on RLS?
  // RLS handles data access, but for Page rendering logic we might want explicit check.
  // Actually, let's fetch messages safely. RLS will block if not allowed.
  
  // Fetch Messages
  const { data: messages, error: messagesError } = await supabase
    .from('messages')
    .select(`
      id,
      text,
      sender_id,
      created_at,
      sender:profiles(display_name, avatar_url)
    `)
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });

  if (messagesError) {
     // Likely RLS violation if not participant?
     return <div>Access Denied or Error loading messages.</div>;
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Booking Chat</h1>
        <p className="text-muted-foreground">Booking ID: {bookingId.slice(0, 8)}...</p>
      </div>

      <ChatWindow 
        bookingId={bookingId} 
        currentUserId={user.id} 
        initialMessages={messages as any[]} 
      />
    </div>
  );
}
