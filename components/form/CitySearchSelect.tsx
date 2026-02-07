'use client';

import * as React from 'react';
import { Autocomplete, AutocompleteItem } from '@heroui/react';
import { cn } from '@/lib/utils';
import { useFilteredGlobalCities, type CityOption } from './lib/use-global-locations';

interface CitySearchSelectProps {
  /** Currently selected city name */
  value: string;
  /** Callback with the selected city name */
  onChange: (cityName: string) => void;
  /** Additional DB cities to merge in (e.g. cities that have guides) */
  dbCities?: { value: string; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  label?: string;
  ariaLabel?: string;
}

/**
 * Global city search component for the search bars.
 * Uses the country-state-city library to search all world cities.
 * Merges with existing DB cities (that have guides) when provided.
 * Allows free text input so users can search any city.
 */
export function CitySearchSelect({
  value,
  onChange,
  dbCities = [],
  placeholder = 'Search destinations...',
  icon,
  className,
  inputClassName = 'text-base',
  label,
  ariaLabel,
}: CitySearchSelectProps) {
  const [inputValue, setInputValue] = React.useState(value || '');
  const globalCities = useFilteredGlobalCities(inputValue);

  // Merge DB cities (priority) with global library results
  const options = React.useMemo(() => {
    const seen = new Set<string>();
    const merged: { value: string; label: string }[] = [];

    // DB cities that match the query first (these have guides)
    for (const city of dbCities) {
      if (
        !inputValue ||
        city.label.toLowerCase().includes(inputValue.toLowerCase())
      ) {
        const key = city.value.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(city);
        }
      }
    }

    // Then global library cities
    for (const city of globalCities) {
      const key = city.value.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        merged.push({
          value: city.value,
          label: city.label,
        });
      }
    }

    return merged;
  }, [dbCities, globalCities, inputValue]);

  const handleSelectionChange = (key: React.Key | null) => {
    if (key) {
      onChange(key as string);
    }
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
  };

  // When the user clears input, clear the selection
  React.useEffect(() => {
    if (!inputValue && value) {
      onChange('');
    }
  }, [inputValue, value, onChange]);

  return (
    <Autocomplete
      selectedKey={value || null}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onSelectionChange={handleSelectionChange}
      allowsCustomValue
      placeholder={placeholder}
      startContent={icon}
      label={label}
      aria-label={ariaLabel || label || placeholder}
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
        emptyContent:
          inputValue.length < 2
            ? 'Type at least 2 characters...'
            : 'No cities found.',
      }}
    >
      {options.map((option) => (
        <AutocompleteItem key={option.value}>{option.label}</AutocompleteItem>
      ))}
    </Autocomplete>
  );
}
