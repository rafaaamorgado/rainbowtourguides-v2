import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Shield, Heart, Globe } from "lucide-react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function Home() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { cookies: { getAll: () => cookieStore.getAll(), setAll: () => { } } }
    );

    // Fetch some featured cities
    const { data: featuredCities } = await supabase
        .from('cities')
        .select('*')
        .limit(3);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[600px] flex items-center justify-center bg-zinc-900 text-white overflow-hidden">
                {/* Background Overlay or Image */}
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-90" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1570191913384-71ab4aba9f58?q=80&w=2000')] bg-cover bg-center opacity-20 mix-blend-overlay" />

                <div className="relative container z-10 text-center space-y-8 px-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        Explore the World with <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-yellow-500">Pride</span>
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-200 max-w-2xl mx-auto">
                        Connect with verified local LGBTQ+ guides who know the real city.
                        Safe, authentic, and unforgettable travel experiences.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input
                                placeholder="Where are you going? (e.g. Lisbon, Bangkok)"
                                className="pl-10 h-12 bg-white text-zinc-900 border-0 focus-visible:ring-offset-2"
                            />
                        </div>
                        <Button size="lg" className="h-12 px-8 bg-pink-600 hover:bg-pink-700 font-semibold w-full sm:w-auto">
                            Search
                        </Button>
                    </div>

                    <div className="pt-4 flex items-center justify-center gap-6 text-sm font-medium text-zinc-300">
                        <span className="flex items-center gap-1"><Shield className="h-4 w-4" /> Verified Guides</span>
                        <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> Safe Spaces</span>
                    </div>
                </div>
            </section>

            {/* Featured Cities */}
            <section className="py-20 bg-background">
                <div className="container px-4">
                    <div className="text-center mb-12 space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Popular Destinations</h2>
                        <p className="text-muted-foreground">Trending cities in our community</p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {featuredCities && featuredCities.length > 0 ? (
                            featuredCities.map((city) => (
                                <Link href={`/cities/${city.slug}`} key={city.id} className="group cursor-pointer">
                                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-xl transition-all duration-300">
                                        <div className="absolute inset-0 bg-zinc-200" />
                                        {/* Image placeholder - normally from DB */}
                                        <div className={`absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end text-white`}>
                                            <h3 className="text-2xl font-bold group-hover:translate-x-2 transition-transform">{city.name}</h3>
                                            <p className="text-sm opacity-90 group-hover:translate-x-2 transition-transform">{city.country_name}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
                            ))
                        )}

                        {/* Fallback hardcoded if DB empty during demo */}
                        {(!featuredCities || featuredCities.length === 0) && (
                            <>
                                <Link href="/cities/lisbon" className="group cursor-pointer">
                                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-xl transition-all duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500" />
                                        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                                            <h3 className="text-2xl font-bold">Lisbon</h3>
                                            <p className="text-sm opacity-90">Portugal</p>
                                        </div>
                                    </div>
                                </Link>
                                <Link href="/cities/london" className="group cursor-pointer">
                                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-xl transition-all duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500" />
                                        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                                            <h3 className="text-2xl font-bold">London</h3>
                                            <p className="text-sm opacity-90">United Kingdom</p>
                                        </div>
                                    </div>
                                </Link>
                                <Link href="/cities/bangkok" className="group cursor-pointer">
                                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-xl transition-all duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500" />
                                        <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                                            <h3 className="text-2xl font-bold">Bangkok</h3>
                                            <p className="text-sm opacity-90">Thailand</p>
                                        </div>
                                    </div>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Value Proposition */}
            <section className="py-20 bg-muted/30">
                <div className="container px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold tracking-tight">Why Rainbow Tour Guides?</h2>
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="mt-1 bg-primary/10 p-2 rounded-lg h-10 w-10 flex items-center justify-center text-primary">
                                        <Shield className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Safe & Inclusive</h3>
                                        <p className="text-muted-foreground">Every guide signs our robust Code of Conduct. We prioritize safety and inclusivity above all.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 bg-primary/10 p-2 rounded-lg h-10 w-10 flex items-center justify-center text-primary">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Local Expertise</h3>
                                        <p className="text-muted-foreground">Discover hidden gems, queer history, and the best local spots that aren't in the guidebooks.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="mt-1 bg-primary/10 p-2 rounded-lg h-10 w-10 flex items-center justify-center text-primary">
                                        <Globe className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Community Driven</h3>
                                        <p className="text-muted-foreground">Support local LGBTQ+ individuals directly. We take a minimal fee to keep the platform running.</p>
                                    </div>
                                </div>
                            </div>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/about">Learn more about us</Link>
                            </Button>
                        </div>
                        <div className="relative aspect-square md:aspect-auto h-[500px] rounded-2xl overflow-hidden shadow-2xl bg-zinc-800">
                            {/* Decorative image */}
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 z-10" />
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                                (Lifestyle Image Placeholder)
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-zinc-900 text-white text-center">
                <div className="container px-4 space-y-8">
                    <h2 className="text-3xl md:text-5xl font-bold">Ready to explore?</h2>
                    <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
                        Join thousands of travelers discovering the world with pride.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="h-14 px-8 text-lg" asChild>
                            <Link href="/cities">Find a Guide</Link>
                        </Button>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg text-zinc-900 border-white hover:bg-zinc-100" asChild>
                            <Link href="/guide/onboarding">Become a Guide</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
