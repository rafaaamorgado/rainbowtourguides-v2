import * as React from "react";
import Link from "next/link";
import { Sparkles, Search, MapPin, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Title for the empty state
   */
  title: string;
  
  /**
   * Description text
   */
  description: string;
  
  /**
   * Optional icon (uses default sparkles if not provided)
   */
  icon?: "sparkles" | "search" | "map" | "heart" | "users" | React.ReactNode;
  
  /**
   * Optional CTA button label
   */
  actionLabel?: string;
  
  /**
   * Optional CTA button link
   */
  actionHref?: string;
  
  /**
   * Optional secondary action
   */
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  
  /**
   * Variant styling
   */
  variant?: "default" | "minimal" | "card";
}

const iconMap = {
  sparkles: Sparkles,
  search: Search,
  map: MapPin,
  heart: Heart,
  users: Users,
};

/**
 * EmptyState - Premium empty state component with warm, friendly microcopy
 * 
 * @example
 * <EmptyState 
 *   title="No guides here... yet" 
 *   description="Try another city or join our waitlist to be notified when guides become available."
 *   icon="map"
 *   actionLabel="Explore other cities"
 *   actionHref="/cities"
 * />
 */
export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      title,
      description,
      icon = "sparkles",
      actionLabel,
      actionHref,
      secondaryActionLabel,
      secondaryActionHref,
      variant = "default",
      ...props
    },
    ref
  ) => {
    const isCard = variant === "card";
    const isMinimal = variant === "minimal";

    // Determine icon component
    let IconComponent: React.ElementType = Sparkles;
    let customIcon: React.ReactNode = null;

    if (typeof icon === "string") {
      IconComponent = iconMap[icon as keyof typeof iconMap] || Sparkles;
    } else {
      customIcon = icon;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center",
          isCard && "rounded-2xl border bg-card shadow-md p-8",
          !isCard && !isMinimal && "py-16 px-4",
          isMinimal && "py-8 px-4",
          className
        )}
        {...props}
      >
        {/* Icon */}
        <div
          className={cn(
            "mb-4 rounded-full bg-gradient-to-br from-pink-50 to-rose-50 p-4",
            isMinimal && "mb-3 p-3"
          )}
        >
          {customIcon ? (
            <div className="h-6 w-6 text-brand">{customIcon}</div>
          ) : (
            IconComponent && (
              <IconComponent
                className={cn(
                  "text-brand",
                  isMinimal ? "h-5 w-5" : "h-6 w-6"
                )}
              />
            )
          )}
        </div>

        {/* Title */}
        <h3
          className={cn(
            "font-semibold text-slate-900 mb-2 max-w-md",
            isMinimal ? "text-base" : "text-xl tracking-tight"
          )}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          className={cn(
            "text-muted-foreground max-w-md leading-relaxed",
            isMinimal ? "text-sm mb-4" : "text-sm mb-6"
          )}
        >
          {description}
        </p>

        {/* Actions */}
        {(actionLabel || secondaryActionLabel) && (
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {actionLabel && actionHref && (
              <Button asChild variant="default" size={isMinimal ? "sm" : "default"}>
                <Link href={actionHref}>{actionLabel}</Link>
              </Button>
            )}
            
            {secondaryActionLabel && secondaryActionHref && (
              <Button
                asChild
                variant="outline"
                size={isMinimal ? "sm" : "default"}
              >
                <Link href={secondaryActionHref}>{secondaryActionLabel}</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";

/**
 * NoGuidesEmptyState - Pre-configured for empty guide lists
 */
export const NoGuidesEmptyState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "title" | "description" | "icon"> & { cityName?: string }
>(({ cityName, ...props }, ref) => (
  <EmptyState
    ref={ref}
    title={cityName ? `No guides in ${cityName}... yet` : "No guides here... yet"}
    description="We're growing our community of trusted local guides. Check back soon or explore other destinations."
    icon="map"
    actionLabel="Explore other cities"
    actionHref="/cities"
    secondaryActionLabel="Become a guide"
    secondaryActionHref="/guide/onboarding"
    {...props}
  />
));
NoGuidesEmptyState.displayName = "NoGuidesEmptyState";

/**
 * NoBookingsEmptyState - Pre-configured for empty booking lists
 */
export const NoBookingsEmptyState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "title" | "description" | "icon">
>(({ ...props }, ref) => (
  <EmptyState
    ref={ref}
    title="No bookings yet"
    description="Start your adventure by booking an experience with one of our amazing local guides."
    icon="sparkles"
    actionLabel="Browse guides"
    actionHref="/cities"
    {...props}
  />
));
NoBookingsEmptyState.displayName = "NoBookingsEmptyState";

/**
 * NoSavedEmptyState - Pre-configured for empty saved/favorites lists
 */
export const NoSavedEmptyState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "title" | "description" | "icon">
>(({ ...props }, ref) => (
  <EmptyState
    ref={ref}
    title="No saved guides yet"
    description="Bookmark your favorite guides to easily find them later and plan your perfect trip."
    icon="heart"
    actionLabel="Discover guides"
    actionHref="/cities"
    {...props}
  />
));
NoSavedEmptyState.displayName = "NoSavedEmptyState";

/**
 * NoResultsEmptyState - Pre-configured for empty search results
 */
export const NoResultsEmptyState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "title" | "description" | "icon"> & { searchQuery?: string }
>(({ searchQuery, ...props }, ref) => (
  <EmptyState
    ref={ref}
    title="No results found"
    description={
      searchQuery
        ? `We couldn't find any matches for "${searchQuery}". Try different keywords or browse all guides.`
        : "Try adjusting your filters or search terms to find what you're looking for."
    }
    icon="search"
    actionLabel="Clear filters"
    actionHref="#"
    secondaryActionLabel="Browse all guides"
    secondaryActionHref="/cities"
    {...props}
  />
));
NoResultsEmptyState.displayName = "NoResultsEmptyState";

/**
 * NoMessagesEmptyState - Pre-configured for empty message lists
 */
export const NoMessagesEmptyState = React.forwardRef<
  HTMLDivElement,
  Omit<EmptyStateProps, "title" | "description" | "icon" | "actionLabel" | "actionHref">
>(({ ...props }, ref) => (
  <EmptyState
    ref={ref}
    title="No messages yet"
    description="Once you have a confirmed booking, you'll be able to chat with your guide here."
    icon="users"
    variant="minimal"
    {...props}
  />
));
NoMessagesEmptyState.displayName = "NoMessagesEmptyState";

