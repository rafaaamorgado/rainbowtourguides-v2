'use client';

import * as React from 'react';
import {
  Button as HeroButton,
  ButtonProps as HeroButtonProps,
  extendVariants,
} from '@heroui/react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Extend HeroUI Button with custom variants matching our design system
const CustomButton = extendVariants(HeroButton, {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
      destructive:
        'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
      outline:
        'border-2 border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
      secondary:
        'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      default: 'h-9 px-4 py-2',
      sm: 'h-8 px-3 text-xs',
      lg: 'h-10 px-8',
      icon: 'h-9 w-9 p-0',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

// Export buttonVariants for backward compatibility (used by calendar, etc.)
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps extends Omit<
  HeroButtonProps,
  'variant' | 'size' | 'onClick'
> {
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  // Support both onClick and onPress for backward compatibility
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
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
      variant = 'default',
      size = 'default',
      onClick,
      onPress,
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

    return (
      <CustomButton
        ref={ref as any}
        variant={variant as any}
        size={size as any}
        onPress={handlePress}
        startContent={startContent}
        endContent={endContent}
        className={cn(className)}
        {...props}
      >
        {children}
      </CustomButton>
    );
  },
);

Button.displayName = 'Button';

export { Button };
