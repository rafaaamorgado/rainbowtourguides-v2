'use client';

import * as React from 'react';
import {
  Skeleton as HeroSkeleton,
  SkeletonProps as HeroSkeletonProps,
} from '@heroui/react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends HeroSkeletonProps {
  count?: number;
  variant?: 'card' | 'list' | 'profile' | 'dashboard';
}

/**
 * Skeleton component - HeroUI wrapper with project defaults
 *
 * Migration notes:
 * - Replaces custom loading-skeleton with HeroUI Skeleton
 * - Simpler API for common loading patterns
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, count = 1, variant, ...props }, ref) => {
    // Helper to get dimensions based on variant
    const getVariantClass = () => {
      switch (variant) {
        case 'card':
          return 'h-64 w-full';
        case 'list':
          return 'h-20 w-full';
        case 'profile':
          return 'h-12 w-12 rounded-full';
        case 'dashboard':
          return 'h-32 w-full';
        default:
          return 'h-4 w-full';
      }
    };

    if (count === 1) {
      return (
        <HeroSkeleton
          ref={ref}
          className={cn(getVariantClass(), className)}
          {...props}
        />
      );
    }

    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <HeroSkeleton
            key={i}
            className={cn(getVariantClass(), className)}
            {...props}
          />
        ))}
      </div>
    );
  },
);

Skeleton.displayName = 'Skeleton';

// Backward compatibility exports
export const LoadingSkeleton = Skeleton;
export const CardSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border bg-card shadow-md p-6 space-y-4',
      className,
    )}
    {...props}
  >
    <Skeleton className="h-48 w-full rounded-xl" />
    <Skeleton className="h-6 w-3/4" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
));
CardSkeleton.displayName = 'CardSkeleton';

export const ListSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { count?: number }
>(({ className, count = 3, ...props }, ref) => (
  <div ref={ref} className={cn('space-y-3', className)} {...props}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-4 rounded-2xl border bg-card"
      >
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
));
ListSkeleton.displayName = 'ListSkeleton';

export const ProfileSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border bg-card shadow-md p-6 space-y-6',
      className,
    )}
    {...props}
  >
    <div className="flex items-center gap-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  </div>
));
ProfileSkeleton.displayName = 'ProfileSkeleton';

export const DashboardSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { count?: number }
>(({ className, count = 4, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4',
      className,
    )}
    {...props}
  >
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="rounded-2xl border bg-card shadow-md p-6 space-y-3"
      >
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-3 w-full" />
      </div>
    ))}
  </div>
));
DashboardSkeleton.displayName = 'DashboardSkeleton';

export { Skeleton };
