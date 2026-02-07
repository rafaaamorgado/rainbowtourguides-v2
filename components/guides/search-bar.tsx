'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Users } from 'lucide-react';
import { parseDate, type CalendarDate } from '@internationalized/date';
import { CitySearchSelect } from '@/components/form/CitySearchSelect';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Select } from '@/components/ui/select';
import type { City } from '@/lib/mock-data';

const SEARCH_INPUT_HEIGHT = 'h-12';
const SEARCH_INPUT_FONT = 'text-base';

interface GuidesSearchBarProps {
  /** DB cities that have guides (for priority display in search results) */
  cities: City[];
}

export function GuidesSearchBar({ cities }: GuidesSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const cityParam = searchParams.get('city') || '';
  const dateParam = searchParams.get('date') || searchParams.get('start') || '';
  const travelersParam = searchParams.get('travelers') || '1';

  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [date, setDate] = useState<CalendarDate | null>(
    dateParam ? parseDate(dateParam) : null,
  );
  const [travelers, setTravelers] = useState(travelersParam);

  // DB cities formatted for the search select (these have active guides)
  const dbCityOptions = cities.map((city) => ({
    value: city.name,
    label: `${city.name}, ${city.country_name}`,
  }));

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCity) params.set('city', selectedCity);
    if (date) params.set('date', date.toString());
    if (travelers) params.set('travelers', travelers);

    router.push(`/guides?${params.toString()}`);
  };

  return (
    <div className="w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-glass border border-slate-200 p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.2fr,1.2fr,1fr,auto] gap-4">
        {/* Where - City */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
            Where
          </label>
          <CitySearchSelect
            value={selectedCity}
            onChange={setSelectedCity}
            dbCities={[{ value: '', label: 'Any city' }, ...dbCityOptions]}
            placeholder="Search cities"
            ariaLabel="Select city"
            icon={<MapPin className="h-4 w-4" />}
            inputClassName={SEARCH_INPUT_FONT}
          />
        </div>

        {/* When - Single Date */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
            When
          </label>
          <DatePicker
            value={date}
            onChange={setDate}
            minValue={parseDate(new Date().toISOString().split('T')[0])}
            placeholderValue={parseDate(new Date().toISOString().split('T')[0])}
            className="h-12 [&_button]:h-12 [&_button]:text-base [&_input]:text-base"
          />
        </div>

        {/* Travelers */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
            Travelers
          </label>
          <Select
            options={[
              { value: '1', label: '1 Traveler' },
              { value: '2', label: '2 Travelers' },
              { value: '3', label: '3 Travelers' },
              { value: '4', label: '4 Travelers' },
              { value: '5', label: '5 Travelers' },
            ]}
            value={travelers}
            onChange={setTravelers}
            placeholder="Select travelers"
            ariaLabel="Number of travelers"
            icon={<Users className="h-4 w-4" />}
            className={`${SEARCH_INPUT_HEIGHT} ${SEARCH_INPUT_FONT}`}
          />
        </div>

        {/* Search Button */}
        <div className="flex items-end">
          <Button
            onClick={handleSearch}
            className={`w-full ${SEARCH_INPUT_HEIGHT} rounded-xl ${SEARCH_INPUT_FONT} font-semibold gap-2`}
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
