// Shared profile options for travelers and guides

export const TRAVELER_INTERESTS = [
  "LGBTQ+ History & Culture",
  "Local Food & Dining",
  "Nightlife & Entertainment",
  "Art & Museums",
  "Nature & Outdoors",
  "Shopping & Markets",
  "Photography Spots",
  "Off-the-beaten-path",
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
export type LanguageOption = (typeof LANGUAGE_OPTIONS)[number];
export type CurrencyOption = (typeof CURRENCY_OPTIONS)[number];
