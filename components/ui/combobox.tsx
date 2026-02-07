'use client';

import * as React from 'react';
import { Autocomplete, AutocompleteItem } from '@heroui/react';
import { cn } from '@/lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  label?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
}

/**
 * Combobox component - HeroUI Autocomplete wrapper with search functionality
 *
 * Provides a searchable dropdown with filtering
 */
export function Combobox({
  options = [],
  value,
  onChange,
  placeholder = 'Select...',
  icon,
  className,
  inputClassName = 'text-base',
  label,
  ariaLabel,
  ariaLabelledby,
}: ComboboxProps) {
  const handleSelectionChange = (key: React.Key | null) => {
    if (key) {
      onChange(key as string);
    }
  };

  return (
    <Autocomplete
      selectedKey={value || null}
      onSelectionChange={handleSelectionChange}
      placeholder={placeholder}
      startContent={icon}
      label={label}
      aria-label={ariaLabel || label || placeholder}
      aria-labelledby={ariaLabelledby}
      variant="bordered"
      classNames={{
        base: cn(className),
        selectorButton: 'h-12 bg-white border-slate-200 rounded-xl',
        popoverContent: 'rounded-xl',
        listbox: 'max-h-60',
      }}
      inputProps={{
        classNames: {
          input: inputClassName,
          inputWrapper: cn(
            'h-12 border-slate-200 bg-white rounded-xl shadow-sm',
            'data-[hover=true]:bg-white',
            'group-data-[focus=true]:ring-2 group-data-[focus=true]:ring-brand group-data-[focus=true]:border-transparent',
          ),
        },
      }}
      listboxProps={{
        emptyContent: 'No results found.',
      }}
    >
      {options.map((option) => (
        <AutocompleteItem key={option.value}>{option.label}</AutocompleteItem>
      ))}
    </Autocomplete>
  );
}
