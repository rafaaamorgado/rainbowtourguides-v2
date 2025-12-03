export type ProfileRole = "traveler" | "guide" | "admin";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

type ProfilesTable = {
  Row: {
    id: string;
    role: ProfileRole;
    display_name: string;
    avatar_url: string | null;
    home_city_id: string | null;
    bio: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    role?: ProfileRole;
    display_name: string;
    avatar_url?: string | null;
    home_city_id?: string | null;
    bio?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<ProfilesTable["Row"]>;
};

type TravelersTable = {
  Row: {
    id: string;
    persona: Record<string, unknown> | null;
    home_country: string | null;
    interests: string[] | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    persona?: Record<string, unknown> | null;
    home_country?: string | null;
    interests?: string[] | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<TravelersTable["Row"]>;
};

type GuidesTable = {
  Row: {
    id: string;
    city_id: string;
    tagline: string | null;
    bio: string | null;
    languages: string[] | null;
    is_verified: boolean;
    base_price_4h: string | null;
    base_price_6h: string | null;
    base_price_8h: string | null;
    currency: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    city_id: string;
    tagline?: string | null;
    bio?: string | null;
    languages?: string[] | null;
    is_verified?: boolean;
    base_price_4h?: string | null;
    base_price_6h?: string | null;
    base_price_8h?: string | null;
    currency?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<GuidesTable["Row"]>;
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
    starts_at: string;
    ends_at: string;
    special_requests: string | null;
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
    starts_at: string;
    ends_at: string;
    special_requests?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: Partial<BookingsTable["Row"]>;
};

type MessagesTable = {
  Row: {
    id: string;
    booking_id: string;
    sender_id: string;
    text: string;
    created_at: string;
  };
  Insert: {
    id?: string;
    booking_id: string;
    sender_id: string;
    text: string;
    created_at?: string;
  };
  Update: Partial<MessagesTable["Row"]>;
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
  Update: Partial<ReviewsTable["Row"]>;
};

export interface Database {
  public: {
    Tables: {
      profiles: ProfilesTable;
      travelers: TravelersTable;
      guides: GuidesTable;
      bookings: BookingsTable;
      messages: MessagesTable;
      reviews: ReviewsTable;
    };
    Functions: Record<string, never>;
    Enums: {
      profile_role: ProfileRole;
      booking_status: BookingStatus;
    };
  };
}

