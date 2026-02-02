'use client';

import * as React from 'react';
import {
  Progress as HeroProgress,
  ProgressProps as HeroProgressProps,
} from '@heroui/react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends HeroProgressProps {
  // Add any custom props if needed
}

/**
 * Progress component - HeroUI wrapper with project defaults
 *
 * Migration notes:
 * - API is similar to Radix Progress
 * - value prop is the same (0-100)
 */
const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, ...props }, ref) => {
    return (
      <HeroProgress
        ref={ref}
        size="sm"
        radius="full"
        className={cn(className)}
        {...props}
      />
    );
  },
);

Progress.displayName = 'Progress';

export { Progress };
