'use client';

import * as React from 'react';
import {
  Avatar as HeroAvatar,
  AvatarProps as HeroAvatarProps,
} from '@heroui/react';
import { cn } from '@/lib/utils';

// Context to collect Avatar children (for backward compatibility with Radix API)
interface AvatarContextValue {
  src?: string;
  alt?: string;
  fallback?: React.ReactNode;
  fallbackClassName?: string;
}

const AvatarContext = React.createContext<AvatarContextValue>({});

export interface AvatarProps extends Omit<HeroAvatarProps, 'src' | 'name'> {
  // Add any custom props if needed
  children?: React.ReactNode;
}

/**
 * Avatar component - HeroUI wrapper with project defaults
 *
 * Migration notes:
 * - Supports both old Radix API (with children AvatarImage/AvatarFallback)
 * - Also supports new HeroUI API (direct src/name props)
 * - If children are provided, extracts src and fallback from them
 */
const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, ...props }, ref) => {
    // If children are provided, extract context from them
    const avatarContent = React.useMemo<AvatarContextValue>(() => {
      if (!children) {
        return {};
      }

      // Extract AvatarImage and AvatarFallback from children
      const childArray = React.Children.toArray(children);
      const ctx: AvatarContextValue = {};

      childArray.forEach((child) => {
        if (React.isValidElement(child)) {
          if (child.type === AvatarImage) {
            ctx.src = (child.props as any).src;
            ctx.alt = (child.props as any).alt;
          } else if (child.type === AvatarFallback) {
            ctx.fallback = (child.props as any).children;
            ctx.fallbackClassName = (child.props as any).className;
          }
        }
      });

      return ctx;
    }, [children]);

    // Derive name from fallback for HeroUI
    const name =
      typeof avatarContent.fallback === 'string'
        ? avatarContent.fallback
        : avatarContent.alt || '';

    return (
      <HeroAvatar
        ref={ref}
        src={avatarContent.src}
        name={name}
        radius="full"
        size="md"
        className={cn(className)}
        classNames={{
          name: avatarContent.fallbackClassName,
        }}
        {...props}
      />
    );
  },
);

Avatar.displayName = 'Avatar';

// For backward compatibility with Radix Avatar API
export const AvatarImage = ({ src, alt }: { src?: string; alt?: string }) =>
  null;
export const AvatarFallback = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => null;

export { Avatar };
