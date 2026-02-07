'use client';

import { Combobox } from '@/components/ui/combobox';
import { useCityOptions } from './lib/use-global-locations';

interface CitySelectProps {
  /** ISO country code to filter cities (e.g. "US", "JP") */
  countryCode: string | null | undefined;
  /** Currently selected city name */
  value: string;
  /** Callback with the selected city name */
  onChange: (cityName: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

/**
 * Searchable city selector powered by the country-state-city library.
 * Requires a countryCode to list cities. Returns the city name string on selection.
 */
export function CitySelect({
  countryCode,
  value,
  onChange,
  placeholder = 'Select your city',
  className,
  label,
}: CitySelectProps) {
  const cities = useCityOptions(countryCode);

  const options = cities.map((c) => ({
    value: c.value,
    label: c.label,
  }));

  return (
    <Combobox
      options={options}
      value={value}
      onChange={onChange}
      placeholder={!countryCode ? 'Select a country first' : placeholder}
      className={className}
      label={label}
    />
  );
}
