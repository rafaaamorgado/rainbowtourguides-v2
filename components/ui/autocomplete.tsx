'use client';

import * as React from 'react';
import {
  Autocomplete as HeroAutocomplete,
  AutocompleteItem,
  AutocompleteProps as HeroAutocompleteProps,
} from '@heroui/react';
import { cn } from '@/lib/utils';

export interface AutocompleteOption {
  value: string;
  label: string;
}

export interface AutocompleteProps extends Omit<
  HeroAutocompleteProps,
  'children' | 'onChange'
> {
  options: AutocompleteOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  startContent?: React.ReactNode;
  ariaLabelledby?: string;
}

/**
 * Autocomplete component - HeroUI wrapper for searchable select
 *
 * Migration notes:
 * - Replaces custom Combobox with HeroUI Autocomplete
 * - Built-in search/filter functionality
 * - Supports icons via startContent prop
 */
export function Autocomplete({
  options,
  value,
  onChange,
  placeholder,
  startContent,
  className,
  ariaLabelledby,
  ...props
}: AutocompleteProps) {
  const handleSelectionChange = (key: React.Key | null) => {
    if (key && onChange) {
      onChange(String(key));
    }
  };

  return (
    <HeroAutocomplete
      selectedKey={value}
      onSelectionChange={handleSelectionChange}
      placeholder={placeholder}
      variant="bordered"
      radius="lg"
      size="lg"
      startContent={startContent}
      aria-labelledby={ariaLabelledby}
      className={cn(className)}
      {...props}
    >
      {options?.map((option) => (
        <AutocompleteItem key={option.value}>{option.label}</AutocompleteItem>
      ))}
    </HeroAutocomplete>
  );
}
