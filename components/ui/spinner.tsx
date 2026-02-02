'use client';

import * as React from 'react';
import {
  Spinner as HeroSpinner,
  SpinnerProps as HeroSpinnerProps,
} from '@heroui/react';
import { cn } from '@/lib/utils';

export interface SpinnerProps extends HeroSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Spinner component - HeroUI wrapper with project defaults
 *
 * New component for loading states
 */
const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', color = 'primary', ...props }, ref) => {
    return (
      <HeroSpinner
        ref={ref}
        size={size}
        color={color}
        className={cn(className)}
        {...props}
      />
    );
  },
);

Spinner.displayName = 'Spinner';

export { Spinner };
