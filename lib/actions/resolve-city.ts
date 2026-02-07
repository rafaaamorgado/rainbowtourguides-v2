'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * Resolves a city to its database ID, creating it if it doesn't exist.
 *
 * Strategy:
 * 1. Look up city by name + country code in the DB
 * 2. If found, return its ID
 * 3. If not found, create the city (and country if needed), return the new ID
 */
export async function resolveOrCreateCity(
  cityName: string,
  countryCode: string,
  countryName: string,
): Promise<{ cityId: string; error?: string }> {
  const supabase = await createSupabaseServerClient();
  const db = supabase as any;

  try {
    // 1. Ensure the country exists in our DB
    let countryId: string;

    const { data: existingCountry } = await db
      .from('countries')
      .select('id')
      .eq('iso_code', countryCode)
      .single();

    if (existingCountry) {
      countryId = existingCountry.id;
    } else {
      // Create the country
      const { data: newCountry, error: countryError } = await db
        .from('countries')
        .insert({
          name: countryName,
          iso_code: countryCode,
        })
        .select('id')
        .single();

      if (countryError || !newCountry) {
        return {
          cityId: '',
          error: countryError?.message || 'Failed to create country record',
        };
      }
      countryId = newCountry.id;
    }

    // 2. Look up the city by name + country
    const { data: existingCity } = await db
      .from('cities')
      .select('id')
      .eq('country_id', countryId)
      .ilike('name', cityName)
      .single();

    if (existingCity) {
      return { cityId: existingCity.id };
    }

    // 3. City doesn't exist - create it
    const slug = cityName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const { data: newCity, error: cityError } = await db
      .from('cities')
      .insert({
        name: cityName,
        slug: slug,
        country_id: countryId,
        country_code: countryCode,
        country_name: countryName,
        is_active: true,
        is_featured: false,
      })
      .select('id')
      .single();

    if (cityError || !newCity) {
      return {
        cityId: '',
        error: cityError?.message || 'Failed to create city record',
      };
    }

    return { cityId: newCity.id };
  } catch (err) {
    return {
      cityId: '',
      error: err instanceof Error ? err.message : 'Unexpected error resolving city',
    };
  }
}
