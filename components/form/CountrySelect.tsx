'use client';

import { Combobox } from '@/components/ui/combobox';
import { useCountryOptions } from './lib/use-global-locations';

interface CountrySelectProps {
  value: string;
  onChange: (isoCode: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

/**
 * Searchable country selector powered by the country-state-city library.
 * Returns the ISO code (e.g. "US", "PT") on selection.
 */
export function CountrySelect({
  value,
  onChange,
  placeholder = 'Select your country',
  className,
  label,
}: CountrySelectProps) {
  const countries = useCountryOptions();

  const options = countries.map((c) => ({
    value: c.value,
    label: `${c.flag} ${c.label}`,
  }));

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      label={label}
    />
  );
}
