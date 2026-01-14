/**
 * Adapters for converting Supabase database rows to UI-friendly formats
 * These functions map database field names to the format expected by UI components
 */

import type { Database } from '@/types/database';
import type { City, Guide, Booking, Review, Message } from './mock-data';

type GuideRow = Database['public']['Tables']['guides']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type CityRow = Database['public']['Tables']['cities']['Row'];
type CountryRow = Database['public']['Tables']['countries']['Row'];
type BookingRow = Database['public']['Tables']['bookings']['Row'];
type ReviewRow = Database['public']['Tables']['reviews']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];

/**
 * Adapt guide from database format to UI format
 * cityData can be a nested structure: { id, name, slug, country: { id, name, iso_code } }
 */
export function adaptGuideFromDB(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  guideRow: GuideRow | any, // Allow any to handle data from views/aliases
  profileRow: ProfileRow | null,
  cityData: {
    id?: string;
    name?: string;
    slug?: string;
    country?: {
      id?: string;
      name?: string;
      iso_code?: string;
    } | null;
  } | null,
  rating: number,
  reviewCount: number,
): Guide {
  // Handle both base_price_* (from DB schema) and price_* (from views/aliases)
  const price4h = guideRow.price_4h || guideRow.base_price_4h || null;
  const price6h = guideRow.price_6h || guideRow.base_price_6h || null;
  const price8h = guideRow.price_8h || guideRow.base_price_8h || null;
  const avatarUrl = profileRow?.avatar_url ?? '';

  return {
    id: guideRow.id,
    name: profileRow?.full_name || 'Unknown',
    slug: guideRow.slug || guideRow.id, // Use slug if available, fallback to id
    city_id: guideRow.city_id,
    city_name: cityData?.name || 'Unknown',
    bio: guideRow.bio || '',
    tagline: guideRow.headline || '',
    avatar_url: avatarUrl,
    photo_url: avatarUrl,
    languages: profileRow?.languages || [],
    experience_tags: guideRow.themes || guideRow.experience_tags || [], // Support both field names
    price_4h: price4h ? parseFloat(price4h.toString()) : 0,
    price_6h: price6h ? parseFloat(price6h.toString()) : 0,
    price_8h: price8h ? parseFloat(price8h.toString()) : 0,
    rating,
    review_count: reviewCount,
    verified:
      guideRow.status === 'approved' ||
      guideRow.is_verified ||
      guideRow.approved === true ||
      guideRow.verification_status === 'approved', // Support multiple verification fields
    instant_book:
      guideRow.instant_book_enabled === true ||
      guideRow.instant_book_enabled === 'true', // Support boolean and string
  };
}

/**
 * Adapt city from database format to UI format
 */
export function adaptCityFromDB(
  cityRow: CityRow,
  countryRow: CountryRow | null,
  guideCount: number,
): City {
  return {
    id: cityRow.id,
    slug: cityRow.slug,
    name: cityRow.name,
    country_id: cityRow.country_id,
    country_name: countryRow?.name || '', // ⚠️ need to join with countries
    // TODO: add description field to cities table
    description: '',
    // TODO: add image_url field to cities table
    image_url: '',
    guide_count: guideCount,
  };
}

/**
 * Adapt booking from database format to UI format
 */
export function adaptBookingFromDB(
  bookingRow: BookingRow,
  guideProfile: ProfileRow | null,
  cityRow: CityRow | null,
): Booking {
  // Calculate end time from starts_at + duration_hours
  const startAt = new Date(bookingRow.starts_at); // ⚠️ starts_at, not start_at
  const endAt = new Date(startAt);
  if (bookingRow.duration_hours) {
    endAt.setHours(endAt.getHours() + bookingRow.duration_hours);
  }

  return {
    id: bookingRow.id,
    traveler_id: bookingRow.traveler_id,
    guide_id: bookingRow.guide_id,
    guide_name: guideProfile?.full_name || 'Unknown',
    city_name: cityRow?.name || 'Unknown',
    date: bookingRow.starts_at, // ⚠️ starts_at → date (ISO string)
    duration: bookingRow.duration_hours || 0, // Handle null case
    status: bookingRow.status, // ✅ BookingStatus enum matches
    price_total: parseFloat(bookingRow.price_total.toString()),
  };
}

/**
 * Adapt review from database format to UI format
 */
export function adaptReviewFromDB(
  reviewRow: ReviewRow,
  authorProfile: ProfileRow | null,
): Review {
  return {
    id: reviewRow.id,
    booking_id: reviewRow.booking_id,
    guide_id: reviewRow.guide_id, // ⚠️ guide_id, not subject_id
    traveler_name: authorProfile?.full_name || 'Unknown',
    rating: reviewRow.rating,
    comment: reviewRow.comment || '',
    date: reviewRow.created_at,
  };
}

/**
 * Adapt message from database format to UI format
 */
export function adaptMessageFromDB(
  messageRow: MessageRow,
  senderProfile: ProfileRow | null,
): Message {
  return {
    id: messageRow.id,
    booking_id: messageRow.booking_id,
    sender_id: messageRow.sender_id,
    sender_name: senderProfile?.full_name || 'Unknown',
    content: messageRow.text, // ⚠️ text, not body
    timestamp: messageRow.created_at,
  };
}
