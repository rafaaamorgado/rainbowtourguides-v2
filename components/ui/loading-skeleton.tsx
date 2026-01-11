import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const skeletonVariants = cva("animate-pulse bg-slate-200/60 rounded-2xl", {
  variants: {
    variant: {
      card: "h-64 w-full",
      list: "h-20 w-full",
      profile: "h-12 w-12 rounded-full",
      dashboard: "h-32 w-full",
    },
  },
  defaultVariants: {
    variant: "card",
  },
});

export interface LoadingSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  count?: number;
}

/**
 * LoadingSkeleton - Reusable skeleton loader with brand styling
 * 
 * @example
 * <LoadingSkeleton variant="card" count={3} />
 * <LoadingSkeleton variant="profile" />
 */
const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ className, variant, count = 1, ...props }, ref) => {
    if (count === 1) {
      return (
        <div
          ref={ref}
          className={cn(skeletonVariants({ variant }), className)}
          {...props}
        />
      );
    }

    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(skeletonVariants({ variant }), className)}
            {...props}
          />
        ))}
      </div>
    );
  }
);
LoadingSkeleton.displayName = "LoadingSkeleton";

/**
 * CardSkeleton - Specialized card skeleton with internal structure
 */
export const CardSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-2xl border bg-card shadow-md p-6 space-y-4",
      className
    )}
    {...props}
  >
    <div className="animate-pulse space-y-4">
      {/* Image placeholder */}
      <div className="h-48 w-full bg-slate-200/60 rounded-xl" />
      
      {/* Title */}
      <div className="h-6 w-3/4 bg-slate-200/60 rounded-lg" />
      
      {/* Description lines */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-200/60 rounded" />
        <div className="h-4 w-5/6 bg-slate-200/60 rounded" />
      </div>
      
      {/* Footer */}
      <div className="flex gap-2 pt-2">
        <div className="h-8 w-20 bg-slate-200/60 rounded-full" />
        <div className="h-8 w-20 bg-slate-200/60 rounded-full" />
      </div>
    </div>
  </div>
));
CardSkeleton.displayName = "CardSkeleton";

/**
 * ListSkeleton - Specialized list item skeleton
 */
export const ListSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { count?: number }
>(({ className, count = 3, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-3", className)} {...props}>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-4 p-4 rounded-2xl border bg-card shadow-sm"
      >
        <div className="animate-pulse flex items-center gap-4 w-full">
          {/* Avatar */}
          <div className="h-12 w-12 bg-slate-200/60 rounded-full flex-shrink-0" />
          
          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-slate-200/60 rounded" />
            <div className="h-3 w-1/2 bg-slate-200/60 rounded" />
          </div>
          
          {/* Action */}
          <div className="h-8 w-24 bg-slate-200/60 rounded-full flex-shrink-0" />
        </div>
      </div>
    ))}
  </div>
));
ListSkeleton.displayName = "ListSkeleton";

/**
 * ProfileSkeleton - Specialized profile skeleton
 */
export const ProfileSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-2xl border bg-card shadow-md p-6", className)}
    {...props}
  >
    <div className="animate-pulse space-y-6">
      {/* Header with avatar and name */}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 bg-slate-200/60 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-6 w-1/2 bg-slate-200/60 rounded" />
          <div className="h-4 w-1/3 bg-slate-200/60 rounded" />
        </div>
      </div>
      
      {/* Bio */}
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-200/60 rounded" />
        <div className="h-4 w-full bg-slate-200/60 rounded" />
        <div className="h-4 w-3/4 bg-slate-200/60 rounded" />
      </div>
      
      {/* Tags */}
      <div className="flex gap-2 flex-wrap">
        <div className="h-6 w-16 bg-slate-200/60 rounded-full" />
        <div className="h-6 w-20 bg-slate-200/60 rounded-full" />
        <div className="h-6 w-24 bg-slate-200/60 rounded-full" />
      </div>
      
      {/* Stats */}
      <div className="flex gap-4 pt-4 border-t">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-12 bg-slate-200/60 rounded" />
          <div className="h-6 w-16 bg-slate-200/60 rounded" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-12 bg-slate-200/60 rounded" />
          <div className="h-6 w-16 bg-slate-200/60 rounded" />
        </div>
      </div>
    </div>
  </div>
));
ProfileSkeleton.displayName = "ProfileSkeleton";

/**
 * DashboardSkeleton - Specialized dashboard card skeleton
 */
export const DashboardSkeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { count?: number }
>(({ className, count = 4, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)}
    {...props}
  >
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="rounded-2xl border bg-card shadow-md p-6"
      >
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-1/2 bg-slate-200/60 rounded" />
          <div className="h-8 w-3/4 bg-slate-200/60 rounded" />
          <div className="h-3 w-full bg-slate-200/60 rounded" />
        </div>
      </div>
    ))}
  </div>
));
DashboardSkeleton.displayName = "DashboardSkeleton";

export { LoadingSkeleton, skeletonVariants };

