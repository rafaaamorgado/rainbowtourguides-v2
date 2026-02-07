'use client';

import * as React from 'react';
import { Button as HeroButton, ButtonProps as HeroButtonProps } from '@heroui/react';

export interface ButtonProps extends Omit<
  HeroButtonProps,
  'onClick' | 'variant'
> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link'
    | HeroButtonProps['variant'];
  // Support both onClick and onPress for backward compatibility
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  asChild?: boolean; // For backward compatibility, will be ignored
  // Support icon content
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

/**
 * Button component - HeroUI wrapper with project defaults
 *
 * Migration notes:
 * - onClick is forwarded to onPress for touch/keyboard support
 * - asChild prop is ignored (use Link component directly instead)
 * - Variants match previous shadcn/ui button styles
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      onClick,
      onPress,
      disabled,
      asChild,
      startContent,
      endContent,
      children,
      ...props
    },
    ref,
  ) => {
    // Forward onClick to onPress for backward compatibility
    const handlePress = onPress || (onClick as any);
    const mappedVariant =
      variant === 'outline'
        ? 'bordered'
        : variant === 'default'
          ? 'solid'
          : variant === 'secondary'
            ? 'light'
            : variant === 'link'
              ? 'light'
              : variant === 'destructive'
                ? 'solid'
                : variant;

    return (
      <HeroButton
        ref={ref as any}
        onPress={handlePress}
        startContent={startContent}
        endContent={endContent}
        variant={mappedVariant as HeroButtonProps['variant']}
        isDisabled={disabled}
        className={className}
        {...props}
      >
        {children}
      </HeroButton>
    );
  },
);

Button.displayName = 'Button';

export { Button };
