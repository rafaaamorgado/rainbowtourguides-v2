import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
    Calendar,
    Clock,
    MapPin,
    MessageSquare,
    ChevronRight,
    Star,
    ArrowRight,
    User,
} from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getBookings } from "@/lib/data-service";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export default async function TravelerDashboardPage() {
    const supabase = await createSupabaseServerClient();

    // Get authenticated user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/auth/sign-in");
    }

    // Get profile
    const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    const profile = data as Profile | null;

    if (!profile) {
        redirect("/auth/sign-in");
    }

    // Fetch bookings
    const allBookings = await getBookings(user.id, "traveler");

    // Calculate stats
    const upcomingBookings = allBookings.filter(
        (b) =>
            (b.status === "confirmed" || b.status === "accepted") &&
            new Date(b.date) >= new Date()
    );

    const pendingBookings = allBookings.filter((b) => b.status === "pending");

    const completedBookings = allBookings.filter(
        (b) => b.status === "completed" && new Date(b.date) < new Date()
    );

    const uniqueCities = new Set(
        completedBookings.map((b) => b.city_name)
    ).size;

    // Show max 3 upcoming bookings on dashboard
    const displayUpcoming = upcomingBookings.slice(0, 3);
    const displayPast = completedBookings.slice(0, 3);

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-ink mb-2">
                    Welcome back, {profile.full_name}!
                </h1>
                <p className="text-ink-soft text-lg">
                    Here's what's happening with your bookings
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-emerald-600" />
                        </div>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-ink">
                            {upcomingBookings.length}
                        </p>
                        <p className="text-sm text-ink-soft mt-1">Upcoming tours</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-amber-600" />
                        </div>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-ink">
                            {pendingBookings.length}
                        </p>
                        <p className="text-sm text-ink-soft mt-1">Pending requests</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                    <div>
                        <p className="text-4xl font-bold text-ink">{uniqueCities}</p>
                        <p className="text-sm text-ink-soft mt-1">Cities explored</p>
                    </div>
                </div>
            </div>

            {/* Upcoming Bookings Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-ink">Upcoming Bookings</h2>
                    {upcomingBookings.length > 3 && (
                        <Link
                            href="/traveler/bookings"
                            className="text-brand hover:text-brand-dark flex items-center gap-1 text-sm font-medium"
                        >
                            View all
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    )}
                </div>

                {displayUpcoming.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12">
                        <EmptyState
                            title="No upcoming tours"
                            description="Ready to explore? Browse our verified guides and book your next adventure."
                            icon="calendar"
                            variant="minimal"
                            actionLabel="Find a Guide"
                            actionHref="/cities"
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayUpcoming.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-brand/50 hover:shadow-md transition-all"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 items-center">
                                    {/* Guide Photo */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-pride-lilac to-pride-mint flex-shrink-0">
                                            <div className="w-full h-full flex items-center justify-center text-white font-semibold text-xl">
                                                {booking.guide_name.charAt(0)}
                                            </div>
                                        </div>

                                        {/* Mobile: Guide info inline */}
                                        <div className="md:hidden">
                                            <p className="font-semibold text-ink">
                                                {booking.guide_name}
                                            </p>
                                            <p className="text-sm text-ink-soft flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {booking.city_name}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-2">
                                        {/* Desktop: Guide info */}
                                        <div className="hidden md:block">
                                            <p className="font-semibold text-ink text-lg">
                                                {booking.guide_name}
                                            </p>
                                            <p className="text-sm text-ink-soft flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {booking.city_name}
                                            </p>
                                        </div>

                                        {/* Booking Details */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-ink-soft">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(booking.date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {booking.duration} hours
                                            </div>
                                            <Badge
                                                className={cn(
                                                    "text-xs",
                                                    booking.status === "confirmed" &&
                                                    "bg-emerald-100 text-emerald-700 border-0",
                                                    booking.status === "accepted" &&
                                                    "bg-blue-100 text-blue-700 border-0",
                                                    booking.status === "pending" &&
                                                    "bg-amber-100 text-amber-700 border-0"
                                                )}
                                            >
                                                {booking.status.charAt(0).toUpperCase() +
                                                    booking.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row md:flex-col gap-2">
                                        <Button
                                            asChild
                                            variant="default"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <Link href={`/traveler/bookings/${booking.id}`}>
                                                View Details
                                            </Link>
                                        </Button>
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <Link
                                                href={`/traveler/messages/${booking.id}`}
                                                className="flex items-center gap-2"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                                Message
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Past Bookings Section */}
            {completedBookings.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-ink">Past Experiences</h2>
                        {completedBookings.length > 3 && (
                            <Link
                                href="/traveler/bookings?filter=completed"
                                className="text-brand hover:text-brand-dark flex items-center gap-1 text-sm font-medium"
                            >
                                View all
                                <ChevronRight className="h-4 w-4" />
                            </Link>
                        )}
                    </div>

                    <div className="space-y-4">
                        {displayPast.map((booking) => (
                            <div
                                key={booking.id}
                                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 transition-all"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-6 items-center">
                                    {/* Guide Photo */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-pride-mint to-pride-amber flex-shrink-0">
                                            <div className="w-full h-full flex items-center justify-center text-white font-semibold text-xl">
                                                {booking.guide_name.charAt(0)}
                                            </div>
                                        </div>

                                        {/* Mobile: Guide info inline */}
                                        <div className="md:hidden">
                                            <p className="font-semibold text-ink">
                                                {booking.guide_name}
                                            </p>
                                            <p className="text-sm text-ink-soft flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {booking.city_name}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-2">
                                        {/* Desktop: Guide info */}
                                        <div className="hidden md:block">
                                            <p className="font-semibold text-ink text-lg">
                                                {booking.guide_name}
                                            </p>
                                            <p className="text-sm text-ink-soft flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {booking.city_name}
                                            </p>
                                        </div>

                                        {/* Booking Details */}
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-ink-soft">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(booking.date).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {booking.duration} hours
                                            </div>
                                        </div>

                                        {/* Review Status (mock - would check if reviewed) */}
                                        <div className="flex items-center gap-1 text-sm text-amber-600">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className="h-4 w-4 fill-amber-400 text-amber-400"
                                                />
                                            ))}
                                            <span className="ml-1 text-ink-soft">
                                                Reviewed
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row md:flex-col gap-2">
                                        <Button
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                        >
                                            <Link href={`/traveler/bookings/${booking.id}`}>
                                                View Details
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Quick Actions */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                    href="/cities"
                    className="bg-gradient-to-br from-brand to-pink-500 rounded-2xl p-8 text-white hover:shadow-xl transition-all group"
                >
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Find a Guide</h3>
                            <p className="text-white/90 text-sm leading-relaxed">
                                Explore new cities and connect with verified local guides for
                                your next adventure.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all">
                            Browse cities
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>
                </Link>

                <Link
                    href="/traveler/settings"
                    className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-brand/50 hover:shadow-md transition-all group"
                >
                    <div className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-brand/10 transition-colors">
                            <User className="h-6 w-6 text-ink-soft group-hover:text-brand transition-colors" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-ink mb-2">
                                Manage Profile
                            </h3>
                            <p className="text-ink-soft text-sm leading-relaxed">
                                Update your preferences, payment methods, and personal
                                information.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-ink-soft group-hover:text-brand group-hover:gap-3 transition-all">
                            Go to settings
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>
                </Link>
            </section>
        </div>
    );
}
