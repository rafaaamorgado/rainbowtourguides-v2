import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default async function InboxPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/sign-in');
  }

  // Fetch conversations (bookings)
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      status,
      created_at,
      city:cities(name),
      guide:guides(profile:profiles(id, display_name, avatar_url)),
      traveler:travelers(profile:profiles(id, display_name, avatar_url)) // Assuming we need name of other party
    `)
    .or(`guide_id.eq.${user.id},traveler_id.eq.${user.id}`)
    .order('created_at', { ascending: false });

  // Helper to determine "Other" party
  const getOtherParty = (booking: any) => {
    if (booking.guide.profile.id === user.id) {
       return booking.traveler.profile; // I am guide, show traveler
    }
    return booking.guide.profile; // I am traveler, show guide
  };

  return (
    <div className="container max-w-2xl py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Messages</h1>
      </div>

      <div className="space-y-4">
        {!bookings || bookings.length === 0 ? (
          <div className="text-center p-12 bg-muted/20 rounded-lg">
            No conversations yet.
          </div>
        ) : (
          bookings.map((booking: any) => {
             const other = getOtherParty(booking);
             return (
               <Link href={`/messages/${booking.id}`} key={booking.id} className="block group">
                 <Card className="group-hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center gap-4 py-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={other.avatar_url} />
                        <AvatarFallback>{other.display_name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <CardTitle className="text-base truncate">{other.display_name}</CardTitle>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(booking.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          Booking in {booking.city?.name} • {booking.status}
                        </p>
                      </div>
                    </CardHeader>
                 </Card>
               </Link>
             );
          })
        )}
      </div>
    </div>
  );
}
