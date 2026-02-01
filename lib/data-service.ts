'use server';

/**
 * Data Service Layer - Abstraction over data sources
 *
 * This layer provides async functions that use Supabase for data access.
 * UI code should only import from this file, never directly from mock-data.ts or Supabase clients.
 */

import { createSupabaseServerClient } from './supabase-server';
import { logQuery, logError } from './query-logger';
import {
  adaptGuideFromDB,
  adaptCityFromDB,
  adaptBookingFromDB,
  adaptReviewFromDB,
  adaptMessageFromDB,
} from './adapters';
import {
  type City,
  type Guide,
  type Booking,
  type Review,
  type Message,
  type BookingStatus,
  // Keep mock data imports for fallback (commented out functions)
  // getMockCities,
  // getMockCity,
  // getMockCountry,
  // getMockGuides,
  // getMockGuide,
  // getMockBookings,
  // getMockBooking,
  // getMockReviews,
  // getMockMessages,
  // searchGuides as searchMockGuides,
} from './mock-data';

type DebugMeta = {
  hasUrl: boolean;
  hasAnonKey: boolean;
};

type FetchResult<T> = {
  data: T[];
  error?: string;
  debug?: DebugMeta & { rows?: number };
};

type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

async function getSupabaseClientWithDebug(caller: string): Promise<{
  client?: SupabaseServerClient;
  debug: DebugMeta;
  error?: string;
}> {
  const debug = {
    hasUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    hasAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  };

  if (!debug.hasUrl || !debug.hasAnonKey) {
    return {
      debug,
      error: 'Supabase environment variables are missing',
    };
  }

  try {
    const client = await createSupabaseServerClient();
    return { client, debug };
  } catch (err) {
    return {
      debug,
      error:
        err instanceof Error ? err.message : 'Failed to create Supabase client',
    };
  }
}

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
 */
export async function getCities(): Promise<City[]> {
  const { data } = await getCitiesWithMeta();
  return data;
}

export async function getCitiesWithMeta(): Promise<FetchResult<City>> {
  const {
    client: supabase,
    debug,
    error: clientError,
  } = await getSupabaseClientWithDebug('getCities');

  if (!supabase) {
    return { data: [], error: clientError, debug };
  }

  const startTime = Date.now();

  logQuery('SELECT', 'cities', { is_active: true });

  const {
    data: cities,
    error: citiesError,
    status: citiesStatus,
  } = await supabase
    .from('cities')
    .select(
      `
    id,
    name,
    slug,
    hero_image_url,
    country_id,
    country:countries!cities_country_id_fkey(
      id,
      name,
      iso_code
    ),
    guides:guides!guides_city_id_fkey(
      id,
      status,
      approved
    )
    `,
    )
    .eq('is_active', true)
    .order('name');

  if (citiesError || !cities) {
    logError('SELECT', 'cities', citiesError);
    return { data: [], error: citiesError?.message, debug };
  }

  logQuery(
    'SELECT',
    'cities',
    { is_active: true },
    Date.now() - startTime,
    cities, // Log actual data
  );

  // Count guides per city from joined rows (RLS already enforces public visibility)
  const citiesWithCounts = (cities || []).map((city: any) => {
    const allGuides = city.guides || [];
    // Support both status field (enum) and approved field (boolean)
    const approvedGuides = allGuides.filter(
      (g: any) => g.status === 'approved' || g.approved === true,
    );

    // Database data: guides fetched from DB
    console.log(`[getCities] City: ${city.name} - DB data:`, {
      totalGuidesFromDB: allGuides.length,
      approvedCount: approvedGuides.length,
    });

    const adapted = adaptCityFromDB(
      city,
      city.country as any,
      approvedGuides.length,
    );

    return adapted;
  });

  // Filter out cities with no guides (as per requirement)
  const citiesWithGuides = citiesWithCounts.filter(
    (city) => city.guide_count > 0,
  );

  return {
    data: citiesWithGuides,
    debug: { ...debug, rows: citiesWithGuides.length },
  };
}

/**
 * Get a single city by slug
 */
export async function getCity(slug: string): Promise<City | undefined> {
  const supabase = await createSupabaseServerClient();
  const startTime = Date.now();

  logQuery('SELECT', 'cities', { slug, is_active: true });

  const { data: city, error } = await supabase
    .from('cities')
    .select(
      `
      *,
      country:countries!cities_country_id_fkey(*)
    `,
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !city) {
    logError('SELECT', 'cities', error);
    return undefined;
  }

  logQuery(
    'SELECT',
    'cities',
    { slug, is_active: true },
    Date.now() - startTime,
    city, // Log actual data
  );

  // Get guide count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cityData = city as any;
  const { count } = await supabase
    .from('guides')
    .select('*', { count: 'exact', head: true })
    .eq('city_id', cityData.id)
    // Support both status field and approved field
    .or('status.eq.approved,approved.eq.true');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return adaptCityFromDB(cityData, cityData.country as any, count || 0);
}

/**
 * Get all cities for a specific country
 * TODO: add slug field to countries table
 */
export async function getCitiesByCountry(
  _countrySlug: string,
): Promise<City[]> {
  // TODO: add slug field to countries table
  // For now, return empty array or implement by country name/iso_code
  return [];
  // const supabase = await createSupabaseServerClient();
  //
  // // First get country by slug (when slug field is added)
  // const { data: country } = await supabase
  //   .from("countries")
  //   .select("id")
  //   .eq("slug", countrySlug)
  //   .single();
  //
  // if (!country) return [];
  //
  // // Get cities for this country
  // const { data: cities } = await supabase
  //   .from("cities")
  //   .select(`
  //     *,
  //     country:countries!cities_country_id_fkey(*)
  //   `)
  //   .eq("country_id", country.id)
  //   .eq("is_active", true)
  //   .order("name");
  //
  // // Get guide counts
  // const citiesWithCounts = await Promise.all(
  //   (cities || []).map(async (city) => {
  //     const { count } = await supabase
  //       .from("guides")
  //       .select("*", { count: "exact", head: true })
  //       .eq("city_id", city.id)
  //       .eq("approved", true);
  //
  //     return adaptCityFromDB(city, city.country as any, count || 0);
  //   })
  // );
  //
  // return citiesWithCounts;
}

// ============================================================================
// Guides
// ============================================================================

/**
 * Get guides, optionally filtered by city and additional filters
 */
export async function getGuides(
  citySlug?: string,
  filters?: GuideFilters,
): Promise<Guide[]> {
  const { data } = await getGuidesWithMeta(citySlug, filters);
  return data;
}

export async function getGuidesWithMeta(
  citySlug?: string,
  filters?: GuideFilters,
): Promise<FetchResult<Guide>> {
  const {
    client: supabase,
    debug,
    error: clientError,
  } = await getSupabaseClientWithDebug('getGuides');

  if (!supabase) {
    return { data: [], error: clientError, debug };
  }

  const startTime = Date.now();

  // Get city_id if citySlug is provided
  let cityId: string | undefined;
  if (citySlug) {
    logQuery('SELECT', 'cities', { slug: citySlug });
    const { data: city } = await supabase
      .from('cities')
      .select('id')
      .eq('slug', citySlug)
      .single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cityId = (city as any)?.id;
  }

  // Build query
  // NOTE: Removed profile JOIN to avoid RLS infinite recursion error
  // Profile data will need to be fetched separately if needed
  let query = supabase.from('guides').select(
    `
      id,
      slug,
      city_id,
      headline,
      tagline,
      bio,
      experience_tags,
      price_4h,
      price_6h,
      price_8h,
      currency,
      status,
      approved,
      created_at,
      city:cities!guides_city_id_fkey(
        id,
        name,
        slug,
        country:countries!cities_country_id_fkey(
          id,
          name,
          iso_code
        )
      ),
      profile:profiles!guides_id_fkey(
        id,
        full_name,
        avatar_url,
        languages
      )
    `,
  );

  if (cityId) {
    query = query.eq('city_id', cityId);
  }

  if (filters?.verified) {
    query = query.eq('verification_status', 'approved');
  }

  if (filters?.instantBook) {
    query = query.eq('instant_book_enabled', true);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.contains('experience_tags', filters.tags);
  }

  if (filters?.minPrice) {
    query = query.gte('price_4h', filters.minPrice.toString());
  }

  if (filters?.maxPrice) {
    query = query.lte('price_4h', filters.maxPrice.toString());
  }

  query = query.order('created_at', { ascending: false });

  logQuery('SELECT', 'guides', {
    city_id: cityId,
    status: 'approved',
    ...(filters || {}),
  });

  const { data: guides, error, status } = await query;

  if (error || !guides) {
    logError('SELECT', 'guides', error);
    return { data: [], error: error?.message, debug };
  }

  logQuery(
    'SELECT',
    'guides',
    { city_id: cityId, status: 'approved' },
    Date.now() - startTime,
    guides, // Log actual data
  );

  // Fetch reviews for each guide to calculate ratings and review counts
  const guideIds = guides.map((guide: any) => guide.id);
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('subject_id, rating')
    .in('subject_id', guideIds);

  if (reviewsError) {
    logError('SELECT', 'reviews', reviewsError);
    return { data: [], error: reviewsError.message, debug };
  }

  console.log('Guide IDs:', guideIds);
  console.log('Fetched Reviews:', reviews);

  const reviewsByGuide = reviews.reduce((acc: any, review: any) => {
    if (!acc[review.subject_id]) {
      acc[review.subject_id] = [];
    }
    acc[review.subject_id].push(review.rating);
    return acc;
  }, {});

  // Calculate ratings and review counts
  const guidesWithStats = guides.map((guide: any) => {
    const ratings = reviewsByGuide[guide.id] || [];
    const rating =
      ratings.length > 0
        ? ratings.reduce((sum: number, r: number) => sum + r, 0) /
          ratings.length
        : 0;
    const reviewCount = ratings.length;

    return adaptGuideFromDB(
      guide,
      null, // profile removed to avoid RLS recursion
      guide.city as any, // city already contains nested country
      rating,
      reviewCount,
    );
  });

  return {
    data: guidesWithStats,
    debug: { ...debug, rows: guidesWithStats.length },
  };
}

/**
 * Get a single guide by ID
 */
export async function getGuide(id: string): Promise<Guide | undefined> {
  const supabase = await createSupabaseServerClient();

  const { data: guide, error } = await supabase
    .from('guides')
    .select(
      `
      *,
      profile:profiles!guides_id_fkey(full_name, avatar_url, languages),
      city:cities!guides_city_id_fkey(
        id,
        name,
        slug,
        country:countries!cities_country_id_fkey(
          id,
          name,
          iso_code
        )
      )
    `,
    )
    .eq('id', id)
    .single();

  if (error || !guide) {
    logError('SELECT', 'guides', error);
    return undefined;
  }

  logQuery('SELECT', 'guides', { id }, undefined, guide); // Log guide data

  // Get reviews for rating and count
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guideData = guide as any;
  const reviewStartTime = Date.now();
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('guide_id', guideData.id);

  logQuery(
    'SELECT',
    'reviews',
    { guide_id: guideData.id },
    Date.now() - reviewStartTime,
    reviews, // Log reviews data
  );

  const rating =
    reviews && reviews.length > 0
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        reviews.length
      : 0;
  const reviewCount = reviews?.length || 0;

  return adaptGuideFromDB(
    guideData,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    guideData.profile as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    guideData.city as any, // city already contains nested country
    rating,
    reviewCount,
  );
}

/**
 * Search guides by name, bio, headline, city, tags, or languages
 */
export async function searchGuides(query: string): Promise<Guide[]> {
  const supabase = await createSupabaseServerClient();

  const searchTerm = `%${query}%`;

  // Search in guides table (bio, headline, experience_tags)
  // and join with profiles (full_name, languages)
  const { data: guides, error } = await supabase
    .from('guides')
    .select(
      `
      *,
      profile:profiles!guides_id_fkey(full_name, avatar_url, languages),
      city:cities!guides_city_id_fkey(
        id,
        name,
        slug,
        country:countries!cities_country_id_fkey(
          id,
          name,
          iso_code
        )
      )
    `,
    )
    // Support both status field and approved field
    .or('status.eq.approved,approved.eq.true')
    .or(
      `bio.ilike.${searchTerm},headline.ilike.${searchTerm},experience_tags.cs.{${query}}`,
    );

  if (error || !guides) {
    logError('SELECT', 'guides', error);
    return [];
  }

  logQuery(
    'SELECT',
    'guides',
    { status: 'approved', search: query },
    undefined,
    guides,
  ); // Log guides data

  // Also search by profile name and languages
  // Note: This is a simplified search - for better results, consider using full-text search
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filteredGuides = (guides || []).filter((guide: any) => {
    const profile = guide.profile;
    const nameMatch = profile?.full_name
      ?.toLowerCase()
      .includes(query.toLowerCase());
    const langMatch = profile?.languages?.some((lang: string) =>
      lang.toLowerCase().includes(query.toLowerCase()),
    );
    return nameMatch || langMatch;
  });

  // Batch fetch all reviews for filtered guides (avoid N+1)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guideIds = filteredGuides.map((g: any) => g.id);
  const reviewStartTime = Date.now();
  const { data: allReviews } = await supabase
    .from('reviews')
    .select('guide_id, rating')
    .in('guide_id', guideIds);

  logQuery(
    'SELECT',
    'reviews',
    { guide_ids: guideIds.length },
    Date.now() - reviewStartTime,
    allReviews,
  );

  // Group reviews by guide_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviewsByGuide = (allReviews || []).reduce(
    (acc: Record<string, any[]>, r: any) => {
      if (!acc[r.guide_id]) acc[r.guide_id] = [];
      acc[r.guide_id].push(r);
      return acc;
    },
    {},
  );

  // Map guides with their stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guidesWithStats = filteredGuides.map((guide: any) => {
    const reviews = reviewsByGuide[guide.id] || [];
    const rating =
      reviews.length > 0
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          reviews.length
        : 0;
    const reviewCount = reviews.length;

    return adaptGuideFromDB(
      guide,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      guide.profile as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      guide.city as any, // city already contains nested country
      rating,
      reviewCount,
    );
  });

  return guidesWithStats;
}

/**
 * Get top-rated guides
 */
export async function getTopGuides(limit: number = 10): Promise<Guide[]> {
  const supabase = await createSupabaseServerClient();

  // Get all approved guides
  const { data: guides, error } = await supabase
    .from('guides')
    .select(
      `
      *,
      profile:profiles!guides_id_fkey(full_name, avatar_url, languages),
      city:cities!guides_city_id_fkey(
        id,
        name,
        slug,
        country:countries!cities_country_id_fkey(
          id,
          name,
          iso_code
        )
      )
    `,
    )
    // Support both status field and approved field
    .or('status.eq.approved,approved.eq.true');

  if (error || !guides) {
    logError('SELECT', 'guides', error);
    return [];
  }

  logQuery('SELECT', 'guides', { status: 'approved' }, undefined, guides); // Log guides data

  // Batch fetch all reviews for guides (avoid N+1)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guideIds = (guides || []).map((g: any) => g.id);
  const reviewStartTime = Date.now();
  const { data: allReviews } = await supabase
    .from('reviews')
    .select('guide_id, rating')
    .in('guide_id', guideIds);

  logQuery(
    'SELECT',
    'reviews',
    { guide_ids: guideIds.length },
    Date.now() - reviewStartTime,
    allReviews,
  );

  // Group reviews by guide_id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviewsByGuide = (allReviews || []).reduce(
    (acc: Record<string, any[]>, r: any) => {
      if (!acc[r.guide_id]) acc[r.guide_id] = [];
      acc[r.guide_id].push(r);
      return acc;
    },
    {},
  );

  // Map guides with their stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guidesWithStats = (guides || []).map((guide: any) => {
    const reviews = reviewsByGuide[guide.id] || [];
    const rating =
      reviews.length > 0
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          reviews.length
        : 0;
    const reviewCount = reviews.length;

    return {
      guide,
      rating,
      reviewCount,
    };
  });

  // Sort by rating desc, then review count desc
  guidesWithStats.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.reviewCount - a.reviewCount;
  });

  // Take top N and adapt
  return guidesWithStats.slice(0, limit).map(({ guide, rating, reviewCount }) =>
    adaptGuideFromDB(
      guide,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      guide.profile as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      guide.city as any, // city already contains nested country
      rating,
      reviewCount,
    ),
  );
}

// ============================================================================
// Bookings
// ============================================================================

/**
 * Get bookings for a user (traveler or guide)
 */
export async function getBookings(
  userId: string,
  role: 'traveler' | 'guide',
): Promise<Booking[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('bookings')
    .select(
      `
      *,
      guide:guides!bookings_guide_id_fkey(
        id,
        profile:profiles!guides_id_fkey(full_name, avatar_url)
      ),
      traveler:profiles!bookings_traveler_id_fkey(full_name, avatar_url),
      city:cities!bookings_city_id_fkey(name)
    `,
    )
    .order('created_at', { ascending: false });

  if (role === 'traveler') {
    query = query.eq('traveler_id', userId);
  } else {
    query = query.eq('guide_id', userId);
  }

  const { data: bookings, error } = await query;

  if (error || !bookings) {
    logError('SELECT', 'bookings', error);
    return [];
  }

  logQuery('SELECT', 'bookings', { userId, role }, undefined, bookings); // Log bookings data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (bookings || []).map((booking: any) =>
    adaptBookingFromDB(
      booking,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      booking.guide?.profile as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      booking.city as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      booking.traveler as any,
    ),
  );
}

/**
 * Get a single booking by ID
 */
export async function getBooking(id: string): Promise<Booking | undefined> {
  const supabase = await createSupabaseServerClient();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(
      `
      *,
      guide:guides!bookings_guide_id_fkey(
        id,
        profile:profiles!guides_id_fkey(full_name, avatar_url)
      ),
      traveler:profiles!bookings_traveler_id_fkey(full_name, avatar_url),
      city:cities!bookings_city_id_fkey(name)
    `,
    )
    .eq('id', id)
    .single();

  if (error || !booking) {
    logError('SELECT', 'bookings', error);
    return undefined;
  }

  logQuery('SELECT', 'bookings', { id }, undefined, booking); // Log booking data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookingData = booking as any;
  return adaptBookingFromDB(
    bookingData,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bookingData.guide?.profile as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bookingData.city as any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    bookingData.traveler as any,
  );
}

/**
 * Create a new booking
 */
export async function createBooking(
  data: CreateBookingInput,
): Promise<Booking> {
  const supabase = await createSupabaseServerClient();

  // Convert date string to timestamp
  const startAt = new Date(data.date);

  const bookingInsert = {
    traveler_id: data.traveler_id,
    guide_id: data.guide_id,
    city_id: data.city_id,
    start_at: startAt.toISOString(), // ⚠️ start_at, not date
    duration_hours: data.duration, // ✅ same name
    traveler_note: data.notes || null, // ⚠️ traveler_note, not notes
    price_total: data.price_total.toString(), // ⚠️ numeric → string
    status: 'draft' as const, // Default status is 'draft'
    currency: 'USD', // TODO: get from guide or user preference
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: booking, error } = await (supabase as any)
    .from('bookings')
    .insert(bookingInsert)
    .select(
      `
      *,
      guide:guides!bookings_guide_id_fkey(
        id,
        profile:profiles!guides_id_fkey(full_name, avatar_url)
      ),
      traveler:profiles!bookings_traveler_id_fkey(full_name, avatar_url),
      city:cities!bookings_city_id_fkey(name)
    `,
    )
    .single();

  if (error || !booking) {
    throw new Error(error?.message || 'Failed to create booking');
  }

  return adaptBookingFromDB(
    booking,
    booking.guide?.profile,
    booking.city,
    booking.traveler,
  );
}

/**
 * Update a booking's status
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus,
): Promise<Booking> {
  const supabase = await createSupabaseServerClient();

  // Map old status values to new enum values
  const statusMap: Record<string, string> = {
    pending: 'pending',
    confirmed: 'confirmed',
    completed: 'completed',
    cancelled: 'cancelled_by_traveler', // Default to traveler cancellation
    accepted: 'accepted',
    declined: 'declined',
    paid: 'confirmed', // Legacy: 'paid' is deprecated, map to 'confirmed'
  };

  const newStatus = statusMap[status] || status;

  // Update status and set appropriate timestamp
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {
    status: newStatus,
  };

  // Set timestamp based on status
  if (newStatus === 'accepted') {
    updateData.accepted_at = new Date().toISOString();
  } else if (newStatus === 'confirmed') {
    updateData.confirmed_at = new Date().toISOString();
  } else if (
    newStatus === 'cancelled_by_traveler' ||
    newStatus === 'cancelled_by_guide'
  ) {
    updateData.cancelled_at = new Date().toISOString();
  } else if (newStatus === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: booking, error } = await (supabase as any)
    .from('bookings')
    .update(updateData)
    .eq('id', id)
    .select(
      `
      *,
      guide:guides!bookings_guide_id_fkey(
        id,
        profile:profiles!guides_id_fkey(full_name, avatar_url)
      ),
      traveler:profiles!bookings_traveler_id_fkey(full_name, avatar_url),
      city:cities!bookings_city_id_fkey(name)
    `,
    )
    .single();

  if (error || !booking) {
    throw new Error(error?.message || 'Booking not found');
  }

  return adaptBookingFromDB(
    booking,
    booking.guide?.profile,
    booking.city,
    booking.traveler,
  );
}

// ============================================================================
// Reviews
// ============================================================================

/**
 * Get reviews for a specific guide
 */
export async function getReviews(guideId: string): Promise<Review[]> {
  const supabase = await createSupabaseServerClient();

  // Get reviews where guide_id = guideId (the guide being reviewed)
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(
      `
      *,
      author:profiles!reviews_traveler_id_fkey(full_name)
    `,
    )
    .eq('guide_id', guideId) // ⚠️ guide_id is the guide
    .order('created_at', { ascending: false });

  if (error || !reviews) {
    logError('SELECT', 'reviews', error);
    return [];
  }

  logQuery('SELECT', 'reviews', { guide_id: guideId }, undefined, reviews); // Log reviews data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (reviews || []).map((review: any) =>
    adaptReviewFromDB(
      review,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      review.author as any,
    ),
  );
}

/**
 * Create a new review
 */
export async function createReview(data: CreateReviewInput): Promise<Review> {
  const supabase = await createSupabaseServerClient();

  const reviewInsert = {
    booking_id: data.booking_id,
    traveler_id: data.traveler_id,
    guide_id: data.guide_id,
    rating: data.rating,
    comment: data.comment || null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: review, error } = await (supabase as any)
    .from('reviews')
    .insert(reviewInsert)
    .select(
      `
      *,
      author:profiles!reviews_traveler_id_fkey(full_name)
    `,
    )
    .single();

  if (error || !review) {
    throw new Error(error?.message || 'Failed to create review');
  }

  return adaptReviewFromDB(review, review.author);
}

// ============================================================================
// Messages
// ============================================================================

/**
 * Get messages for a specific booking
 */
export async function getMessages(bookingId: string): Promise<Message[]> {
  const supabase = await createSupabaseServerClient();

  const { data: messages, error } = await supabase
    .from('messages')
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(full_name)
    `,
    )
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });

  if (error || !messages) {
    logError('SELECT', 'messages', error);
    return [];
  }

  logQuery(
    'SELECT',
    'messages',
    { booking_id: bookingId },
    undefined,
    messages,
  ); // Log messages data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (messages || []).map((message: any) =>
    adaptMessageFromDB(
      message,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      message.sender as any,
    ),
  );
}

/**
 * Send a new message
 */
export async function sendMessage(data: SendMessageInput): Promise<Message> {
  const supabase = await createSupabaseServerClient();

  const messageInsert = {
    booking_id: data.booking_id,
    sender_id: data.sender_id,
    body: data.content, // ⚠️ body, not text or content
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: message, error } = await (supabase as any)
    .from('messages')
    .insert(messageInsert)
    .select(
      `
      *,
      sender:profiles!messages_sender_id_fkey(full_name)
    `,
    )
    .single();

  if (error || !message) {
    throw new Error(error?.message || 'Failed to send message');
  }

  return adaptMessageFromDB(message, message.sender);
}
