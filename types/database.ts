export type ProfileRole = 'traveler' | 'guide' | 'admin';
export type GuideStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type BookingStatus =
  | 'draft'
  | 'pending'
  | 'accepted'
  | 'awaiting_payment'
  | 'confirmed'
  | 'declined'
  | 'cancelled_by_traveler'
  | 'cancelled_by_guide'
  | 'completed';

type CountriesTable = {
  Row: {
    id: string;
    name: string;
    iso_code: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    name: string;
    iso_code: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<CountriesTable['Row']>;
};

type CitiesTable = {
  Row: {
    id: string;
    country_id: string;
    name: string;
    slug: string;
    is_active: boolean;
    is_featured: boolean;
    hero_image_url: string | null;
    country_code: string | null;
    country_name: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    country_id: string;
    name: string;
    slug: string;
    is_active?: boolean;
    is_featured?: boolean;
    hero_image_url?: string | null;
    country_code?: string | null;
    country_name?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<CitiesTable['Row']>;
};

type ProfilesTable = {
  Row: {
    id: string;
    role: ProfileRole;
    full_name: string;
    pronouns: string | null;
    avatar_url: string | null;
    photo_url: string | null;
    country_of_origin: string | null;
    bio: string | null;
    languages: string[] | null;
    is_public?: boolean | null;
    email_notifications?: boolean | null;
    is_suspended: boolean;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    role?: ProfileRole;
    full_name: string;
    pronouns?: string | null;
    avatar_url?: string | null;
    photo_url?: string | null;
    country_of_origin?: string | null;
    bio?: string | null;
    languages?: string[] | null;
    is_public?: boolean | null;
    email_notifications?: boolean | null;
    is_suspended?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<ProfilesTable['Row']>;
};

type TravelersTable = {
  Row: {
    id: string;
    persona: Record<string, unknown> | null;
    home_country: string | null;
    interests: string[] | null;
    photo_urls: string[] | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    persona?: Record<string, unknown> | null;
    home_country?: string | null;
    interests?: string[] | null;
    photo_urls?: string[] | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<TravelersTable['Row']>;
};

type GuidesTable = {
  Row: {
    id: string;
    city_id: string;
    tagline: string | null;
    bio: string | null;
    headline: string | null;
    about: string | null;
    languages: string[] | null;
    themes: string[] | null;
    experience_tags: string[] | null;
    available_days: string[] | null;
    typical_start_time: string | null;
    typical_end_time: string | null;
    availability_pattern?: Record<string, any> | null;
    lgbtq_alignment: Record<string, any> | null;
    is_verified: boolean;
    approved: boolean;
    price_4h: string | null;
    price_6h: string | null;
    price_8h: string | null;
    hourly_rate: string | null;
    currency: string | null;
    status: GuideStatus;
    slug: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    city_id: string;
    tagline?: string | null;
    bio?: string | null;
    headline?: string | null;
    about?: string | null;
    languages?: string[] | null;
    themes?: string[] | null;
    experience_tags?: string[] | null;
    available_days?: string[] | null;
    typical_start_time?: string | null;
    typical_end_time?: string | null;
    availability_pattern?: Record<string, any> | null;
    lgbtq_alignment?: Record<string, any> | null;
    is_verified?: boolean;
    approved?: boolean;
    price_4h?: string | null;
    price_6h?: string | null;
    price_8h?: string | null;
    hourly_rate?: string | null;
    currency?: string | null;
    status?: GuideStatus;
    slug?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<GuidesTable['Row']>;
};

type BookingsTable = {
  Row: {
    id: string;
    traveler_id: string;
    guide_id: string;
    city_id: string;
    experience_id: string | null;
    availability_slot_id: string | null;
    status: BookingStatus;
    price_total: string;
    currency: string | null;
    start_at: string;
    duration_hours: number | null;
    party_size: number | null;
    traveler_note: string | null;
    stripe_checkout_session_id: string | null;
    stripe_payment_intent_id: string | null;
    accepted_at: string | null;
    confirmed_at: string | null;
    cancelled_at: string | null;
    completed_at: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    traveler_id: string;
    guide_id: string;
    city_id: string;
    experience_id?: string | null;
    availability_slot_id?: string | null;
    status?: BookingStatus;
    price_total: string;
    currency?: string | null;
    start_at: string;
    duration_hours?: number | null;
    party_size?: number | null;
    traveler_note?: string | null;
    stripe_checkout_session_id?: string | null;
    stripe_payment_intent_id?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<BookingsTable['Row']>;
};

type MessagesTable = {
  Row: {
    id: string;
    booking_id: string;
    sender_id: string;
    body: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    booking_id: string;
    sender_id: string;
    body: string;
    created_at?: string;
  };
  Update: Partial<MessagesTable['Row']>;
};

type BookingReadsTable = {
  Row: {
    booking_id: string;
    user_id: string;
    last_read_message_id: string | null;
    last_read_at: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    booking_id: string;
    user_id: string;
    last_read_message_id?: string | null;
    last_read_at?: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<BookingReadsTable['Row']>;
};

type ReviewsTable = {
  Row: {
    id: string;
    booking_id: string;
    traveler_id: string;
    guide_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
  };
  Insert: {
    id?: string;
    booking_id: string;
    traveler_id: string;
    guide_id: string;
    rating: number;
    comment?: string | null;
    created_at?: string;
  };
  Update: Partial<ReviewsTable['Row']>;
};

type AdminEventsTable = {
  Row: {
    id: string;
    actor_id: string | null;
    type: string;
    payload: Record<string, unknown>;
    created_at: string;
  };
  Insert: {
    id?: string;
    actor_id?: string | null;
    type: string;
    payload?: Record<string, unknown>;
    created_at?: string;
  };
  Update: Partial<AdminEventsTable['Row']>;
};

type ExperiencesTable = {
  Row: {
    id: string;
    guide_id: string;
    title: string;
    description: string | null;
    duration_hours: number;
    price: string;
    currency: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    guide_id: string;
    title: string;
    description?: string | null;
    duration_hours?: number;
    price: string;
    currency?: string | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<ExperiencesTable['Row']>;
};

type AvailabilitySlotsTable = {
  Row: {
    id: string;
    guide_id: string;
    start_at: string;
    end_at: string;
    is_booked: boolean;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    guide_id: string;
    start_at: string;
    end_at: string;
    is_booked?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<AvailabilitySlotsTable['Row']>;
};

type GuideUnavailableDatesTable = {
  Row: {
    id: string;
    guide_id: string;
    start_date: string;
    end_date: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    guide_id: string;
    start_date: string;
    end_date: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<GuideUnavailableDatesTable['Row']>;
};

export interface Database {
  public: {
    Tables: {
      countries: CountriesTable;
      cities: CitiesTable;
      profiles: ProfilesTable;
      travelers: TravelersTable;
      guides: GuidesTable;
      bookings: BookingsTable;
      messages: MessagesTable;
      booking_reads: BookingReadsTable;
      reviews: ReviewsTable;
      admin_events: AdminEventsTable;
      experiences: ExperiencesTable;
      availability_slots: AvailabilitySlotsTable;
      guide_unavailable_dates: GuideUnavailableDatesTable;
    };
    Functions: Record<string, never>;
    Enums: {
      profile_role: ProfileRole;
      guide_status: GuideStatus;
      booking_status: BookingStatus;
    };
  };
}
