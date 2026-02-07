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
  inputClassName?: string;
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
  inputClassName = 'text-base',
  ariaLabelledby,
  inputProps,
  ...props
}: AutocompleteProps) {
  const handleSelectionChange = (key: React.Key | null) => {
    if (key && onChange) {
      onChange(String(key));
    }
  };

  const mergedInputProps = {
    ...inputProps,
    classNames: {
      ...inputProps?.classNames,
      inputWrapper: cn('h-12 min-h-12', inputProps?.classNames?.inputWrapper),
      input: cn(inputClassName, inputProps?.classNames?.input),
    },
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
      inputProps={mergedInputProps}
      {...props}
    >
      {options?.map((option) => (
        <AutocompleteItem key={option.value}>{option.label}</AutocompleteItem>
      ))}
    </HeroAutocomplete>
  );
}
