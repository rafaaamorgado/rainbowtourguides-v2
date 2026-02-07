'use client';

import { useMemo } from 'react';
import { Country, City, type ICountry, type ICity } from 'country-state-city';

export interface CountryOption {
  value: string; // isoCode (e.g. "US", "ES")
  label: string; // Display name (e.g. "United States")
  flag: string; // Flag emoji
}

export interface CityOption {
  value: string; // City name (e.g. "Tokyo")
  label: string; // Display label (e.g. "Tokyo")
  stateCode: string;
  countryCode: string;
}

/**
 * Hook providing global country options from the country-state-city library.
 * Memoized to avoid recomputing the full list on every render.
 */
export function useCountryOptions(): CountryOption[] {
  return useMemo(() => {
    const allCountries: ICountry[] = Country.getAllCountries();
    return allCountries.map((c) => ({
      value: c.isoCode,
      label: c.name,
      flag: c.flag,
    }));
  }, []);
}

/**
 * Hook providing city options for a specific country.
 * If no countryCode is provided, returns an empty array.
 */
export function useCityOptions(countryCode: string | null | undefined): CityOption[] {
  return useMemo(() => {
    if (!countryCode) return [];
    const cities: ICity[] | undefined = City.getCitiesOfCountry(countryCode);
    if (!cities) return [];

    // Deduplicate city names within the same country (some entries differ only by state)
    const seen = new Set<string>();
    const unique: CityOption[] = [];

    for (const c of cities) {
      const key = c.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push({
          value: c.name,
          label: c.name,
          stateCode: c.stateCode,
          countryCode: c.countryCode,
        });
      }
    }

    return unique.sort((a, b) => a.label.localeCompare(b.label));
  }, [countryCode]);
}

/**
 * Hook providing ALL cities globally (useful for search without country constraint).
 * Since getAllCities() returns ~150k entries, this returns only
 * cities matching a search query (minimum 2 characters).
 *
 * For the search use case, we recommend using the Combobox with
 * allowsCustomValue so users can type freely.
 */
export function useFilteredGlobalCities(query: string): CityOption[] {
  return useMemo(() => {
    if (!query || query.length < 2) return [];

    const searchLower = query.toLowerCase();
    const allCities: ICity[] = City.getAllCities();

    // Filter and deduplicate
    const seen = new Set<string>();
    const results: CityOption[] = [];

    for (const c of allCities) {
      if (results.length >= 50) break; // Cap results for performance
      const nameLower = c.name.toLowerCase();
      if (nameLower.startsWith(searchLower)) {
        const country = Country.getCountryByCode(c.countryCode);
        const key = `${nameLower}-${c.countryCode}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push({
            value: c.name,
            label: country ? `${c.name}, ${country.name}` : c.name,
            stateCode: c.stateCode,
            countryCode: c.countryCode,
          });
        }
      }
    }

    return results.sort((a, b) => a.label.localeCompare(b.label));
  }, [query]);
}

/**
 * Get country display name from ISO code.
 */
export function getCountryName(isoCode: string): string {
  const country = Country.getCountryByCode(isoCode);
  return country?.name || isoCode;
}
