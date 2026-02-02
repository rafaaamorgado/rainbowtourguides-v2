'use client';

import * as React from 'react';
import {
  Textarea as HeroTextarea,
  TextAreaProps as HeroTextareaProps,
} from '@heroui/react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends Omit<HeroTextareaProps, 'minRows'> {
  // Support both HTML rows and HeroUI minRows for backward compatibility
  rows?: number;
  minRows?: number;
}

/**
 * Textarea component - HeroUI wrapper with project defaults
 *
 * Migration notes:
 * - Replaces native HTML textarea with HeroUI Textarea
 * - Maintains similar API for backward compatibility
 * - rows prop is mapped to minRows for HeroUI compatibility
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, rows, minRows, ...props }, ref) => {
    // Use rows or minRows (rows takes precedence for backward compatibility)
    const rowCount = rows || minRows || 3;

    return (
      <HeroTextarea
        ref={ref}
        variant="bordered"
        radius="sm"
        minRows={rowCount}
        classNames={{
          input: cn('bg-background', className),
          inputWrapper: 'border-input hover:border-ring',
        }}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';

export { Textarea };
