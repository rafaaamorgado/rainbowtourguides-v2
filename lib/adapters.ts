/**
 * Adapters for converting Supabase database rows to UI-friendly formats
 * These functions map database field names to the format expected by UI components
 */

import type { Database } from "@/types/database";
import type { City, Guide, Booking, Review, Message } from "./mock-data";

type GuideRow = Database["public"]["Tables"]["guides"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type CountryRow = Database["public"]["Tables"]["countries"]["Row"];
type BookingRow = Database["public"]["Tables"]["bookings"]["Row"];
type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

/**
 * Adapt guide from database format to UI format
 * cityData can be a nested structure: { id, name, slug, country: { id, name, iso_code } }
 */
export function adaptGuideFromDB(
  guideRow: GuideRow,
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
  reviewCount: number
): Guide {
  return {
    id: guideRow.id,
    name: profileRow?.full_name || "Unknown", // ⚠️ full_name, not display_name
    slug: guideRow.id, // TODO: add slug field to guides table
    city_id: guideRow.city_id,
    city_name: cityData?.name || "Unknown",
    bio: guideRow.bio || "",
    tagline: guideRow.headline || "", // ⚠️ headline, not tagline
    photo_url: profileRow?.avatar_url || "",
    languages: profileRow?.languages || [],
    experience_tags: guideRow.experience_tags || [], // ✅ same name!
    price_4h: guideRow.price_4h ? parseFloat(guideRow.price_4h.toString()) : 0, // ⚠️ numeric → number
    price_6h: guideRow.price_6h ? parseFloat(guideRow.price_6h.toString()) : 0,
    price_8h: guideRow.price_8h ? parseFloat(guideRow.price_8h.toString()) : 0,
    rating,
    review_count: reviewCount,
    verified: guideRow.verification_status === "approved", // ⚠️ verification_status enum
    instant_book: guideRow.instant_book_enabled || false, // ✅ same concept
  };
}

/**
 * Adapt city from database format to UI format
 */
export function adaptCityFromDB(
  cityRow: CityRow,
  countryRow: CountryRow | null,
  guideCount: number
): City {
  return {
    id: cityRow.id,
    slug: cityRow.slug,
    name: cityRow.name,
    country_id: cityRow.country_id,
    country_name: countryRow?.name || "", // ⚠️ need to join with countries
    // TODO: add description field to cities table
    description: "",
    // TODO: add image_url field to cities table
    image_url: "",
    guide_count: guideCount,
  };
}

/**
 * Adapt booking from database format to UI format
 */
export function adaptBookingFromDB(
  bookingRow: BookingRow,
  guideProfile: ProfileRow | null,
  cityRow: CityRow | null
): Booking {
  // Calculate end time from start_at + duration_hours
  const startAt = new Date(bookingRow.start_at); // ⚠️ start_at, not starts_at
  const endAt = new Date(startAt);
  endAt.setHours(endAt.getHours() + bookingRow.duration_hours);

  return {
    id: bookingRow.id,
    traveler_id: bookingRow.traveler_id,
    guide_id: bookingRow.guide_id,
    guide_name: guideProfile?.full_name || "Unknown", // ⚠️ full_name
    city_name: cityRow?.name || "Unknown",
    date: bookingRow.start_at, // ⚠️ start_at → date (ISO string)
    duration: bookingRow.duration_hours, // ✅ same name
    status: bookingRow.status as any, // Map enum values
    price_total: parseFloat(bookingRow.price_total.toString()), // ⚠️ numeric → number
  };
}

/**
 * Adapt review from database format to UI format
 */
export function adaptReviewFromDB(
  reviewRow: ReviewRow,
  authorProfile: ProfileRow | null
): Review {
  return {
    id: reviewRow.id,
    booking_id: reviewRow.booking_id,
    guide_id: reviewRow.subject_id, // ⚠️ subject_id is the guide being reviewed
    traveler_name: authorProfile?.full_name || "Unknown", // ⚠️ full_name, author_id
    rating: reviewRow.rating,
    comment: reviewRow.comment || "",
    date: reviewRow.created_at, // ⚠️ created_at → date
  };
}

/**
 * Adapt message from database format to UI format
 */
export function adaptMessageFromDB(
  messageRow: MessageRow,
  senderProfile: ProfileRow | null
): Message {
  return {
    id: messageRow.id,
    booking_id: messageRow.booking_id,
    sender_id: messageRow.sender_id,
    sender_name: senderProfile?.full_name || "Unknown", // ⚠️ full_name
    content: messageRow.body, // ⚠️ body → content
    timestamp: messageRow.created_at, // ⚠️ created_at → timestamp
  };
}
