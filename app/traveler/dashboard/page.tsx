import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, MapPin } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function TravelerDashboardPage() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
      id,
      status,
      start_at,
      duration_hours,
      price_total,
      currency,
      guide:guides (
         profile:profiles (full_name)
      ),
      city:cities (name)
    `)
        .eq('traveler_id', user?.id)
        .order('created_at', { ascending: false });

    return (
        <div className="container py-10 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">My Trips</h1>
                <p className="text-muted-foreground">Manage your booking requests and upcoming tours.</p>
            </div>

            <div className="grid gap-6">
                {!bookings || bookings.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-lg">
                        <p className="text-lg font-medium">No bookings yet</p>
                        <Button asChild className="mt-4">
                            <Link href="/">Find a Guide</Link>
                        </Button>
                    </div>
                ) : (
                    bookings.map((booking: any) => (
                        <Card key={booking.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg">
                                        {booking.guide?.profile?.full_name} in {booking.city?.name}
                                    </CardTitle>
                                    <div className="flex items-center text-sm text-muted-foreground gap-1">
                                        <CalendarClock className="h-4 w-4" />
                                        {format(new Date(booking.start_at), 'PPP')} • {booking.duration_hours}h
                                    </div>
                                </div>
                                <Badge variant={
                                    booking.status === 'confirmed' ? 'default' :
                                        booking.status === 'pending' ? 'secondary' : 'outline'
                                }>
                                    {booking.status.toUpperCase()}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-end border-t pt-4 mt-2">
                                    <div className="text-sm">
                                        Total: <span className="font-semibold">{booking.price_total} {booking.currency}</span>
                                    </div>
                                    {booking.status === 'accepted' && (
                                        <Button size="sm">Pay Now</Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
