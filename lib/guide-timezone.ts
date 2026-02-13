const CITY_TO_TIMEZONE: Record<string, string> = {
  amsterdam: 'Europe/Amsterdam',
  barcelona: 'Europe/Madrid',
  berlin: 'Europe/Berlin',
  lisbon: 'Europe/Lisbon',
  london: 'Europe/London',
  madrid: 'Europe/Madrid',
  paris: 'Europe/Paris',
  'rio de janeiro': 'America/Sao_Paulo',
};

function normalizeCityName(cityName: string) {
  return cityName.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function resolveGuideTimezone(cityName?: string | null) {
  if (!cityName) {
    // TODO: Use a persisted timezone field from the DB (e.g. guides.timezone).
    return 'UTC';
  }

  return CITY_TO_TIMEZONE[normalizeCityName(cityName)] ?? 'UTC';
}
