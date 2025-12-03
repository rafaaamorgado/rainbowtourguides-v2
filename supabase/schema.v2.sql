-- Rainbow Tour Guides v2 initial schema
-- Run in Supabase SQL editor (one transaction suggested)

-- Core reference tables ------------------------------------------------------

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  iso_code char(2) not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id) on delete cascade,
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  hero_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists cities_country_id_idx on public.cities(country_id);
create index if not exists cities_is_active_idx on public.cities(is_active);

-- User + role tables ---------------------------------------------------------

create type public.profile_role as enum ('traveler', 'guide', 'admin');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.profile_role not null default 'traveler',
  display_name text not null,
  avatar_url text,
  home_city_id uuid references public.cities(id) on delete set null,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_home_city_id_idx on public.profiles(home_city_id);
-- TODO: Enable RLS on public.profiles once auth flows are finalized.

create table if not exists public.travelers (
  id uuid primary key references public.profiles(id) on delete cascade,
  persona jsonb default '{}',
  home_country text,
  interests text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- TODO: Enable RLS on public.travelers to restrict traveler self-access.

create table if not exists public.guides (
  id uuid primary key references public.profiles(id) on delete cascade,
  city_id uuid not null references public.cities(id) on delete restrict,
  tagline text,
  bio text,
  languages text[] default '{}',
  is_verified boolean not null default false,
  base_price_4h numeric(10, 2),
  base_price_6h numeric(10, 2),
  base_price_8h numeric(10, 2),
  currency char(3) default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists guides_city_id_idx on public.guides(city_id);
create index if not exists guides_is_verified_idx on public.guides(is_verified);
-- TODO: Enable RLS on public.guides to enforce guide ownership.

-- Experiences ---------------------------------------------------------------

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.guides(id) on delete cascade,
  title text not null,
  description text,
  duration_hours integer not null default 4,
  price numeric(10, 2) not null,
  currency char(3) default 'USD',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists experiences_guide_id_idx on public.experiences(guide_id);
create index if not exists experiences_is_active_idx on public.experiences(is_active);

-- Availability ---------------------------------------------------------------

create table if not exists public.availability_slots (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references public.guides(id) on delete cascade,
  start_at timestamptz not null,
  end_at timestamptz not null,
  is_booked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_slots_valid_range check (end_at > start_at)
);
create index if not exists availability_slots_guide_id_idx on public.availability_slots(guide_id);
create index if not exists availability_slots_time_idx on public.availability_slots(start_at, end_at);

-- Bookings -------------------------------------------------------------------

create type public.booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled');

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  traveler_id uuid not null references public.travelers(id) on delete restrict,
  guide_id uuid not null references public.guides(id) on delete restrict,
  city_id uuid not null references public.cities(id) on delete restrict,
  experience_id uuid references public.experiences(id) on delete set null,
  availability_slot_id uuid references public.availability_slots(id) on delete set null,
  status public.booking_status not null default 'pending',
  price_total numeric(10, 2) not null,
  currency char(3) default 'USD',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  special_requests text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bookings_traveler_id_idx on public.bookings(traveler_id);
create index if not exists bookings_guide_id_idx on public.bookings(guide_id);
create index if not exists bookings_city_id_idx on public.bookings(city_id);
create index if not exists bookings_status_idx on public.bookings(status);
-- TODO: Enable RLS on public.bookings to ensure travelers/guides only see their own data.

-- Messaging ------------------------------------------------------------------

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_booking_id_idx on public.messages(booking_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
-- TODO: Enable RLS on public.messages to scope to booking participants.

-- Reviews --------------------------------------------------------------------

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  traveler_id uuid not null references public.travelers(id) on delete cascade,
  guide_id uuid not null references public.guides(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
create index if not exists reviews_guide_id_idx on public.reviews(guide_id);
create index if not exists reviews_traveler_id_idx on public.reviews(traveler_id);
-- TODO: Enable RLS on public.reviews to allow travelers to manage their own reviews.

-- Audit triggers placeholder -------------------------------------------------
-- Optionally add updated_at triggers for automatic timestamp maintenance later.

