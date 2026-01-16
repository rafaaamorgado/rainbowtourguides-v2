import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GuideBookingsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
                <p className="text-muted-foreground">
                    Manage your booking requests and upcoming tours.
                </p>
            </div>

            <Tabs defaultValue="requests" className="w-full">
                <TabsList>
                    <TabsTrigger value="requests">Requests</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                    <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                </TabsList>
                <TabsContent value="requests" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Requests</CardTitle>
                            <CardDescription>
                                Respond to these requests within 24 hours.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-40 items-center justify-center text-muted-foreground">
                                No pending requests.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="upcoming" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Tours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex h-40 items-center justify-center text-muted-foreground">
                                No upcoming tours scheduled.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                {/* Other tabs similar structure */}
            </Tabs>
        </div>
    );
}
