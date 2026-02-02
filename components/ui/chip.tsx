'use client';

import * as React from 'react';
import { Chip as HeroChip, ChipProps as HeroChipProps } from '@heroui/react';
import { cn } from '@/lib/utils';

export interface ChipProps extends HeroChipProps {
  // Add custom props if needed
}

/**
 * Chip component - HeroUI Chip (replaces Badge)
 *
 * New component for tags, status indicators, etc.
 */
const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, variant = 'flat', size = 'sm', ...props }, ref) => {
    return (
      <HeroChip
        ref={ref}
        variant={variant}
        size={size}
        className={cn(className)}
        {...props}
      />
    );
  },
);

Chip.displayName = 'Chip';

export { Chip };
