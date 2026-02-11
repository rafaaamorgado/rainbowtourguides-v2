// Shared profile options for travelers and guides

export const TRAVELER_INTERESTS = [
  "Arts & Architecture",
  "Culture & History",
  "Food & Drink",
  "Hidden Gems",
  "Nature & Outdoor",
  "Queer History",
  "Shopping",
  "Nightlife",
  "Photography",
  "Clubs",
  "Local Life",
  "Music",
] as const;

export const GUIDE_SPECIALTIES = [
  "Culture & History",
  "Nightlife & Bars",
  "Food & Drink",
  "Nature & Outdoors",
  "Hidden Gems",
  "Shopping",
  "Art & Architecture",
  "Queer History",
  "Street Art",
  "Off the beaten path",
  "LGBTQ+ History",
  "Architecture",
  "Local Politics",
  "Museums",
  "Galleries",
] as const;

export const SEXUAL_ORIENTATION_OPTIONS = [
  "Gay",
  "Lesbian",
  "Bisexual",
  "Queer",
  "Pansexual",
  "Asexual",
  "Demisexual",
  "Heteroflexible",
  "Straight / Ally",
  "Prefer not to say",
] as const;

export const PRONOUNS_OPTIONS = [
  "He/Him",
  "She/Her",
  "They/Them",
  "He/They",
  "She/They",
  "Any Pronouns",
  "Prefer not to say",
] as const;

export const LANGUAGE_OPTIONS = [
  "English",
  "Spanish",
  "French",
  "Portuguese",
  "German",
  "Italian",
  "Mandarin",
  "Japanese",
  "Korean",
  "Vietnamese",
  "Thai",
  "Dutch",
  "Arabic",
] as const;

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)", symbol: "$" },
  { value: "EUR", label: "EUR (\u20ac)", symbol: "\u20ac" },
  { value: "GBP", label: "GBP (\u00a3)", symbol: "\u00a3" },
  { value: "CAD", label: "CAD ($)", symbol: "$" },
  { value: "AUD", label: "AUD ($)", symbol: "$" },
  { value: "THB", label: "THB (\u0e3f)", symbol: "\u0e3f" },
  { value: "VND", label: "VND (\u20ab)", symbol: "\u20ab" },
  { value: "MXN", label: "MXN ($)", symbol: "$" },
  { value: "BRL", label: "BRL (R$)", symbol: "R$" },
] as const;

export type TravelerInterest = (typeof TRAVELER_INTERESTS)[number];
export type GuideSpecialty = (typeof GUIDE_SPECIALTIES)[number];
export type SexualOrientation = (typeof SEXUAL_ORIENTATION_OPTIONS)[number];
export type Pronouns = (typeof PRONOUNS_OPTIONS)[number];
export type LanguageOption = (typeof LANGUAGE_OPTIONS)[number];
export type CurrencyOption = (typeof CURRENCY_OPTIONS)[number];
