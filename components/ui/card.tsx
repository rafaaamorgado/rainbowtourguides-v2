'use client';

import * as React from 'react';
import {
  Card as HeroCard,
  CardBody,
  CardFooter,
  CardHeader,
  CardProps as HeroCardProps,
} from '@heroui/react';
import { cn } from '@/lib/utils';

export interface CardProps extends HeroCardProps {
  // Add custom props if needed
}

/**
 * Card component - HeroUI wrapper with project defaults
 *
 * Migration notes:
 * - Uses HeroUI Card with CardHeader, CardBody, CardFooter composition
 * - Similar to previous card pattern but with better structure
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, shadow = 'sm', ...props }, ref) => {
    return (
      <HeroCard
        ref={ref}
        shadow={shadow}
        className={cn('border border-border', className)}
        {...props}
      />
    );
  },
);

Card.displayName = 'Card';

// Re-export HeroUI card components
export { CardBody, CardFooter, CardHeader };

// Backward compatibility exports for old API
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-semibold leading-none tracking-tight',
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

export const CardContent = CardBody; // Alias for backward compatibility

export { Card };
