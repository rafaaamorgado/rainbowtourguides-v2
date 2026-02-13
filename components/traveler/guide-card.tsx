'use client';

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";

interface GuideCardProps {
    guide: {
        slug: string | null;
        display_name: string;
        avatar_url: string | null;
        tagline: string | null;
        city_name: string;
        specialties?: string[];
        price_start?: number;
        currency?: string;
    };
}

export function GuideCard({ guide }: GuideCardProps) {
    // Use slug if available, otherwise fallback (though slug should be enforced for public guides)
    const href = guide.slug ? `/guides/${guide.slug}` : '#';

    return (
        <div className="flex flex-col rounded-lg border border-border bg-card text-card-foreground shadow-none overflow-hidden hover:shadow-warm-md transition-shadow">
            <div className="p-6 pb-4 flex flex-col items-center text-center space-y-4">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={guide.avatar_url || ''} alt={guide.display_name} />
                    <AvatarFallback>{guide.display_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                    <h3 className="font-display font-semibold text-xl leading-none tracking-tight">
                        {guide.display_name}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <MapPin className="h-3 w-3" /> {guide.city_name}
                    </p>
                </div>

                {guide.tagline && (
                    <p className="text-sm italic text-muted-foreground line-clamp-2 min-h-[2.5em]">
                        "{guide.tagline}"
                    </p>
                )}

                <div className="flex flex-wrap gap-2 justify-center">
                    {guide.specialties?.slice(0, 3).map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="mt-auto border-t p-4 flex items-center justify-between">
                <div className="text-sm font-medium">
                    {guide.price_start ? (
                        <span>
                            From {guide.price_start} {guide.currency}
                        </span>
                    ) : (
                        <span>Rates varies</span>
                    )}
                </div>
                <Button size="sm" asChild>
                    <Link href={href}>View Profile</Link>
                </Button>
            </div>
        </div>
    );
}
