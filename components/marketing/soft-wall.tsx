'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SoftWallProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  blur?: boolean;
  className?: string;
  ctaText?: string;
  role?: 'traveler' | 'guide';
}

export function SoftWall({
  children,
  title = "Sign up to unlock full details",
  description = "Create a free account to view pricing, reviews, and detailed availability.",
  blur = true,
  className,
  ctaText = "Join to Unlock",
  role = 'traveler',
}: SoftWallProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Content to be blurred */}
      <div className={cn("transition-all duration-300", blur && "filter blur-md select-none opacity-50 pointer-events-none")}>
        {children || (
          // Default placeholder content if no children provided
          <div className="space-y-4 p-6 bg-muted/20">
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="h-24 bg-muted animate-pulse rounded" />
              <div className="h-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
        )}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 p-6 text-center backdrop-blur-[2px]">
        <div className="rounded-full bg-background p-4 shadow-lg mb-4">
          <Lock className="h-6 w-6 text-brand" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs mb-6">
          {description}
        </p>
        <Button asChild size="lg" className="rounded-full font-semibold shadow-md">
          <Link href={`/auth/sign-up?role=${role}`}>
            {ctaText}
          </Link>
        </Button>
        <div className="mt-4 text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/sign-in" className="underline hover:text-foreground">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
