'use client';

import * as React from 'react';
import {
  Input as HeroInput,
  InputProps as HeroInputProps,
} from '@heroui/react';
import { cn } from '@/lib/utils';

export interface InputProps extends Omit<HeroInputProps, 'size' | 'value'> {
  size?: 'sm' | 'md' | 'lg';
  // Support both string and number values for backward compatibility
  value?: string | number;
  // Support onChange for compatibility
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Input component - HeroUI wrapper with project defaults
 *
 * Migration notes:
 * - Replaces native HTML input with HeroUI Input
 * - Maintains similar API for backward compatibility
 * - Uses HeroUI's built-in validation and styling
 * - Handles number values by converting to string
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, size = 'md', type = 'text', value, classNames, ...props },
    ref,
  ) => {
    // Convert number values to strings for HeroUI compatibility
    const stringValue = value !== undefined ? String(value) : undefined;

    return (
      <HeroInput
        ref={ref}
        type={type}
        size={size}
        value={stringValue}
        variant="bordered"
        radius="sm"
        classNames={{
          input: cn('bg-background', className),
          inputWrapper: 'border-input hover:border-ring',
          ...classNames,
        }}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

export { Input };
