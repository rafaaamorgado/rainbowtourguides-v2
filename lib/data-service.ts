/**
 * Data Service Layer - Abstraction over data sources
 * 
 * This layer provides async functions that currently use mock data but are
 * structured for easy migration to Supabase. UI code should only import
 * from this file, never directly from mock-data.ts or Supabase clients.
 */

import {
  type City,
  type Guide,
  type Booking,
  type Review,
  type Message,
  type BookingStatus,
  getMockCities,
  getMockCity,
  getMockCountry,
  getMockGuides,
  getMockGuide,
  getMockBookings,
  getMockBooking,
  getMockReviews,
  getMockMessages,
  searchGuides as searchMockGuides,
} from "./mock-data";

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Filters for guide searches
 */
export interface GuideFilters {
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  verified?: boolean;
  instantBook?: boolean;
}

/**
 * Input for creating a new booking
 */
export interface CreateBookingInput {
  traveler_id: string;
  guide_id: string;
  city_id: string;
  date: string;
  duration: number;
  notes?: string;
  price_total: number;
}

/**
 * Input for creating a new review
 */
export interface CreateReviewInput {
  booking_id: string;
  guide_id: string;
  traveler_id: string;
  rating: number;
  comment: string;
}

/**
 * Input for sending a message
 */
export interface SendMessageInput {
  booking_id: string;
  sender_id: string;
  content: string;
}

// ============================================================================
// Cities
// ============================================================================

/**
 * Get all cities with guide counts
 * @todo: Replace with Supabase query when ready
 * @supabase: SELECT * FROM cities WHERE is_active = true ORDER BY name
 */
export async function getCities(): Promise<City[]> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  return getMockCities();
}

/**
 * Get a single city by slug
 * @todo: Replace with Supabase query when ready
 * @supabase: SELECT * FROM cities WHERE slug = $1 LIMIT 1
 */
export async function getCity(slug: string): Promise<City | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  return getMockCity(slug);
}

/**
 * Get all cities for a specific country
 * @todo: Replace with Supabase query when ready
 * @supabase: SELECT * FROM cities WHERE country_id = (SELECT id FROM countries WHERE slug = $1) AND is_active = true ORDER BY name
 */
export async function getCitiesByCountry(
  countrySlug: string
): Promise<City[]> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  const country = getMockCountry(countrySlug);
  if (!country) {
    return [];
  }
  const cities = getMockCities();
  return cities.filter((city) => city.country_id === country.id);
}

// ============================================================================
// Guides
// ============================================================================

/**
 * Get guides, optionally filtered by city and additional filters
 * @todo: Replace with Supabase query when ready
 * @supabase: SELECT * FROM guides WHERE status = 'approved' AND (city_id = $1 OR $1 IS NULL) [apply filters] ORDER BY rating DESC
 */
export async function getGuides(
  citySlug?: string,
  filters?: GuideFilters
): Promise<Guide[]> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  return getMockGuides(citySlug, filters);
}

/**
 * Get a single guide by ID
 * @todo: Replace with Supabase query when ready
 * @supabase: SELECT * FROM guides WHERE id = $1 OR slug = $1 LIMIT 1
 */
export async function getGuide(id: string): Promise<Guide | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  return getMockGuide(id);
}

/**
 * Search guides by name, bio, tagline, city, tags, or languages
 * @todo: Replace with Supabase query when ready
 * @supabase: SELECT * FROM guides WHERE status = 'approved' AND (name ILIKE $1 OR bio ILIKE $1 OR tagline ILIKE $1 OR ...) ORDER BY rating DESC
 */
export async function searchGuides(query: string): Promise<Guide[]> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  return searchMockGuides(query);
}

// ============================================================================
// Bookings
// ============================================================================

/**
 * Get bookings for a user (traveler or guide)
 * @todo: Replace with Supabase query when ready
 * @supabase: SELECT * FROM bookings WHERE traveler_id = $1 OR guide_id = $1 ORDER BY created_at DESC
 */
export async function getBookings(
  userId: string,
  role: "traveler" | "guide"
): Promise<Booking[]> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  return getMockBookings(userId, role);
}

/**
 * Get a single booking by ID
 * @todo: Replace with Supabase query when ready
 * @supabase: SELECT * FROM bookings WHERE id = $1 LIMIT 1
 */
export async function getBooking(id: string): Promise<Booking | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  return getMockBooking(id);
}

/**
 * Create a new booking
 * @todo: Replace with Supabase insert when ready
 * @supabase: INSERT INTO bookings (traveler_id, guide_id, city_id, date, duration, notes, price_total, status) VALUES (...) RETURNING *
 */
export async function createBooking(
  data: CreateBookingInput
): Promise<Booking> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  // Mock implementation - in real version, this would insert into Supabase
  // For now, return a mock booking with generated ID
  const mockBooking: Booking = {
    id: `b${Date.now()}`,
    traveler_id: data.traveler_id,
    guide_id: data.guide_id,
    guide_name: "Mock Guide",
    city_name: "Mock City",
    date: data.date,
    duration: data.duration,
    status: "pending",
    price_total: data.price_total,
  };
  return mockBooking;
}

/**
 * Update a booking's status
 * @todo: Replace with Supabase update when ready
 * @supabase: UPDATE bookings SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  const booking = getMockBooking(id);
  if (!booking) {
    throw new Error(`Booking ${id} not found`);
  }
  // Mock implementation - in real version, this would update in Supabase
  return { ...booking, status };
}

// ============================================================================
// Reviews
// ============================================================================

/**
 * Get reviews for a specific guide
 * @todo: Replace with Supabase query when ready
 * @supabase: SELECT * FROM reviews WHERE guide_id = $1 ORDER BY created_at DESC
 */
export async function getReviews(guideId: string): Promise<Review[]> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  return getMockReviews(guideId);
}

/**
 * Create a new review
 * @todo: Replace with Supabase insert when ready
 * @supabase: INSERT INTO reviews (booking_id, guide_id, traveler_id, rating, comment) VALUES (...) RETURNING *
 */
export async function createReview(data: CreateReviewInput): Promise<Review> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  // Mock implementation - in real version, this would insert into Supabase
  const mockReview: Review = {
    id: `r${Date.now()}`,
    booking_id: data.booking_id,
    guide_id: data.guide_id,
    traveler_name: "Mock Traveler",
    rating: data.rating,
    comment: data.comment,
    date: new Date().toISOString().split("T")[0],
  };
  return mockReview;
}

// ============================================================================
// Messages
// ============================================================================

/**
 * Get messages for a specific booking
 * @todo: Replace with Supabase query when ready
 * @supabase: SELECT * FROM messages WHERE booking_id = $1 ORDER BY created_at ASC
 */
export async function getMessages(bookingId: string): Promise<Message[]> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  return getMockMessages(bookingId);
}

/**
 * Send a new message
 * @todo: Replace with Supabase insert when ready
 * @supabase: INSERT INTO messages (booking_id, sender_id, text) VALUES (...) RETURNING *
 */
export async function sendMessage(data: SendMessageInput): Promise<Message> {
  await new Promise((resolve) => setTimeout(resolve, 100 + Math.random() * 200));
  // Mock implementation - in real version, this would insert into Supabase
  const mockMessage: Message = {
    id: `m${Date.now()}`,
    booking_id: data.booking_id,
    sender_id: data.sender_id,
    sender_name: "Mock Sender",
    content: data.content,
    timestamp: new Date().toISOString(),
  };
  return mockMessage;
}

