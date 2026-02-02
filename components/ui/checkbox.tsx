'use client';

import * as React from 'react';
import {
  Checkbox as HeroCheckbox,
  CheckboxProps as HeroCheckboxProps,
} from '@heroui/react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<
  HeroCheckboxProps,
  'isSelected' | 'onValueChange'
> {
  // Support Radix-style checked prop for backward compatibility
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  // Also support HeroUI props
  isSelected?: boolean;
  onValueChange?: (isSelected: boolean) => void;
}

/**
 * Checkbox component - HeroUI wrapper with project defaults
 *
 * Migration notes:
 * - Supports both Radix API (checked/onCheckedChange) and HeroUI API (isSelected/onValueChange)
 * - Radix props are transformed to HeroUI props internally
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      checked,
      onCheckedChange,
      isSelected,
      onValueChange,
      ...props
    },
    ref,
  ) => {
    // Support both APIs
    const selected = isSelected ?? checked;
    const handleChange = onValueChange || onCheckedChange;

    return (
      <HeroCheckbox
        ref={ref}
        isSelected={selected}
        onValueChange={handleChange}
        radius="sm"
        className={cn(className)}
        {...props}
      />
    );
  },
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
