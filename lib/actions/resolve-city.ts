'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';

/**
 * Resolves a city to its database ID, creating it if it doesn't exist.
 *
 * Strategy:
 * 1. Look up city by name + country code in the DB
 * 2. If found, return its ID (and backfill country_code/country_name if missing)
 * 3. If not found, create the city (and country if needed), return the new ID
 */
export async function resolveOrCreateCity(
  cityName: string,
  countryCode: string,
  countryName: string,
): Promise<{ cityId: string; error?: string }> {
  if (!cityName?.trim() || !countryCode?.trim()) {
    return { cityId: '', error: 'City name and country code are required' };
  }

  const supabase = await createSupabaseServerClient();
  const db = supabase as any;

  try {
    // 1. Ensure the country exists in our DB
    let countryId: string;

    const { data: existingCountry, error: countryLookupError } = await db
      .from('countries')
      .select('id')
      .eq('iso_code', countryCode)
      .single();

    if (existingCountry) {
      countryId = existingCountry.id;
    } else {
      // Create the country
      const { data: newCountry, error: countryInsertError } = await db
        .from('countries')
        .insert({
          name: countryName || countryCode,
          iso_code: countryCode,
        })
        .select('id')
        .single();

      if (countryInsertError || !newCountry) {
        return {
          cityId: '',
          error: `Failed to create country "${countryName}" (${countryCode}): ${countryInsertError?.message || 'unknown error'}`,
        };
      }
      countryId = newCountry.id;
    }

    // 2. Look up the city by name + country
    const { data: existingCity } = await db
      .from('cities')
      .select('id, country_code')
      .eq('country_id', countryId)
      .ilike('name', cityName.trim())
      .single();

    if (existingCity) {
      // Backfill country_code / country_name if missing on existing city
      if (!existingCity.country_code) {
        await db
          .from('cities')
          .update({
            country_code: countryCode,
            country_name: countryName || countryCode,
          })
          .eq('id', existingCity.id);
      }
      return { cityId: existingCity.id };
    }

    // 3. City doesn't exist — create it
    const slug = cityName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const { data: newCity, error: cityInsertError } = await db
      .from('cities')
      .insert({
        name: cityName.trim(),
        slug: slug,
        country_id: countryId,
        country_code: countryCode,
        country_name: countryName || countryCode,
        is_active: true,
      })
      .select('id')
      .single();

    if (cityInsertError || !newCity) {
      return {
        cityId: '',
        error: `Failed to create city "${cityName}": ${cityInsertError?.message || 'unknown error'}`,
      };
    }

    return { cityId: newCity.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      cityId: '',
      error: `Unexpected error resolving city "${cityName}", ${countryCode}: ${message}`,
    };
  }
}
