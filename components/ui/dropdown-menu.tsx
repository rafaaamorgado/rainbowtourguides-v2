'use client';

import * as React from 'react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu as HeroDropdownMenu,
  DropdownItem,
  DropdownMenuProps,
} from '@heroui/react';
import { cn } from '@/lib/utils';

// Wrapper for DropdownMenu to handle additional props
export const DropdownMenu: React.FC<
  React.ComponentProps<typeof Dropdown> & { modal?: boolean }
> = ({ modal, ...props }) => {
  // Hero UI's Dropdown doesn't have a modal prop, so we ignore it
  return <Dropdown {...props} />;
};

export const DropdownMenuTrigger = DropdownTrigger;

// Wrapper for DropdownMenuContent to handle shadcn-style props
interface DropdownMenuContentProps {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({
  align,
  sideOffset,
  className,
  children,
  ...props
}) => {
  // Process children to convert our wrappers to Hero UI components
  const processedChildren = React.Children.toArray(children)
    .filter((child) => React.isValidElement(child))
    .map((child, index) => {
      if (!React.isValidElement(child)) return null;

      // If it's our DropdownMenuItem wrapper, extract its props and create a Hero UI DropdownItem
      if (child.type === DropdownMenuItem) {
        const { children: itemChildren, ...itemProps } = child.props as any;
        // Use child.key (React's special key prop) instead of child.props.key
        const itemKey = child.key || `item-${index}`;
        return (
          <DropdownItem key={itemKey} {...itemProps}>
            {itemChildren}
          </DropdownItem>
        );
      }

      // If it's DropdownMenuLabel or DropdownMenuSeparator, they already render DropdownItem internally
      // so we need to call them as functions and return their result
      if (
        typeof child.type === 'function' &&
        (child.type === DropdownMenuLabel ||
          child.type === DropdownMenuSeparator)
      ) {
        return child;
      }

      // Otherwise return the child as-is
      return child;
    });

  return (
    <HeroDropdownMenu className={className} {...props}>
      {processedChildren}
    </HeroDropdownMenu>
  );
};

// Wrapper for DropdownMenuItem to auto-generate keys
let itemCounter = 0;
export const DropdownMenuItem = React.forwardRef<
  HTMLLIElement,
  Omit<React.ComponentProps<typeof DropdownItem>, 'key'> & { key?: React.Key }
>(({ children, key, ...props }, ref) => {
  const itemKey = React.useMemo(() => {
    if (key !== undefined) return String(key);
    return `dropdown-item-${itemCounter++}-${typeof children === 'string' ? children.replace(/\s+/g, '-').toLowerCase() : 'item'}`;
  }, [key, children]);

  return (
    <DropdownItem key={itemKey} {...props}>
      {children}
    </DropdownItem>
  );
});

DropdownMenuItem.displayName = 'DropdownMenuItem';

// Create simple functional components for Label and Separator
export const DropdownMenuLabel = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <DropdownItem
    key="label"
    isReadOnly
    className={cn(
      'opacity-100 cursor-default hover:bg-transparent font-semibold',
      className,
    )}
    textValue="label"
  >
    {children}
  </DropdownItem>
);

export const DropdownMenuSeparator = () => (
  <DropdownItem
    key="separator"
    isReadOnly
    className="h-px p-0 my-1 bg-divider cursor-default hover:bg-transparent"
    textValue="separator"
  >
    <div className="w-full h-px bg-divider" />
  </DropdownItem>
);

// Compatibility exports - just fragments or no-ops
export const DropdownMenuGroup = React.Fragment;
export const DropdownMenuPortal = React.Fragment;
export const DropdownMenuSub = React.Fragment;
export const DropdownMenuSubContent = React.Fragment;
export const DropdownMenuSubTrigger = React.Fragment;
export const DropdownMenuRadioGroup = React.Fragment;
export const DropdownMenuCheckboxItem = DropdownItem;
export const DropdownMenuRadioItem = DropdownItem;
export const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn('ml-auto text-xs tracking-widest opacity-60', className)}
    {...props}
  />
);
