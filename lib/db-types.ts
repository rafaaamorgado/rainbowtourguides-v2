/**
 * Type helper utilities for database tables
 * Use these instead of repeatedly writing Database["public"]["Tables"]["..."]["Row"]
 */

import type { Database } from '@/types/database';

// Base table row types
export type CityRow = Database['public']['Tables']['cities']['Row'];
export type GuideRow = Database['public']['Tables']['guides']['Row'];
export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type BookingRow = Database['public']['Tables']['bookings']['Row'];
export type CountryRow = Database['public']['Tables']['countries']['Row'];
export type TravelerRow = Database['public']['Tables']['travelers']['Row'];
export type MessageRow = Database['public']['Tables']['messages']['Row'];
export type ReviewRow = Database['public']['Tables']['reviews']['Row'];

// Insert types for creating records
export type CityInsert = Database['public']['Tables']['cities']['Insert'];
export type GuideInsert = Database['public']['Tables']['guides']['Insert'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];

// Update types for modifying records
export type CityUpdate = Database['public']['Tables']['cities']['Update'];
export type GuideUpdate = Database['public']['Tables']['guides']['Update'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

// Common projection types (for joined queries)
export type GuideWithProfile = GuideRow & {
  profile: Pick<ProfileRow, 'full_name' | 'avatar_url' | 'languages'> | null;
  city: Pick<CityRow, 'name' | 'slug'> | null;
};

export type BookingWithDetails = BookingRow & {
  traveler: Pick<ProfileRow, 'full_name'> | null;
  guide: Pick<ProfileRow, 'full_name'> | null;
  city: Pick<CityRow, 'name'> | null;
};

export type CityWithGuideCount = CityRow & {
  guide_count: number;
};
