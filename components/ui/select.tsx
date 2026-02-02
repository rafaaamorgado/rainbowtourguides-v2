'use client';

import * as React from 'react';
import {
  Select as HeroSelect,
  SelectItem as HeroSelectItem,
  SelectProps as HeroSelectProps,
} from '@heroui/react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<
  HeroSelectProps,
  'children' | 'onChange'
> {
  options?: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  label?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children?: React.ReactNode;
}

// Context for the shadcn-style composition API
const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  defaultValue?: string;
}>({});

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      onValueChange,
      placeholder = 'Select an option',
      defaultValue,
      icon,
      className,
      label,
      ariaLabel,
      ariaLabelledby,
      children,
      ...props
    },
    ref,
  ) => {
    const handleSelectionChange = (keys: Set<React.Key> | 'all') => {
      if (keys !== 'all') {
        const selectedValue = Array.from(keys)[0] as string;
        onChange?.(selectedValue);
        onValueChange?.(selectedValue);
      }
    };

    // If options are provided, use simplified API
    if (options) {
      return (
        <HeroSelect
          ref={ref}
          selectedKeys={value ? [value] : []}
          onSelectionChange={handleSelectionChange}
          placeholder={placeholder}
          startContent={icon}
          label={label}
          aria-label={ariaLabel || label || placeholder}
          aria-labelledby={ariaLabelledby}
          variant="bordered"
          classNames={{
            trigger: cn(className),
            value: 'text-sm',
            popoverContent: 'rounded-md',
          }}
          {...props}
        >
          {options.map((option) => (
            <HeroSelectItem key={option.value}>{option.label}</HeroSelectItem>
          ))}
        </HeroSelect>
      );
    }

    // Otherwise, use composition API with context
    // Extract SelectItems from SelectContent children
    let selectItems: React.ReactNode[] = [];
    let extractedPlaceholder = placeholder;

    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) return;

      // If it's SelectContent, extract its children (the SelectItems)
      if (child.type === SelectContent) {
        selectItems = React.Children.toArray((child.props as any).children);
      }
      // If it's SelectValue, extract placeholder
      else if (child.type === SelectValue && (child.props as any).placeholder) {
        extractedPlaceholder = (child.props as any).placeholder;
      }
    });

    return (
      <SelectContext.Provider
        value={{
          value,
          onValueChange,
          placeholder: extractedPlaceholder,
          defaultValue,
        }}
      >
        <HeroSelect
          ref={ref}
          selectedKeys={value ? [value] : defaultValue ? [defaultValue] : []}
          onSelectionChange={handleSelectionChange}
          placeholder={extractedPlaceholder}
          label={label}
          variant="bordered"
          classNames={{
            trigger: cn(
              'h-12 bg-transparent border-input shadow-sm',
              'data-[hover=true]:bg-accent/50',
              'data-[focus=true]:ring-1 data-[focus=true]:ring-ring',
              className,
            ),
            value: 'text-sm',
            popoverContent: 'rounded-md',
          }}
          {...props}
        >
          {selectItems as any}
        </HeroSelect>
      </SelectContext.Provider>
    );
  },
);

Select.displayName = 'Select';

// Compatibility components for shadcn-style API
const SelectTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  // In HeroUI, the trigger is built into the Select component
  // This is just a passthrough for compatibility
  return <>{children}</>;
});
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ placeholder, ...props }, ref) => {
  // In HeroUI, the value display is handled automatically
  // This is just for compatibility
  return null;
});
SelectValue.displayName = 'SelectValue';

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  // In HeroUI, the content/popover is built into the Select component
  // Just pass through the children (SelectItems)
  return <>{children}</>;
});
SelectContent.displayName = 'SelectContent';

// Wrapper for SelectItem to handle value prop (HeroUI uses key instead)
const SelectItem = React.forwardRef<
  HTMLLIElement,
  Omit<React.ComponentProps<typeof HeroSelectItem>, 'key'> & {
    value?: string;
    key?: React.Key;
  }
>(({ value, children, ...props }, ref) => {
  const itemKey =
    value || (typeof children === 'string' ? children : undefined);

  return (
    <HeroSelectItem key={itemKey} {...props}>
      {children}
    </HeroSelectItem>
  );
});

SelectItem.displayName = 'SelectItem';

export { Select, SelectItem, SelectTrigger, SelectValue, SelectContent };
