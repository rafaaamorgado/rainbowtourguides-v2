/**
 * Mock Data Layer for Rainbow Tour Guides v2
 * Premium, warm, mature tone - no camp
 */

export type BookingStatus =
  | 'draft'
  | 'pending'
  | 'approved_pending_payment'
  | 'accepted'
  | 'awaiting_payment'
  | 'confirmed'
  | 'declined'
  | 'cancelled_by_traveler'
  | 'cancelled_by_guide'
  | 'completed';
export type GuideStatus = 'pending' | 'approved' | 'rejected';
export type UserRole = 'traveler' | 'guide' | 'admin';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface Country {
  id: string;
  slug: string;
  name: string;
  cities_count: number;
  description: string;
}

export interface City {
  id: string;
  slug: string;
  name: string;
  country_id: string;
  country_name: string;
  description: string;
  image_url: string;
  guide_count: number;
  /** Photographer name (e.g. from Unsplash) */
  hero_image_attribution?: string | null;
  /** Link to photographer profile */
  hero_image_attribution_url?: string | null;
  /** Image source label (e.g. "Unsplash") */
  hero_image_source?: string | null;
}

export interface Guide {
  id: string;
  name: string;
  slug: string;
  city_id: string;
  city_name: string;
  country_name?: string;
  bio: string;
  tagline: string;
  avatar_url?: string | null;
  photo_url?: string;
  languages: string[];
  experience_tags: string[];
  themes?: string[];
  price_4h: number;
  price_6h: number;
  price_8h: number;
  rating: number;
  review_count: number;
  verified: boolean;
  instant_book: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photo_url: string;
}

export interface Booking {
  id: string;
  traveler_id: string;
  guide_id: string;
  guide_name: string;
  traveler_name?: string;
  city_name: string;
  date: string;
  duration: number;
  status: BookingStatus;
  price_total: number;
  guide_avatar?: string | null;
  traveler_avatar?: string | null;
  notes?: string;
  city_id?: string;
}

export interface Review {
  id: string;
  booking_id: string;
  guide_id: string;
  traveler_name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  featured_image: string;
  author_name: string;
  author_photo: string;
  published_date: string;
  read_time: number;
  category: string;
  tags: string[];
}

// ============================================================================
// Mock Data - Countries
// ============================================================================

const MOCK_COUNTRIES: Country[] = [
  {
    id: 'c1',
    slug: 'spain',
    name: 'Spain',
    cities_count: 4,
    description: 'Historic cities with vibrant LGBTQ+ scenes',
  },
  {
    id: 'c2',
    slug: 'portugal',
    name: 'Portugal',
    cities_count: 2,
    description: 'Coastal beauty and welcoming culture',
  },
  {
    id: 'c3',
    slug: 'germany',
    name: 'Germany',
    cities_count: 1,
    description: 'Progressive cities with rich history',
  },
  {
    id: 'c4',
    slug: 'uk',
    name: 'United Kingdom',
    cities_count: 1,
    description: 'Cosmopolitan culture and historic landmarks',
  },
  {
    id: 'c5',
    slug: 'usa',
    name: 'United States',
    cities_count: 1,
    description: 'Diverse metropolitan experiences',
  },
  {
    id: 'c6',
    slug: 'argentina',
    name: 'Argentina',
    cities_count: 1,
    description: 'Passionate culture and stunning architecture',
  },
  {
    id: 'c7',
    slug: 'brazil',
    name: 'Brazil',
    cities_count: 2,
    description: 'Vibrant energy and beach culture',
  },
  {
    id: 'c8',
    slug: 'south-africa',
    name: 'South Africa',
    cities_count: 2,
    description: 'Natural beauty meets urban sophistication',
  },
  {
    id: 'c9',
    slug: 'australia',
    name: 'Australia',
    cities_count: 1,
    description: 'Laid-back lifestyle and stunning coastlines',
  },
  {
    id: 'c10',
    slug: 'iceland',
    name: 'Iceland',
    cities_count: 1,
    description: 'Natural wonders and progressive values',
  },
  {
    id: 'c11',
    slug: 'norway',
    name: 'Norway',
    cities_count: 1,
    description: 'Nordic beauty and inclusive society',
  },
  {
    id: 'c12',
    slug: 'thailand',
    name: 'Thailand',
    cities_count: 2,
    description: 'Tropical paradise with vibrant nightlife',
  },
  {
    id: 'c13',
    slug: 'greece',
    name: 'Greece',
    cities_count: 1,
    description: 'Ancient history meets modern culture',
  },
  {
    id: 'c14',
    slug: 'mexico',
    name: 'Mexico',
    cities_count: 2,
    description: 'Rich traditions and colorful experiences',
  },
  {
    id: 'c15',
    slug: 'india',
    name: 'India',
    cities_count: 2,
    description: 'Ancient wisdom meets contemporary life',
  },
  {
    id: 'c16',
    slug: 'italy',
    name: 'Italy',
    cities_count: 1,
    description: 'Art, culture, and la dolce vita',
  },
];

// ============================================================================
// Mock Data - Cities
// ============================================================================

const MOCK_CITIES: City[] = [
  {
    id: 'city1',
    slug: 'barcelona',
    name: 'Barcelona',
    country_id: 'c1',
    country_name: 'Spain',
    description:
      "Gaudí's architectural wonders meet Mediterranean beaches and a thriving queer scene in the Gothic Quarter.",
    image_url:
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
    guide_count: 8,
  },
  {
    id: 'city2',
    slug: 'lisbon',
    name: 'Lisbon',
    country_id: 'c2',
    country_name: 'Portugal',
    description:
      'Seven hills of pastel facades, historic trams, and a warm, welcoming community in charming neighborhoods.',
    image_url:
      'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800',
    guide_count: 5,
  },
  {
    id: 'city3',
    slug: 'porto',
    name: 'Porto',
    country_id: 'c2',
    country_name: 'Portugal',
    description:
      'Port wine, riverside charm, and intimate bars along the Douro River.',
    image_url:
      'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800',
    guide_count: 3,
  },
  {
    id: 'city4',
    slug: 'berlin',
    name: 'Berlin',
    country_id: 'c3',
    country_name: 'Germany',
    description:
      "Underground clubs, street art, and one of Europe's most open and diverse queer cultures.",
    image_url:
      'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=800',
    guide_count: 6,
  },
  {
    id: 'city5',
    slug: 'london',
    name: 'London',
    country_id: 'c4',
    country_name: 'United Kingdom',
    description:
      'Historic Soho scene, world-class museums, and a cosmopolitan blend of cultures.',
    image_url:
      'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
    guide_count: 7,
  },
  {
    id: 'city6',
    slug: 'new-york',
    name: 'New York City',
    country_id: 'c5',
    country_name: 'United States',
    description:
      'The birthplace of Pride, iconic neighborhoods, and endless cultural experiences.',
    image_url:
      'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
    guide_count: 9,
  },
  {
    id: 'city7',
    slug: 'buenos-aires',
    name: 'Buenos Aires',
    country_id: 'c6',
    country_name: 'Argentina',
    description:
      'Tango, European elegance, and progressive values in the Paris of South America.',
    image_url:
      'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=800',
    guide_count: 4,
  },
  {
    id: 'city8',
    slug: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    country_id: 'c7',
    country_name: 'Brazil',
    description:
      'Carnival energy, stunning beaches, and a celebration of diversity.',
    image_url:
      'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
    guide_count: 5,
  },
  {
    id: 'city9',
    slug: 'sao-paulo',
    name: 'São Paulo',
    country_id: 'c7',
    country_name: 'Brazil',
    description:
      "South America's largest Pride celebration and a thriving arts scene.",
    image_url:
      'https://images.unsplash.com/photo-1562962230-16c88c1d1e6c?w=800',
    guide_count: 4,
  },
  {
    id: 'city10',
    slug: 'cape-town',
    name: 'Cape Town',
    country_id: 'c8',
    country_name: 'South Africa',
    description:
      'Table Mountain vistas, wine country, and vibrant neighborhoods by the sea.',
    image_url:
      'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
    guide_count: 3,
  },
  {
    id: 'city11',
    slug: 'johannesburg',
    name: 'Johannesburg',
    country_id: 'c8',
    country_name: 'South Africa',
    description:
      'Urban energy, contemporary art, and a dynamic cultural scene.',
    image_url:
      'https://images.unsplash.com/photo-1577948000111-9c970dfe3743?w=800',
    guide_count: 2,
  },
  {
    id: 'city12',
    slug: 'sydney',
    name: 'Sydney',
    country_id: 'c9',
    country_name: 'Australia',
    description:
      'Iconic harbors, world-famous beaches, and Mardi Gras celebrations.',
    image_url:
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800',
    guide_count: 6,
  },
  {
    id: 'city13',
    slug: 'reykjavik',
    name: 'Reykjavik',
    country_id: 'c10',
    country_name: 'Iceland',
    description:
      'Northern lights, geothermal springs, and a progressive, intimate community.',
    image_url:
      'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=800',
    guide_count: 2,
  },
  {
    id: 'city14',
    slug: 'oslo',
    name: 'Oslo',
    country_id: 'c11',
    country_name: 'Norway',
    description:
      'Nordic design, fjord access, and a welcoming Scandinavian spirit.',
    image_url:
      'https://images.unsplash.com/photo-1559564484-e48ee8b8cc2c?w=800',
    guide_count: 2,
  },
  {
    id: 'city15',
    slug: 'chiang-mai',
    name: 'Chiang Mai',
    country_id: 'c12',
    country_name: 'Thailand',
    description:
      'Ancient temples, mountain serenity, and a growing digital nomad scene.',
    image_url:
      'https://images.unsplash.com/photo-1544991875-5a1d0f2d964a?w=800',
    guide_count: 3,
  },
  {
    id: 'city16',
    slug: 'pattaya',
    name: 'Pattaya',
    country_id: 'c12',
    country_name: 'Thailand',
    description:
      'Beachside entertainment, vibrant nightlife, and tropical relaxation.',
    image_url:
      'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?w=800',
    guide_count: 3,
  },
  {
    id: 'city17',
    slug: 'athens',
    name: 'Athens',
    country_id: 'c13',
    country_name: 'Greece',
    description:
      'Ancient ruins, Mediterranean cuisine, and a thriving modern scene.',
    image_url:
      'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800',
    guide_count: 3,
  },
  {
    id: 'city18',
    slug: 'guadalajara',
    name: 'Guadalajara',
    country_id: 'c14',
    country_name: 'Mexico',
    description:
      'Mariachi traditions, tequila heritage, and warm Mexican hospitality.',
    image_url:
      'https://images.unsplash.com/photo-1614883336824-2f6e36e44287?w=800',
    guide_count: 2,
  },
  {
    id: 'city19',
    slug: 'mexico-city',
    name: 'Mexico City',
    country_id: 'c14',
    country_name: 'Mexico',
    description:
      'Ancient Aztec sites, vibrant neighborhoods, and world-class cuisine.',
    image_url:
      'https://images.unsplash.com/photo-1518659231561-8bce3be43b80?w=800',
    guide_count: 5,
  },
  {
    id: 'city20',
    slug: 'new-delhi',
    name: 'New Delhi',
    country_id: 'c15',
    country_name: 'India',
    description:
      'Historic monuments, bustling markets, and emerging progressive spaces.',
    image_url:
      'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800',
    guide_count: 3,
  },
  {
    id: 'city21',
    slug: 'mumbai',
    name: 'Mumbai',
    country_id: 'c15',
    country_name: 'India',
    description:
      'Bollywood glamour, coastal energy, and a dynamic urban pulse.',
    image_url:
      'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=800',
    guide_count: 4,
  },
  {
    id: 'city22',
    slug: 'rome',
    name: 'Rome',
    country_id: 'c16',
    country_name: 'Italy',
    description: 'Eternal city of art, history, and timeless beauty.',
    image_url:
      'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
    guide_count: 5,
  },
  {
    id: 'city23',
    slug: 'gran-canaria',
    name: 'Gran Canaria',
    country_id: 'c1',
    country_name: 'Spain',
    description:
      'Year-round sunshine, diverse beaches, and a welcoming island atmosphere.',
    image_url:
      'https://images.unsplash.com/photo-1583328002935-6f6cd4603f66?w=800',
    guide_count: 3,
  },
  {
    id: 'city24',
    slug: 'malaga',
    name: 'Málaga',
    country_id: 'c1',
    country_name: 'Spain',
    description:
      "Costa del Sol beaches, Picasso's birthplace, and Andalusian charm.",
    image_url:
      'https://images.unsplash.com/photo-1549596794-0c5e7c5ae6f8?w=800',
    guide_count: 3,
  },
  {
    id: 'city25',
    slug: 'torremolinos',
    name: 'Torremolinos',
    country_id: 'c1',
    country_name: 'Spain',
    description:
      'Beachfront promenade, relaxed Mediterranean lifestyle, and warm community.',
    image_url:
      'https://images.unsplash.com/photo-1569946528953-5c4e29586015?w=800',
    guide_count: 2,
  },
];

// ============================================================================
// Mock Data - Guides
// ============================================================================

const MOCK_GUIDES: Guide[] = [
  {
    id: 'g1',
    name: 'Marco Silva',
    slug: 'marco-silva',
    city_id: 'city1',
    city_name: 'Barcelona',
    bio: "Born and raised in Barcelona, I've spent a decade exploring every corner of this city. From the architectural marvels of Gaudí to the hidden tapas bars locals cherish, I bring an insider's perspective with warmth and authenticity. My background in art history enriches our conversations as we wander through neighborhoods shaped by centuries of culture.",
    tagline: 'Art, architecture, and authentic Catalan experiences',
    photo_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    languages: ['English', 'Spanish', 'Catalan'],
    experience_tags: [
      'Architecture',
      'Art Scene',
      'Food & Drink',
      'Hidden Gems',
    ],
    price_4h: 140,
    price_6h: 200,
    price_8h: 250,
    rating: 4.8,
    review_count: 47,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g2',
    name: 'João Ferreira',
    slug: 'joao-ferreira',
    city_id: 'city2',
    city_name: 'Lisbon',
    bio: "I guide with the same care I'd show a close friend visiting for the first time. Lisbon's hills hold stories in every tile and doorway, and I love sharing them at a relaxed pace. Whether we're catching golden hour at a miradouro or discovering family-run restaurants, expect genuine connection and local insight.",
    tagline: "Lisbon's heart through local eyes",
    photo_url:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    languages: ['English', 'Portuguese'],
    experience_tags: [
      'Daytime Culture',
      'Food & Drink',
      'Hidden Gems',
      'Queer History',
    ],
    price_4h: 120,
    price_6h: 170,
    price_8h: 220,
    rating: 4.9,
    review_count: 63,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g3',
    name: 'Lars Andersen',
    slug: 'lars-andersen',
    city_id: 'city4',
    city_name: 'Berlin',
    bio: "Berlin transformed me, and I've called it home for fifteen years. From underground techno temples to quiet cafés where history whispers, I navigate both the legendary and the emerging. My tours blend cultural depth with the city's raw energy, always respecting that Berlin rewards the curious.",
    tagline: 'Underground culture and hidden histories',
    photo_url:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    languages: ['English', 'German', 'Danish'],
    experience_tags: ['Nightlife', 'Queer History', 'Art Scene', 'Hidden Gems'],
    price_4h: 150,
    price_6h: 210,
    price_8h: 270,
    rating: 4.7,
    review_count: 38,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g4',
    name: 'Aisha Patel',
    slug: 'aisha-patel',
    city_id: 'city5',
    city_name: 'London',
    bio: "London is a tapestry of villages, each with its own character. I grew up in East London and studied at UCL, giving me deep roots and academic curiosity. Together we'll discover markets, museums, and the evolving queer spaces that make this city endlessly fascinating.",
    tagline: 'Multicultural London with depth and warmth',
    photo_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    languages: ['English', 'Hindi', 'Gujarati'],
    experience_tags: [
      'Daytime Culture',
      'Food & Drink',
      'Art Scene',
      'Queer History',
    ],
    price_4h: 160,
    price_6h: 230,
    price_8h: 290,
    rating: 4.8,
    review_count: 52,
    verified: true,
    instant_book: false,
  },
  {
    id: 'g5',
    name: 'Diego Ruiz',
    slug: 'diego-ruiz',
    city_id: 'city6',
    city_name: 'New York City',
    bio: "New York raised me to be bold and compassionate. As a native New Yorker, I know the rhythm of these streets—from Stonewall's legacy to Brooklyn's creative renaissance. My tours honor history while celebrating the present, with time for great food and real conversations.",
    tagline: "NYC's soul, from Stonewall to today",
    photo_url:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
    languages: ['English', 'Spanish'],
    experience_tags: [
      'Queer History',
      'Daytime Culture',
      'Food & Drink',
      'Art Scene',
    ],
    price_4h: 180,
    price_6h: 260,
    price_8h: 330,
    rating: 4.9,
    review_count: 71,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g6',
    name: 'Santiago Morales',
    slug: 'santiago-morales',
    city_id: 'city7',
    city_name: 'Buenos Aires',
    bio: "Tango runs in my blood, and so does a deep love for this city's elegance and passion. I'll guide you through Belle Époque architecture, intimate milongas, and the neighborhoods where porteño life unfolds. Expect warmth, culture, and perhaps a dance lesson.",
    tagline: 'Tango, architecture, and porteño soul',
    photo_url:
      'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400',
    languages: ['English', 'Spanish'],
    experience_tags: [
      'Nightlife',
      'Daytime Culture',
      'Architecture',
      'Food & Drink',
    ],
    price_4h: 110,
    price_6h: 155,
    price_8h: 195,
    rating: 4.7,
    review_count: 29,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g7',
    name: 'Thiago Costa',
    slug: 'thiago-costa',
    city_id: 'city8',
    city_name: 'Rio de Janeiro',
    bio: "Rio is joy made visible—in our beaches, our music, our people. I'm a carioca who loves showing visitors the magic beyond the postcard views. From samba circles to hidden viewpoints, I bring energy and authenticity to every moment we share.",
    tagline: 'Beach culture, samba, and carioca spirit',
    photo_url:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
    languages: ['English', 'Portuguese'],
    experience_tags: ['Nature', 'Nightlife', 'Hidden Gems', 'Food & Drink'],
    price_4h: 100,
    price_6h: 140,
    price_8h: 180,
    rating: 4.8,
    review_count: 44,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g8',
    name: 'Emma van der Berg',
    slug: 'emma-van-der-berg',
    city_id: 'city10',
    city_name: 'Cape Town',
    bio: "Cape Town stole my heart years ago, and I've dedicated myself to exploring its many layers. From Table Mountain trails to the vibrant arts scene, I offer experiences that blend natural beauty with urban culture. My approach is thoughtful, inclusive, and always authentic.",
    tagline: 'Mountain meets ocean, culture meets nature',
    photo_url:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    languages: ['English', 'Afrikaans'],
    experience_tags: ['Nature', 'Art Scene', 'Daytime Culture', 'Hidden Gems'],
    price_4h: 95,
    price_6h: 135,
    price_8h: 170,
    rating: 4.9,
    review_count: 41,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g9',
    name: 'Ryan Mitchell',
    slug: 'ryan-mitchell',
    city_id: 'city12',
    city_name: 'Sydney',
    bio: "Sydney's harbor is my backyard, and I never tire of sharing its beauty. Born here, I know where to catch the best light, the finest coffee, and the most welcoming spaces. My tours balance iconic landmarks with local secrets, all delivered with genuine Aussie warmth.",
    tagline: 'Harbor views and local favorites',
    photo_url:
      'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400',
    languages: ['English'],
    experience_tags: [
      'Nature',
      'Daytime Culture',
      'Food & Drink',
      'Hidden Gems',
    ],
    price_4h: 145,
    price_6h: 205,
    price_8h: 260,
    rating: 4.7,
    review_count: 35,
    verified: true,
    instant_book: false,
  },
  {
    id: 'g10',
    name: 'Katrin Jónsdóttir',
    slug: 'katrin-jonsdottir',
    city_id: 'city13',
    city_name: 'Reykjavik',
    bio: "Iceland's beauty is otherworldly, and Reykjavik is its warm heart. I guide with respect for nature and genuine care for the people I meet. Whether we're hunting northern lights or exploring geothermal pools, I create experiences that feel both magical and authentic.",
    tagline: 'Northern lights and Nordic warmth',
    photo_url:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
    languages: ['English', 'Icelandic'],
    experience_tags: ['Nature', 'Hidden Gems', 'Daytime Culture'],
    price_4h: 170,
    price_6h: 240,
    price_8h: 300,
    rating: 4.9,
    review_count: 27,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g11',
    name: 'Sofia Papadopoulos',
    slug: 'sofia-papadopoulos',
    city_id: 'city17',
    city_name: 'Athens',
    bio: "Athens is ancient and alive, and I help travelers feel both timelines at once. As an archaeologist turned guide, I bring scholarly depth with personal warmth. We'll explore ruins at dawn and contemporary neighborhoods by evening, always with space for spontaneity.",
    tagline: 'Ancient wisdom, modern Athens',
    photo_url:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    languages: ['English', 'Greek'],
    experience_tags: [
      'Daytime Culture',
      'Architecture',
      'Food & Drink',
      'Queer History',
    ],
    price_4h: 115,
    price_6h: 160,
    price_8h: 205,
    rating: 4.8,
    review_count: 33,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g12',
    name: 'Carlos Mendoza',
    slug: 'carlos-mendoza',
    city_id: 'city19',
    city_name: 'Mexico City',
    bio: "Mexico City is vast and endlessly rewarding. Born in Coyoacán, I've spent years uncovering its treasures—from Frida's world to street food that'll change your life. I guide with passion, humor, and deep respect for our culture's complexity.",
    tagline: 'Art, history, and unforgettable flavors',
    photo_url:
      'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=400',
    languages: ['English', 'Spanish'],
    experience_tags: [
      'Food & Drink',
      'Art Scene',
      'Daytime Culture',
      'Hidden Gems',
    ],
    price_4h: 105,
    price_6h: 150,
    price_8h: 190,
    rating: 4.9,
    review_count: 56,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g13',
    name: 'Priya Sharma',
    slug: 'priya-sharma',
    city_id: 'city21',
    city_name: 'Mumbai',
    bio: 'Mumbai never sleeps, and neither does my curiosity about this city. From Bollywood studios to heritage buildings to emerging queer spaces, I navigate it all with care and local insight. My tours honor tradition while celebrating change.',
    tagline: 'Bollywood glamour meets local soul',
    photo_url:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
    languages: ['English', 'Hindi', 'Marathi'],
    experience_tags: [
      'Daytime Culture',
      'Art Scene',
      'Food & Drink',
      'Hidden Gems',
    ],
    price_4h: 85,
    price_6h: 120,
    price_8h: 155,
    rating: 4.7,
    review_count: 31,
    verified: true,
    instant_book: false,
  },
  {
    id: 'g14',
    name: 'Alessandro Romano',
    slug: 'alessandro-romano',
    city_id: 'city22',
    city_name: 'Rome',
    bio: 'Rome is my classroom and my muse. With a degree in Renaissance art, I bring context to every piazza and fountain. But beyond the famous sites, I know the trattorias, the artisan workshops, and the quiet corners where Rome reveals its true character.',
    tagline: 'Eternal beauty with Italian warmth',
    photo_url:
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400',
    languages: ['English', 'Italian'],
    experience_tags: [
      'Architecture',
      'Art Scene',
      'Food & Drink',
      'Daytime Culture',
    ],
    price_4h: 155,
    price_6h: 220,
    price_8h: 280,
    rating: 4.8,
    review_count: 49,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g15',
    name: 'Mateo Ibarra',
    slug: 'mateo-ibarra',
    city_id: 'city1',
    city_name: 'Barcelona',
    bio: "Barcelona's nightlife is legendary, and I'm your guide to its best moments. Beyond the clubs, I know the intimate bars, rooftop terraces, and after-hours spots where locals gather. Expect great energy, safety, and authentic connections.",
    tagline: 'Barcelona after dark',
    photo_url:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
    languages: ['English', 'Spanish', 'Catalan'],
    experience_tags: ['Nightlife', 'Hidden Gems', 'Food & Drink'],
    price_4h: 130,
    price_6h: 185,
    price_8h: 235,
    rating: 4.6,
    review_count: 28,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g16',
    name: 'Isabel Costa',
    slug: 'isabel-costa',
    city_id: 'city2',
    city_name: 'Lisbon',
    bio: "Fado music and Portuguese soul guide my approach to this city. I'm a storyteller who loves connecting travelers to Lisbon's heart—through music, food, and meaningful conversations. My pace is relaxed, my knowledge is deep, and my warmth is genuine.",
    tagline: 'Fado, food, and Portuguese soul',
    photo_url:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    languages: ['English', 'Portuguese', 'French'],
    experience_tags: ['Food & Drink', 'Daytime Culture', 'Art Scene'],
    price_4h: 125,
    price_6h: 175,
    price_8h: 225,
    rating: 4.9,
    review_count: 58,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g17',
    name: 'Felix Weber',
    slug: 'felix-weber',
    city_id: 'city4',
    city_name: 'Berlin',
    bio: "Berlin is where I came into myself, and I guide with that gratitude. My background in urban planning means I understand how this city evolved, and my love for people means I create space for authentic exchange. Art, history, nightlife—I'm your bridge to it all.",
    tagline: 'Urban history and authentic connections',
    photo_url:
      'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400',
    languages: ['English', 'German'],
    experience_tags: [
      'Architecture',
      'Queer History',
      'Art Scene',
      'Nightlife',
    ],
    price_4h: 145,
    price_6h: 205,
    price_8h: 260,
    rating: 4.8,
    review_count: 43,
    verified: true,
    instant_book: false,
  },
  {
    id: 'g18',
    name: 'Olivia Chen',
    slug: 'olivia-chen',
    city_id: 'city6',
    city_name: 'New York City',
    bio: 'New York is a collection of villages, and I help you find your favorite. Born in Queens, educated in Manhattan, living in Brooklyn—I bridge worlds naturally. My tours emphasize food, art, and the immigrant stories that built this incredible city.',
    tagline: "NYC's diversity, one neighborhood at a time",
    photo_url:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    languages: ['English', 'Mandarin'],
    experience_tags: [
      'Food & Drink',
      'Art Scene',
      'Daytime Culture',
      'Hidden Gems',
    ],
    price_4h: 175,
    price_6h: 250,
    price_8h: 315,
    rating: 4.8,
    review_count: 62,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g19',
    name: 'André Dubois',
    slug: 'andre-dubois',
    city_id: 'city3',
    city_name: 'Porto',
    bio: "Porto is intimate and timeless, and I guide accordingly. As a sommelier and Porto native, I blend wine knowledge with local lore. We'll taste our way through cellars and neighborhoods, always with care for authenticity and your comfort.",
    tagline: 'Port wine and riverside charm',
    photo_url:
      'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=400',
    languages: ['English', 'Portuguese', 'French'],
    experience_tags: ['Food & Drink', 'Daytime Culture', 'Hidden Gems'],
    price_4h: 115,
    price_6h: 160,
    price_8h: 205,
    rating: 4.7,
    review_count: 24,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g20',
    name: 'Maya Johnson',
    slug: 'maya-johnson',
    city_id: 'city5',
    city_name: 'London',
    bio: 'London is layered with stories, and I help you peel them back thoughtfully. My background in theatre gives me a flair for narrative, while my community work keeps me grounded in real London life. Expect depth, warmth, and a few surprises.',
    tagline: 'Stories, culture, and hidden London',
    photo_url:
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400',
    languages: ['English'],
    experience_tags: [
      'Art Scene',
      'Queer History',
      'Daytime Culture',
      'Hidden Gems',
    ],
    price_4h: 165,
    price_6h: 235,
    price_8h: 295,
    rating: 4.9,
    review_count: 55,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g21',
    name: 'Kai Nakamura',
    slug: 'kai-nakamura',
    city_id: 'city12',
    city_name: 'Sydney',
    bio: 'Sydney embraced me when I moved here a decade ago, and I pay that forward every day. I love showing visitors both the iconic and the unexpected—from coastal walks to inner-city culture. My style is warm, informed, and always respectful of your pace.',
    tagline: 'Coastal beauty and urban culture',
    photo_url:
      'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400',
    languages: ['English', 'Japanese'],
    experience_tags: ['Nature', 'Food & Drink', 'Daytime Culture'],
    price_4h: 140,
    price_6h: 200,
    price_8h: 250,
    rating: 4.8,
    review_count: 39,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g22',
    name: 'Luca Bianchi',
    slug: 'luca-bianchi',
    city_id: 'city22',
    city_name: 'Rome',
    bio: "Rome rewards those who wander with purpose, and I'm here to provide that guidance. I blend art history expertise with a relaxed Italian approach to life. We'll see masterpieces and taste exceptional food, always with time to simply be present.",
    tagline: 'La dolce vita with cultural depth',
    photo_url:
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400',
    languages: ['English', 'Italian', 'Spanish'],
    experience_tags: [
      'Daytime Culture',
      'Food & Drink',
      'Architecture',
      'Art Scene',
    ],
    price_4h: 150,
    price_6h: 215,
    price_8h: 270,
    rating: 4.7,
    review_count: 37,
    verified: true,
    instant_book: false,
  },
  {
    id: 'g23',
    name: 'Nina Sokolov',
    slug: 'nina-sokolov',
    city_id: 'city4',
    city_name: 'Berlin',
    bio: "Berlin is freedom expressed in concrete and creativity. I moved here for the art scene and stayed for the community. My tours blend gallery visits with street art discoveries, always grounded in the city's complex history and vibrant present.",
    tagline: "Art, freedom, and Berlin's soul",
    photo_url:
      'https://images.unsplash.com/photo-1546961342-78bea45a5d2b?w=400',
    languages: ['English', 'German', 'Russian'],
    experience_tags: [
      'Art Scene',
      'Queer History',
      'Hidden Gems',
      'Daytime Culture',
    ],
    price_4h: 140,
    price_6h: 195,
    price_8h: 250,
    rating: 4.8,
    review_count: 41,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g24',
    name: 'Rafael Santos',
    slug: 'rafael-santos',
    city_id: 'city9',
    city_name: 'São Paulo',
    bio: "São Paulo is Brazil's beating heart, and I'm here to help you feel its rhythm. From street art in Vila Madalena to the best feijoada in town, I share this megalopolis with pride and authenticity. Expect energy, warmth, and real connections.",
    tagline: "São Paulo's energy and artistic spirit",
    photo_url:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
    languages: ['English', 'Portuguese'],
    experience_tags: [
      'Art Scene',
      'Food & Drink',
      'Nightlife',
      'Daytime Culture',
    ],
    price_4h: 95,
    price_6h: 135,
    price_8h: 170,
    rating: 4.7,
    review_count: 32,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g25',
    name: 'Omar Hassan',
    slug: 'omar-hassan',
    city_id: 'city5',
    city_name: 'London',
    bio: "London is where tradition meets transformation, and I navigate both with care. My family has been here for three generations, giving me deep roots and broad perspectives. I create experiences that honor diversity while exploring the city's magnificent history.",
    tagline: 'Heritage and change in multicultural London',
    photo_url:
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400',
    languages: ['English', 'Arabic', 'French'],
    experience_tags: [
      'Daytime Culture',
      'Food & Drink',
      'Architecture',
      'Queer History',
    ],
    price_4h: 155,
    price_6h: 220,
    price_8h: 280,
    rating: 4.8,
    review_count: 46,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g26',
    name: 'Elena Vasquez',
    slug: 'elena-vasquez',
    city_id: 'city1',
    city_name: 'Barcelona',
    bio: 'Barcelona is architecture come to life, and I help visitors truly see it. With a background in design, I offer context that transforms how you experience the city. But I also know the best beaches, markets, and hidden corners—Barcelona is multifaceted, and so are my tours.',
    tagline: 'Design, culture, and Mediterranean spirit',
    photo_url:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    languages: ['English', 'Spanish', 'Catalan'],
    experience_tags: [
      'Architecture',
      'Art Scene',
      'Daytime Culture',
      'Hidden Gems',
    ],
    price_4h: 145,
    price_6h: 205,
    price_8h: 260,
    rating: 4.9,
    review_count: 51,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g27',
    name: 'Thomas Larsen',
    slug: 'thomas-larsen',
    city_id: 'city14',
    city_name: 'Oslo',
    bio: "Oslo is where nature and culture meet seamlessly, and I embody that balance. Whether we're exploring Viking heritage or contemporary art, hiking nearby forests or enjoying Nordic cuisine, I bring thoughtfulness and genuine Norwegian warmth to every experience.",
    tagline: 'Nordic nature and cultural treasures',
    photo_url:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    languages: ['English', 'Norwegian'],
    experience_tags: ['Nature', 'Art Scene', 'Daytime Culture', 'Food & Drink'],
    price_4h: 160,
    price_6h: 225,
    price_8h: 285,
    rating: 4.7,
    review_count: 22,
    verified: true,
    instant_book: false,
  },
  {
    id: 'g28',
    name: 'Amara Williams',
    slug: 'amara-williams',
    city_id: 'city11',
    city_name: 'Johannesburg',
    bio: 'Johannesburg is complex, dynamic, and endlessly creative. I guide with honesty and heart, showing both the challenges and the incredible resilience of this city. My focus is on art, music, and the stories that shape contemporary South Africa.',
    tagline: "Art, music, and Joburg's dynamic spirit",
    photo_url:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
    languages: ['English', 'Zulu'],
    experience_tags: [
      'Art Scene',
      'Daytime Culture',
      'Queer History',
      'Hidden Gems',
    ],
    price_4h: 90,
    price_6h: 125,
    price_8h: 160,
    rating: 4.8,
    review_count: 19,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g29',
    name: 'Hiroshi Tanaka',
    slug: 'hiroshi-tanaka',
    city_id: 'city15',
    city_name: 'Chiang Mai',
    bio: 'I moved to Chiang Mai for its serenity and stayed for its warmth. As someone who guides mindfully, I create experiences that balance temple visits with nature, traditional culture with emerging scenes. My approach is calm, respectful, and deeply informed.',
    tagline: 'Temples, nature, and Northern Thai soul',
    photo_url:
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400',
    languages: ['English', 'Thai', 'Japanese'],
    experience_tags: [
      'Daytime Culture',
      'Nature',
      'Hidden Gems',
      'Food & Drink',
    ],
    price_4h: 80,
    price_6h: 110,
    price_8h: 140,
    rating: 4.9,
    review_count: 36,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g30',
    name: 'Victoria Martinez',
    slug: 'victoria-martinez',
    city_id: 'city6',
    city_name: 'New York City',
    bio: "New York is my muse and my home. I'm a photographer who became a guide because I wanted to share the city I see through my lens. My tours are visual journeys—we'll chase light, discover hidden architectural gems, and capture moments that tell NYC's story.",
    tagline: 'NYC through a creative lens',
    photo_url:
      'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=400',
    languages: ['English', 'Spanish'],
    experience_tags: [
      'Architecture',
      'Art Scene',
      'Hidden Gems',
      'Daytime Culture',
    ],
    price_4h: 170,
    price_6h: 240,
    price_8h: 305,
    rating: 4.8,
    review_count: 48,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g31',
    name: 'Gabriel Lima',
    slug: 'gabriel-lima',
    city_id: 'city24',
    city_name: 'Málaga',
    bio: "Málaga is sunshine, art, and Andalusian soul. Born here, I know every beach, every tapas bar worth your time, and the stories behind Picasso's city. I guide with the relaxed warmth that defines southern Spain, always making time for good conversations and better food.",
    tagline: 'Andalusian warmth and coastal beauty',
    photo_url:
      'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400',
    languages: ['English', 'Spanish'],
    experience_tags: [
      'Food & Drink',
      'Art Scene',
      'Daytime Culture',
      'Hidden Gems',
    ],
    price_4h: 110,
    price_6h: 155,
    price_8h: 195,
    rating: 4.7,
    review_count: 26,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g32',
    name: 'Arun Kumar',
    slug: 'arun-kumar',
    city_id: 'city20',
    city_name: 'New Delhi',
    bio: "Delhi is a city of contrasts, and I help visitors navigate them with grace. From ancient monuments to emerging progressive spaces, I guide with knowledge, patience, and genuine care. My goal is to show you Delhi's complexity while keeping you comfortable and safe.",
    tagline: 'Ancient Delhi meets modern India',
    photo_url:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
    languages: ['English', 'Hindi', 'Punjabi'],
    experience_tags: [
      'Daytime Culture',
      'Food & Drink',
      'Architecture',
      'Hidden Gems',
    ],
    price_4h: 80,
    price_6h: 110,
    price_8h: 140,
    rating: 4.6,
    review_count: 23,
    verified: true,
    instant_book: false,
  },
  {
    id: 'g33',
    name: 'Marcus Jensen',
    slug: 'marcus-jensen',
    city_id: 'city1',
    city_name: 'Barcelona',
    bio: "Barcelona became my home after years of traveling, and I understand what visitors seek because I was once one. My tours emphasize connection over checklist—we'll explore neighborhoods deeply, meet local friends, and discover the Barcelona that residents love.",
    tagline: 'Local connections and authentic experiences',
    photo_url:
      'https://images.unsplash.com/photo-1542909168-82c3e7fdca44?w=400',
    languages: ['English', 'Spanish', 'Swedish'],
    experience_tags: [
      'Hidden Gems',
      'Food & Drink',
      'Daytime Culture',
      'Nightlife',
    ],
    price_4h: 135,
    price_6h: 190,
    price_8h: 240,
    rating: 4.8,
    review_count: 34,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g34',
    name: 'Natasha Volkov',
    slug: 'natasha-volkov',
    city_id: 'city16',
    city_name: 'Pattaya',
    bio: "Pattaya offers more than its reputation suggests, and I'm here to show you its heart. Beyond the nightlife, there's natural beauty, local culture, and genuine warmth. I guide with honesty and care, creating experiences tailored to what you're truly seeking.",
    tagline: 'Beyond the beaches, authentic Pattaya',
    photo_url:
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',
    languages: ['English', 'Thai', 'Russian'],
    experience_tags: ['Nightlife', 'Nature', 'Food & Drink', 'Hidden Gems'],
    price_4h: 85,
    price_6h: 120,
    price_8h: 150,
    rating: 4.5,
    review_count: 18,
    verified: true,
    instant_book: true,
  },
  {
    id: 'g35',
    name: 'Isabella Fernandez',
    slug: 'isabella-fernandez',
    city_id: 'city23',
    city_name: 'Gran Canaria',
    bio: 'Gran Canaria is my paradise, and I love sharing its diversity. From golden dunes to mountain villages to vibrant beach scenes, this island has it all. I guide with the warmth of someone who chose this place intentionally and never looked back.',
    tagline: 'Island diversity and year-round sunshine',
    photo_url:
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
    languages: ['English', 'Spanish'],
    experience_tags: ['Nature', 'Hidden Gems', 'Daytime Culture', 'Nightlife'],
    price_4h: 120,
    price_6h: 170,
    price_8h: 215,
    rating: 4.8,
    review_count: 29,
    verified: true,
    instant_book: true,
  },
];

// ============================================================================
// Mock Data - Users
// ============================================================================

const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Marco Silva',
    email: 'marco@example.com',
    role: 'guide',
    photo_url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    id: 'u2',
    name: 'João Ferreira',
    email: 'joao@example.com',
    role: 'guide',
    photo_url:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  },
  {
    id: 'u3',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    role: 'traveler',
    photo_url:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  },
  {
    id: 'u4',
    name: 'Michael Brown',
    email: 'michael@example.com',
    role: 'traveler',
    photo_url:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  },
  {
    id: 'u5',
    name: 'Lars Andersen',
    email: 'lars@example.com',
    role: 'guide',
    photo_url:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
  },
  {
    id: 'u6',
    name: 'Emma Thompson',
    email: 'emma@example.com',
    role: 'traveler',
    photo_url:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  },
  {
    id: 'u7',
    name: 'Diego Ruiz',
    email: 'diego@example.com',
    role: 'guide',
    photo_url:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400',
  },
  {
    id: 'u8',
    name: 'Alex Kim',
    email: 'alex@example.com',
    role: 'traveler',
    photo_url:
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400',
  },
  {
    id: 'u9',
    name: 'Sofia Martinez',
    email: 'sofia@example.com',
    role: 'traveler',
    photo_url:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  },
  {
    id: 'u10',
    name: "Ryan O'Connor",
    email: 'ryan@example.com',
    role: 'traveler',
    photo_url:
      'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400',
  },
  {
    id: 'u11',
    name: 'Priya Sharma',
    email: 'priya@example.com',
    role: 'guide',
    photo_url:
      'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400',
  },
  {
    id: 'u12',
    name: 'David Wilson',
    email: 'david@example.com',
    role: 'traveler',
    photo_url:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
  },
  {
    id: 'u13',
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    role: 'traveler',
    photo_url:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
  },
  {
    id: 'u14',
    name: 'Carlos Mendoza',
    email: 'carlos@example.com',
    role: 'guide',
    photo_url:
      'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=400',
  },
  {
    id: 'u15',
    name: 'Nina Petrov',
    email: 'nina@example.com',
    role: 'traveler',
    photo_url:
      'https://images.unsplash.com/photo-1546961342-78bea45a5d2b?w=400',
  },
  {
    id: 'u16',
    name: 'James Taylor',
    email: 'james@example.com',
    role: 'traveler',
    photo_url:
      'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400',
  },
  {
    id: 'u17',
    name: 'Elena Rodriguez',
    email: 'elena@example.com',
    role: 'traveler',
    photo_url:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
  },
  {
    id: 'u18',
    name: 'Admin User',
    email: 'admin@rainbowtourguides.com',
    role: 'admin',
    photo_url:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
  },
  {
    id: 'u19',
    name: 'Thomas Berg',
    email: 'thomas@example.com',
    role: 'traveler',
    photo_url:
      'https://images.unsplash.com/photo-1542909168-82c3e7fdca44?w=400',
  },
  {
    id: 'u20',
    name: 'Maya Johnson',
    email: 'maya@example.com',
    role: 'guide',
    photo_url:
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400',
  },
];

// ============================================================================
// Mock Data - Bookings
// ============================================================================

const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    traveler_id: 'u3',
    guide_id: 'g1',
    guide_name: 'Marco Silva',
    city_name: 'Barcelona',
    date: '2026-01-20',
    duration: 4,
    status: 'confirmed',
    price_total: 140,
  },
  {
    id: 'b2',
    traveler_id: 'u4',
    guide_id: 'g2',
    guide_name: 'João Ferreira',
    city_name: 'Lisbon',
    date: '2026-01-25',
    duration: 6,
    status: 'confirmed',
    price_total: 170,
  },
  {
    id: 'b3',
    traveler_id: 'u6',
    guide_id: 'g3',
    guide_name: 'Lars Andersen',
    city_name: 'Berlin',
    date: '2026-01-18',
    duration: 8,
    status: 'completed',
    price_total: 270,
  },
  {
    id: 'b4',
    traveler_id: 'u8',
    guide_id: 'g5',
    guide_name: 'Diego Ruiz',
    city_name: 'New York City',
    date: '2026-02-01',
    duration: 4,
    status: 'pending',
    price_total: 180,
  },
  {
    id: 'b5',
    traveler_id: 'u9',
    guide_id: 'g12',
    guide_name: 'Carlos Mendoza',
    city_name: 'Mexico City',
    date: '2026-01-28',
    duration: 6,
    status: 'confirmed',
    price_total: 150,
  },
  {
    id: 'b6',
    traveler_id: 'u10',
    guide_id: 'g9',
    guide_name: 'Ryan Mitchell',
    city_name: 'Sydney',
    date: '2026-01-15',
    duration: 4,
    status: 'completed',
    price_total: 145,
  },
  {
    id: 'b7',
    traveler_id: 'u12',
    guide_id: 'g8',
    guide_name: 'Emma van der Berg',
    city_name: 'Cape Town',
    date: '2026-02-05',
    duration: 8,
    status: 'confirmed',
    price_total: 170,
  },
  {
    id: 'b8',
    traveler_id: 'u13',
    guide_id: 'g14',
    guide_name: 'Alessandro Romano',
    city_name: 'Rome',
    date: '2026-01-22',
    duration: 6,
    status: 'confirmed',
    price_total: 220,
  },
  {
    id: 'b9',
    traveler_id: 'u15',
    guide_id: 'g4',
    guide_name: 'Aisha Patel',
    city_name: 'London',
    date: '2026-01-30',
    duration: 4,
    status: 'pending',
    price_total: 160,
  },
  {
    id: 'b10',
    traveler_id: 'u16',
    guide_id: 'g7',
    guide_name: 'Thiago Costa',
    city_name: 'Rio de Janeiro',
    date: '2026-02-10',
    duration: 6,
    status: 'confirmed',
    price_total: 140,
  },
  {
    id: 'b11',
    traveler_id: 'u17',
    guide_id: 'g11',
    guide_name: 'Sofia Papadopoulos',
    city_name: 'Athens',
    date: '2026-01-27',
    duration: 4,
    status: 'confirmed',
    price_total: 115,
  },
  {
    id: 'b12',
    traveler_id: 'u19',
    guide_id: 'g16',
    guide_name: 'Isabel Costa',
    city_name: 'Lisbon',
    date: '2026-01-12',
    duration: 8,
    status: 'completed',
    price_total: 225,
  },
  {
    id: 'b13',
    traveler_id: 'u3',
    guide_id: 'g18',
    guide_name: 'Olivia Chen',
    city_name: 'New York City',
    date: '2026-02-15',
    duration: 6,
    status: 'pending',
    price_total: 250,
  },
  {
    id: 'b14',
    traveler_id: 'u4',
    guide_id: 'g26',
    guide_name: 'Elena Vasquez',
    city_name: 'Barcelona',
    date: '2026-01-19',
    duration: 4,
    status: 'cancelled_by_traveler',
    price_total: 145,
  },
  {
    id: 'b15',
    traveler_id: 'u6',
    guide_id: 'g29',
    guide_name: 'Hiroshi Tanaka',
    city_name: 'Chiang Mai',
    date: '2026-02-20',
    duration: 8,
    status: 'confirmed',
    price_total: 140,
  },
];

// ============================================================================
// Mock Data - Reviews
// ============================================================================

const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    booking_id: 'b3',
    guide_id: 'g3',
    traveler_name: 'Emma Thompson',
    rating: 5,
    comment:
      "Lars was phenomenal. His knowledge of Berlin's history and culture is unmatched, and he made the experience feel personal and safe. Highly recommend for anyone wanting to understand the real Berlin.",
    date: '2026-01-19',
  },
  {
    id: 'r2',
    booking_id: 'b6',
    guide_id: 'g9',
    traveler_name: "Ryan O'Connor",
    rating: 5,
    comment:
      "Ryan showed me Sydney through local eyes—the best coffee spots, hidden beaches, and stories I'd never find in a guidebook. Felt like exploring with a friend.",
    date: '2026-01-16',
  },
  {
    id: 'r3',
    booking_id: 'b12',
    guide_id: 'g16',
    traveler_name: 'Thomas Berg',
    rating: 5,
    comment:
      "Isabel's passion for Lisbon is contagious. The food, the fado music, the stories—every moment felt authentic and special. This was the highlight of my trip.",
    date: '2026-01-13',
  },
  {
    id: 'r4',
    booking_id: 'b1',
    guide_id: 'g1',
    traveler_name: 'Sarah Chen',
    rating: 5,
    comment:
      "Marco's architectural insights transformed how I see Barcelona. He balanced famous sites with hidden gems, and his warmth made the day flow perfectly.",
    date: '2026-01-21',
  },
  {
    id: 'r5',
    booking_id: 'b2',
    guide_id: 'g2',
    traveler_name: 'Michael Brown',
    rating: 5,
    comment:
      'João is a wonderful guide—thoughtful, knowledgeable, and genuinely kind. He took time to understand what I wanted and delivered an experience that exceeded expectations.',
    date: '2026-01-26',
  },
  {
    id: 'r6',
    booking_id: 'b5',
    guide_id: 'g12',
    traveler_name: 'Sofia Martinez',
    rating: 5,
    comment:
      'Carlos brought Mexico City to life with his stories and humor. The food tour alone was worth it, but his insights into local culture made it unforgettable.',
    date: '2026-01-29',
  },
  {
    id: 'r7',
    booking_id: 'b7',
    guide_id: 'g8',
    traveler_name: 'David Wilson',
    rating: 5,
    comment:
      "Emma's love for Cape Town shines through in every recommendation. We hiked, explored neighborhoods, and ate incredibly well. Couldn't ask for a better guide.",
    date: '2026-02-06',
  },
  {
    id: 'r8',
    booking_id: 'b8',
    guide_id: 'g14',
    traveler_name: 'Lisa Anderson',
    rating: 4,
    comment:
      'Alessandro knows Rome inside and out. The art history context was fascinating, though we covered a lot of ground quickly. Would recommend for culture enthusiasts.',
    date: '2026-01-23',
  },
  {
    id: 'r9',
    booking_id: 'b10',
    guide_id: 'g7',
    traveler_name: 'James Taylor',
    rating: 5,
    comment:
      "Thiago's energy is infectious! Rio's beauty is one thing, but experiencing it with someone who truly loves the city made all the difference. Obrigado!",
    date: '2026-02-11',
  },
  {
    id: 'r10',
    booking_id: 'b11',
    guide_id: 'g11',
    traveler_name: 'Elena Rodriguez',
    rating: 5,
    comment:
      "Sofia's archaeological background added so much depth to our Athens tour. She balanced ancient history with modern recommendations perfectly.",
    date: '2026-01-28',
  },
  {
    id: 'r11',
    booking_id: 'b1',
    guide_id: 'g1',
    traveler_name: 'Sarah Chen',
    rating: 5,
    comment:
      'Second time booking with Marco—he remembered details from our first tour and tailored this one beautifully. Exceptional guide.',
    date: '2026-01-21',
  },
  {
    id: 'r12',
    booking_id: 'b3',
    guide_id: 'g3',
    traveler_name: 'Emma Thompson',
    rating: 5,
    comment:
      "Lars made me feel safe and welcome while showing me Berlin's most vibrant queer spaces. Grateful for his care and expertise.",
    date: '2026-01-19',
  },
  {
    id: 'r13',
    booking_id: 'b6',
    guide_id: 'g9',
    traveler_name: "Ryan O'Connor",
    rating: 4,
    comment:
      "Great tour of Sydney's highlights. Ryan was friendly and knowledgeable. Would have loved more time at the beaches!",
    date: '2026-01-16',
  },
  {
    id: 'r14',
    booking_id: 'b12',
    guide_id: 'g16',
    traveler_name: 'Thomas Berg',
    rating: 5,
    comment:
      "Isabel's fado recommendations were life-changing. Such a soulful evening in Alfama.",
    date: '2026-01-13',
  },
  {
    id: 'r15',
    booking_id: 'b5',
    guide_id: 'g12',
    traveler_name: 'Sofia Martinez',
    rating: 5,
    comment:
      'Carlos is a gem. His knowledge of Mexican history and contemporary culture created a rich, layered experience.',
    date: '2026-01-29',
  },
  {
    id: 'r16',
    booking_id: 'b8',
    guide_id: 'g14',
    traveler_name: 'Lisa Anderson',
    rating: 5,
    comment:
      "Alessandro's passion for Rome is evident in every story. The Trastevere dinner recommendation alone was worth the tour!",
    date: '2026-01-23',
  },
  {
    id: 'r17',
    booking_id: 'b10',
    guide_id: 'g7',
    traveler_name: 'James Taylor',
    rating: 5,
    comment:
      'Thiago showed me both tourist Rio and local Rio. The contrast was eye-opening and deeply appreciated.',
    date: '2026-02-11',
  },
  {
    id: 'r18',
    booking_id: 'b11',
    guide_id: 'g11',
    traveler_name: 'Elena Rodriguez',
    rating: 5,
    comment:
      "Sofia's storytelling brought ancient Athens to life. One of the best tour experiences I've ever had.",
    date: '2026-01-28',
  },
  {
    id: 'r19',
    booking_id: 'b7',
    guide_id: 'g8',
    traveler_name: 'David Wilson',
    rating: 5,
    comment:
      "Emma's recommendations for Cape Town were spot-on. She knows this city intimately and shares it generously.",
    date: '2026-02-06',
  },
  {
    id: 'r20',
    booking_id: 'b2',
    guide_id: 'g2',
    traveler_name: 'Michael Brown',
    rating: 5,
    comment:
      'João made me fall in love with Lisbon. His calm, thoughtful approach was exactly what I needed.',
    date: '2026-01-26',
  },
  {
    id: 'r21',
    booking_id: 'b1',
    guide_id: 'g1',
    traveler_name: 'Sarah Chen',
    rating: 5,
    comment:
      "Marco's Barcelona is the Barcelona I dreamed of—beautiful, authentic, and welcoming.",
    date: '2026-01-21',
  },
  {
    id: 'r22',
    booking_id: 'b5',
    guide_id: 'g12',
    traveler_name: 'Sofia Martinez',
    rating: 4,
    comment:
      'Wonderful food tour with Carlos. Would have loved a bit more time at each stop, but overall excellent.',
    date: '2026-01-29',
  },
  {
    id: 'r23',
    booking_id: 'b6',
    guide_id: 'g9',
    traveler_name: "Ryan O'Connor",
    rating: 5,
    comment:
      "Ryan's Sydney tour exceeded expectations. Felt like I discovered the city's soul in just one day.",
    date: '2026-01-16',
  },
  {
    id: 'r24',
    booking_id: 'b8',
    guide_id: 'g14',
    traveler_name: 'Lisa Anderson',
    rating: 5,
    comment:
      'Alessandro is the perfect blend of knowledgeable and personable. Rome never felt overwhelming with him as our guide.',
    date: '2026-01-23',
  },
  {
    id: 'r25',
    booking_id: 'b3',
    guide_id: 'g3',
    traveler_name: 'Emma Thompson',
    rating: 5,
    comment:
      "Lars is a treasure. His Berlin is layered, complex, and endlessly fascinating. Can't wait to return.",
    date: '2026-01-19',
  },
];

// ============================================================================
// Mock Data - Messages
// ============================================================================

const MOCK_MESSAGES: Message[] = [
  {
    id: 'm1',
    booking_id: 'b1',
    sender_id: 'u3',
    sender_name: 'Sarah Chen',
    content:
      "Hi Marco! Looking forward to the tour tomorrow. Any specific shoes you'd recommend?",
    timestamp: '2026-01-19T14:30:00Z',
  },
  {
    id: 'm2',
    booking_id: 'b1',
    sender_id: 'g1',
    sender_name: 'Marco Silva',
    content:
      "Hi Sarah! Comfortable walking shoes are perfect—we'll cover some ground but nothing too strenuous. See you tomorrow!",
    timestamp: '2026-01-19T15:45:00Z',
  },
  {
    id: 'm3',
    booking_id: 'b2',
    sender_id: 'u4',
    sender_name: 'Michael Brown',
    content:
      "João, I'm interested in fado music. Can we include that in our tour?",
    timestamp: '2026-01-24T10:20:00Z',
  },
  {
    id: 'm4',
    booking_id: 'b2',
    sender_id: 'g2',
    sender_name: 'João Ferreira',
    content:
      "Absolutely! I know a perfect spot in Alfama for authentic fado. We'll build our route around that.",
    timestamp: '2026-01-24T11:00:00Z',
  },
  {
    id: 'm5',
    booking_id: 'b4',
    sender_id: 'u8',
    sender_name: 'Alex Kim',
    content: 'Hi Diego, is the Stonewall visit included in the 4-hour tour?',
    timestamp: '2026-01-30T09:15:00Z',
  },
  {
    id: 'm6',
    booking_id: 'b4',
    sender_id: 'g5',
    sender_name: 'Diego Ruiz',
    content:
      "Hi Alex! Yes, Stonewall is a key stop. We'll spend time there and in the surrounding West Village area. It's meaningful history.",
    timestamp: '2026-01-30T10:30:00Z',
  },
  {
    id: 'm7',
    booking_id: 'b5',
    sender_id: 'u9',
    sender_name: 'Sofia Martinez',
    content:
      'Carlos, I have a mild nut allergy—will that be an issue for the food stops?',
    timestamp: '2026-01-27T16:00:00Z',
  },
  {
    id: 'm8',
    booking_id: 'b5',
    sender_id: 'g12',
    sender_name: 'Carlos Mendoza',
    content:
      "Thanks for letting me know, Sofia! I'll make sure all our food stops are aware and we'll avoid any dishes with nuts. You're in safe hands.",
    timestamp: '2026-01-27T16:45:00Z',
  },
  {
    id: 'm9',
    booking_id: 'b7',
    sender_id: 'u12',
    sender_name: 'David Wilson',
    content: "Emma, what's the weather looking like for our tour day?",
    timestamp: '2026-02-03T08:30:00Z',
  },
  {
    id: 'm10',
    booking_id: 'b7',
    sender_id: 'g8',
    sender_name: 'Emma van der Berg',
    content:
      'Hi David! Forecast shows sunny and 24°C—perfect Cape Town weather. Bring sunscreen and sunglasses!',
    timestamp: '2026-02-03T09:00:00Z',
  },
  {
    id: 'm11',
    booking_id: 'b8',
    sender_id: 'u13',
    sender_name: 'Lisa Anderson',
    content:
      'Alessandro, can we start a bit earlier to avoid crowds at the Colosseum?',
    timestamp: '2026-01-21T18:00:00Z',
  },
  {
    id: 'm12',
    booking_id: 'b8',
    sender_id: 'g14',
    sender_name: 'Alessandro Romano',
    content:
      "Great thinking, Lisa! Let's meet at 8am instead. Early morning Rome is magical and much quieter.",
    timestamp: '2026-01-21T19:15:00Z',
  },
  {
    id: 'm13',
    booking_id: 'b9',
    sender_id: 'u15',
    sender_name: 'Nina Petrov',
    content:
      "Hi Aisha, I'm interested in LGBTQ+ history in London. Can we focus on that?",
    timestamp: '2026-01-29T11:00:00Z',
  },
  {
    id: 'm14',
    booking_id: 'b9',
    sender_id: 'g4',
    sender_name: 'Aisha Patel',
    content:
      "Absolutely, Nina! London has such rich queer history. I'll design a route covering Soho, key historical sites, and modern spaces.",
    timestamp: '2026-01-29T12:30:00Z',
  },
  {
    id: 'm15',
    booking_id: 'b10',
    sender_id: 'u16',
    sender_name: 'James Taylor',
    content: 'Thiago, is it safe to bring a camera to the favela areas?',
    timestamp: '2026-02-08T14:20:00Z',
  },
  {
    id: 'm16',
    booking_id: 'b10',
    sender_id: 'g7',
    sender_name: 'Thiago Costa',
    content:
      "Good question, James. Yes, but I recommend a small camera rather than expensive equipment. I'll guide you on where and when it's appropriate to photograph.",
    timestamp: '2026-02-08T15:00:00Z',
  },
  {
    id: 'm17',
    booking_id: 'b11',
    sender_id: 'u17',
    sender_name: 'Elena Rodriguez',
    content:
      'Sofia, do you have restaurant recommendations for dinner after our tour?',
    timestamp: '2026-01-26T10:00:00Z',
  },
  {
    id: 'm18',
    booking_id: 'b11',
    sender_id: 'g11',
    sender_name: 'Sofia Papadopoulos',
    content:
      "Definitely! I'll share my top 3 spots near where our tour ends. All are queer-friendly and serve excellent Greek cuisine.",
    timestamp: '2026-01-26T11:15:00Z',
  },
  {
    id: 'm19',
    booking_id: 'b13',
    sender_id: 'u3',
    sender_name: 'Sarah Chen',
    content:
      "Olivia, I'm a photographer too! Can we focus on finding great shooting locations?",
    timestamp: '2026-02-13T09:30:00Z',
  },
  {
    id: 'm20',
    booking_id: 'b13',
    sender_id: 'g18',
    sender_name: 'Olivia Chen',
    content:
      "Perfect! Fellow photographer! We'll definitely hit the best light and angles. I know some hidden rooftop spots you'll love.",
    timestamp: '2026-02-13T10:45:00Z',
  },
];

// ============================================================================
// Helper Functions - Basic Getters
// ============================================================================

export function getMockCountries(): Country[] {
  return MOCK_COUNTRIES;
}

export function getMockCountry(slug: string): Country | undefined {
  return MOCK_COUNTRIES.find((c) => c.slug === slug);
}

export function getMockCities(): City[] {
  return MOCK_CITIES;
}

export function getMockCity(slug: string): City | undefined {
  return MOCK_CITIES.find((c) => c.slug === slug);
}

export function getMockGuides(
  citySlug?: string,
  filters?: {
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    verified?: boolean;
    instantBook?: boolean;
  },
): Guide[] {
  let guides = MOCK_GUIDES;

  // Filter by city
  if (citySlug) {
    const city = getMockCity(citySlug);
    if (city) {
      guides = guides.filter((g) => g.city_id === city.id);
    }
  }

  // Apply filters
  if (filters) {
    if (filters.tags && filters.tags.length > 0) {
      guides = guides.filter((g) =>
        filters.tags!.some((tag) => g.experience_tags.includes(tag)),
      );
    }

    if (filters.minPrice !== undefined) {
      guides = guides.filter((g) => g.price_4h >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      guides = guides.filter((g) => g.price_4h <= filters.maxPrice!);
    }

    if (filters.verified !== undefined) {
      guides = guides.filter((g) => g.verified === filters.verified);
    }

    if (filters.instantBook !== undefined) {
      guides = guides.filter((g) => g.instant_book === filters.instantBook);
    }
  }

  return guides;
}

export function getMockGuide(idOrSlug: string): Guide | undefined {
  return MOCK_GUIDES.find((g) => g.id === idOrSlug || g.slug === idOrSlug);
}

export function getMockUsers(): User[] {
  return MOCK_USERS;
}

export function getMockUser(id: string): User | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export function getMockBookings(userId?: string, role?: UserRole): Booking[] {
  if (!userId) return MOCK_BOOKINGS;

  if (role === 'traveler') {
    return MOCK_BOOKINGS.filter((b) => b.traveler_id === userId);
  }

  if (role === 'guide') {
    const guide = MOCK_GUIDES.find((g) => g.id === userId);
    if (guide) {
      return MOCK_BOOKINGS.filter((b) => b.guide_id === guide.id);
    }
  }

  return MOCK_BOOKINGS;
}

export function getMockBooking(id: string): Booking | undefined {
  return MOCK_BOOKINGS.find((b) => b.id === id);
}

export function getMockReviews(guideId?: string): Review[] {
  if (!guideId) return MOCK_REVIEWS;
  return MOCK_REVIEWS.filter((r) => r.guide_id === guideId);
}

export function getMockReview(id: string): Review | undefined {
  return MOCK_REVIEWS.find((r) => r.id === id);
}

export function getMockMessages(bookingId: string): Message[] {
  return MOCK_MESSAGES.filter((m) => m.booking_id === bookingId);
}

// ============================================================================
// Helper Functions - Search & Filter
// ============================================================================

export function searchGuides(query: string): Guide[] {
  const lowerQuery = query.toLowerCase();
  return MOCK_GUIDES.filter(
    (guide) =>
      guide.name.toLowerCase().includes(lowerQuery) ||
      guide.bio.toLowerCase().includes(lowerQuery) ||
      guide.tagline.toLowerCase().includes(lowerQuery) ||
      guide.city_name.toLowerCase().includes(lowerQuery) ||
      guide.experience_tags.some((tag) =>
        tag.toLowerCase().includes(lowerQuery),
      ) ||
      guide.languages.some((lang) => lang.toLowerCase().includes(lowerQuery)),
  );
}

export function filterGuidesByTags(tags: string[]): Guide[] {
  if (tags.length === 0) return MOCK_GUIDES;

  return MOCK_GUIDES.filter((guide) =>
    tags.every((tag) => guide.experience_tags.includes(tag)),
  );
}

export type GuideSortOption =
  | 'rating'
  | 'price_low'
  | 'price_high'
  | 'reviews'
  | 'name';

export function sortGuides(guides: Guide[], sortBy: GuideSortOption): Guide[] {
  const sorted = [...guides];

  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'price_low':
      return sorted.sort((a, b) => a.price_4h - b.price_4h);
    case 'price_high':
      return sorted.sort((a, b) => b.price_4h - a.price_4h);
    case 'reviews':
      return sorted.sort((a, b) => b.review_count - a.review_count);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}

export function searchCities(query: string): City[] {
  const lowerQuery = query.toLowerCase();
  return MOCK_CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(lowerQuery) ||
      city.country_name.toLowerCase().includes(lowerQuery) ||
      city.description.toLowerCase().includes(lowerQuery),
  );
}

export function getFeaturedCities(limit: number = 6): City[] {
  // Return cities with most guides
  return [...MOCK_CITIES]
    .sort((a, b) => b.guide_count - a.guide_count)
    .slice(0, limit);
}

export function getTopRatedGuides(limit: number = 10): Guide[] {
  return [...MOCK_GUIDES]
    .sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.review_count - a.review_count;
    })
    .slice(0, limit);
}

// ============================================================================
// Mock Data - Blog Articles
// ============================================================================

const MOCK_ARTICLES: Article[] = [
  {
    id: 'art1',
    slug: 'lgbtq-safety-barcelona',
    title: 'The Complete Guide to LGBTQ+ Safety in Barcelona',
    excerpt:
      'Everything you need to know about navigating Barcelona as a queer traveler, from safe neighborhoods to local etiquette and emergency contacts.',
    content: `Barcelona has long been one of Europe's most welcoming cities for LGBTQ+ travelers. With its vibrant Eixample neighborhood (affectionately known as "Gaixample"), progressive laws, and thriving queer scene, it's a destination where you can be authentically yourself.

## Safe Neighborhoods

The Eixample district is the heart of Barcelona's LGBTQ+ community. Here you'll find queer-friendly hotels, bars, restaurants, and shops. The area around Carrer de Muntaner is particularly welcoming, with rainbow flags visible year-round.

## Local Etiquette

Spain legalized same-sex marriage in 2005, making it one of the most progressive countries in Europe. Public displays of affection are generally well-received in tourist areas and the city center. However, as with any major city, awareness of your surroundings is always wise.

## Emergency Contacts

- Local LGBTQ+ Center: +34 93 298 0029
- Emergency Services: 112
- Tourist Police: +34 93 256 2430

## Best Times to Visit

Barcelona Pride takes place in late June, drawing hundreds of thousands of visitors. Circuit Festival (August) is one of the world's largest gay events. For a quieter experience, visit in spring or fall when the weather is perfect and crowds are smaller.`,
    featured_image:
      'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200',
    author_name: 'Marco Silva',
    author_photo:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    published_date: '2026-01-05',
    read_time: 8,
    category: 'Safety',
    tags: ['Barcelona', 'Safety', 'Spain'],
  },
  {
    id: 'art2',
    slug: 'best-nightlife-lisbon',
    title: 'Lisbon After Dark: The Best LGBTQ+ Nightlife Guide',
    excerpt:
      "From intimate fado bars to pulsing dance clubs, discover Lisbon's diverse queer nightlife scene with insider recommendations.",
    content: `Lisbon's LGBTQ+ nightlife has evolved dramatically in recent years. While smaller than Barcelona or Berlin, it offers an intimate, welcoming scene that feels authentically Portuguese.

## Príncipe Real: The Queer Heart

This elegant neighborhood is ground zero for Lisbon's gay scene. By day, it's cafés and boutiques. By night, the bars and clubs come alive. Start at Trumps (the city's oldest gay club) or check out Construction for a more alternative vibe.

## Best Bars & Clubs

- **Trumps**: Four floors, multiple vibes, everyone welcome
- **Construction**: Industrial-chic, younger crowd, great DJs
- **Finalmente**: Drag shows and cabaret, local institution
- **Bar 106**: Intimate piano bar, perfect for conversations

## Safety Tips

Lisbon is generally very safe for LGBTQ+ nightlife. The Príncipe Real and Bairro Alto areas are well-patrolled and welcoming. As always, watch your drink, stay aware of your surroundings, and use official taxis or Uber late at night.

## When to Go

Thursday through Saturday are the busiest nights. Many venues have themed nights, so check schedules in advance. Lisbon Pride is in June, transforming the city into one giant celebration.`,
    featured_image:
      'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200',
    author_name: 'João Ferreira',
    author_photo:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    published_date: '2026-01-03',
    read_time: 6,
    category: 'Nightlife',
    tags: ['Lisbon', 'Nightlife', 'Portugal'],
  },
  {
    id: 'art3',
    slug: 'berlin-queer-history',
    title: "Walking Through Berlin's LGBTQ+ History",
    excerpt:
      "Trace the footsteps of queer pioneers in Berlin, from the Weimar era's golden age to today's vibrant community.",
    content: `Berlin's LGBTQ+ history is unparalleled. This city was home to the world's first gay rights organization, thriving queer culture in the 1920s, and remains Europe's queer capital today.

## The Weimar Era

In the 1920s, Berlin had over 100 gay and lesbian bars, clubs, and cafés. The Institut für Sexualwissenschaft, founded by Magnus Hirschfeld, pioneered LGBTQ+ research and advocacy. Much was destroyed by the Nazis, but the legacy lives on.

## Memorial Sites

- **Memorial to Homosexuals Persecuted Under Nazism**: Tiergarten park
- **Nollendorfplatz**: Historic center of gay Berlin, now with commemorative plaques
- **Schwules Museum**: World's first gay museum, essential visit

## Modern Queer Berlin

Today's Berlin offers everything from leather bars to queer art galleries. Schöneberg remains historic, while Kreuzberg and Neukölln attract younger crowds. The city's openness and diversity make it unique in Europe.

## Guided Tours

Several guides offer specialized queer history tours. These provide context you won't find in guidebooks and connect you with today's community while honoring the past.`,
    featured_image:
      'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200',
    author_name: 'Lars Andersen',
    author_photo:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
    published_date: '2026-01-01',
    read_time: 10,
    category: 'History',
    tags: ['Berlin', 'History', 'Germany'],
  },
  {
    id: 'art4',
    slug: 'solo-travel-tips-lgbtq',
    title: 'Solo Travel as an LGBTQ+ Person: Essential Tips',
    excerpt:
      'Practical advice for safe, fulfilling solo travel as a queer person, from research and preparation to staying connected.',
    content: `Solo travel as an LGBTQ+ person can be incredibly rewarding, but it requires extra preparation and awareness. Here's what you need to know.

## Research Your Destination

Not all destinations are equally welcoming. Research local laws, cultural attitudes, and LGBTQ+ rights before booking. Look for cities with established queer communities and legal protections.

## Stay Connected

Share your itinerary with trusted friends or family. Check in regularly. Join LGBTQ+ travel groups on social media where you can ask questions and get real-time advice from other travelers.

## Local Guides Make a Difference

Connecting with a local LGBTQ+ guide isn't just about sightseeing—it's about safety and authentic experience. They know which neighborhoods are welcoming, which venues are safe, and how to navigate local culture.

## Trust Your Instincts

If a situation feels uncomfortable, leave. Your safety and comfort matter more than any tourist attraction or social obligation.

## Build Community

Look for local LGBTQ+ centers, cafés, or events. These spaces offer community, safety, and often invaluable local advice.`,
    featured_image:
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200',
    author_name: 'Rainbow Tour Guides Team',
    author_photo:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200',
    published_date: '2025-12-28',
    read_time: 7,
    category: 'Travel Tips',
    tags: ['Solo Travel', 'Safety', 'Tips'],
  },
  {
    id: 'art5',
    slug: 'food-scene-mexico-city',
    title: "Mexico City's Queer-Friendly Food Scene",
    excerpt:
      "From street tacos to upscale dining, explore Mexico City's incredible culinary landscape through an LGBTQ+ lens.",
    content: `Mexico City has emerged as one of Latin America's most progressive cities, and its food scene reflects this openness and creativity. Here's your guide to eating well in CDMX.

## Neighborhoods to Explore

Roma and Condesa are ground zero for Mexico City's queer-friendly dining scene. These neighborhoods blend historic architecture with contemporary culture, and you'll find rainbow flags alongside incredible restaurants.

## Must-Try Experiences

- **Pujol**: World-renowned Mexican fine dining
- **Contramar**: Iconic seafood, welcoming atmosphere
- **Mercado Roma**: Food market with diverse options
- **Street Tacos**: Anywhere and everywhere

## Queer-Owned & Friendly

Many restaurants in Roma and Condesa are queer-owned or explicitly welcoming. Look for rainbow stickers in windows, or ask your local guide for recommendations—they'll know the spots where you can be yourself.

## Food Tours

Consider a food tour with an LGBTQ+ guide who can provide cultural context, navigate language barriers, and introduce you to hidden gems that aren't in guidebooks.`,
    featured_image:
      'https://images.unsplash.com/photo-1565299543923-37dd37887442?w=1200',
    author_name: 'Carlos Mendoza',
    author_photo:
      'https://images.unsplash.com/photo-1528892952291-009c663ce843?w=200',
    published_date: '2025-12-25',
    read_time: 5,
    category: 'Food & Culture',
    tags: ['Mexico City', 'Food', 'Culture'],
  },
  {
    id: 'art6',
    slug: 'pride-festivals-2026',
    title: 'The Ultimate Guide to Pride Festivals 2026',
    excerpt:
      "Plan your 2026 Pride travels with our comprehensive guide to the world's best LGBTQ+ celebrations and festivals.",
    content: `Pride season 2026 promises to be bigger and more inclusive than ever. Here's your guide to the must-attend celebrations around the world.

## Europe's Biggest

- **Amsterdam Pride** (July-August): Canal parade, street parties
- **Madrid Pride** (June-July): One of Europe's largest, million+ attendees
- **London Pride** (June): Historic parade through the city center
- **Berlin CSD** (July): Political roots, massive celebration

## Americas

- **NYC Pride** (June): The birthplace of Pride, multiple events
- **São Paulo Pride** (June): World's largest, 5+ million attendees
- **Mexico City Pride** (June): Growing, vibrant, welcoming
- **Toronto Pride** (June): Canada's biggest celebration

## Planning Tips

Book accommodations early—Pride months see hotels fill up quickly. Consider staying with local LGBTQ+ hosts or in queer-friendly neighborhoods. Many cities offer Pride passes for discounted or free entry to events.

## Beyond the Parade

While the parades are iconic, Pride is about community. Attend panel discussions, art exhibitions, and community gatherings. These quieter events often provide deeper connections and cultural understanding.

## Travel with Guides

Experiencing Pride with a local LGBTQ+ guide adds context and safety. They know the best events, how to navigate crowds, and where to find the authentic celebrations beyond the tourist-focused parties.`,
    featured_image:
      'https://images.unsplash.com/photo-1530103043960-ef38714abb15?w=1200',
    author_name: 'Rainbow Tour Guides Team',
    author_photo:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200',
    published_date: '2025-12-20',
    read_time: 9,
    category: 'Events',
    tags: ['Pride', 'Festivals', 'Events'],
  },
];

export function getMockArticles(): Article[] {
  return MOCK_ARTICLES;
}

export function getMockArticle(slug: string): Article | undefined {
  return MOCK_ARTICLES.find((a) => a.slug === slug);
}
