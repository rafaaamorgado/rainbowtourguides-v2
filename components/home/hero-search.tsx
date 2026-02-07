'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Users, Search as SearchIcon } from 'lucide-react';
import { parseDate, type CalendarDate } from '@internationalized/date';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Select } from '@/components/ui/select';
import type { City } from '@/lib/mock-data';

const SEARCH_INPUT_HEIGHT = 'h-12';
const SEARCH_INPUT_FONT = 'text-base';

interface HeroSearchProps {
  cities: City[];
}

export function HeroSearch({ cities }: HeroSearchProps) {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('');
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [travelers, setTravelers] = useState('1');
  const [error, setError] = useState('');

  const cityOptions = cities.map((city) => ({
    value: city.slug,
    label: `${city.name}, ${city.country_name}`,
  }));

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    setError('');

    const params = new URLSearchParams();
    if (selectedCity) params.set('city', selectedCity);
    if (date) params.set('date', date.toString());
    if (travelers) params.set('travelers', travelers);

    const query = params.toString();
    router.push(`/guides${query ? `?${query}` : ''}`);
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr,1.2fr,1fr,auto] gap-4 lg:gap-5 items-end">
          {/* Where - City */}
          <div className="space-y-2">
            <label
              htmlFor="city-search"
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1"
            >
              Where
            </label>
            <Combobox
              options={cityOptions}
              value={selectedCity}
              onChange={setSelectedCity}
              placeholder="Search destinations..."
              icon={<MapPin className="h-4 w-4" />}
              inputClassName={SEARCH_INPUT_FONT}
            />
          </div>

          {/* When - Single Date */}
          <div className="space-y-2">
            <label
              htmlFor="when-date"
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1"
            >
              When
            </label>
            <DatePicker
              id="when-date"
              value={date}
              onChange={setDate}
              minValue={parseDate(new Date().toISOString().split('T')[0])}
              placeholderValue={parseDate(
                new Date().toISOString().split('T')[0],
              )}
              className="h-12 [&_button]:h-12 [&_button]:text-base [&_input]:text-base"
            />
          </div>

          {/* Travelers */}
          <div className="space-y-2">
            <label
              htmlFor="travelers"
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1"
            >
              Travelers
            </label>
            <Select
              value={travelers}
              onChange={setTravelers}
              options={[
                { value: '1', label: '1 Traveler' },
                { value: '2', label: '2 Travelers' },
                { value: '3', label: '3 Travelers' },
                { value: '4', label: '4 Travelers' },
                { value: '5', label: '5 Travelers' },
              ]}
              icon={<Users className="h-4 w-4 text-slate-400" />}
              className={`${SEARCH_INPUT_HEIGHT} ${SEARCH_INPUT_FONT}`}
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button
              type="submit"
              size="lg"
              className={`w-full ${SEARCH_INPUT_HEIGHT} ${SEARCH_INPUT_FONT} rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all`}
            >
              <SearchIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Search Now</span>
              <span className="sm:hidden">Search</span>
            </Button>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Flexible dates? Leave the date blank to explore guides in your
          destination.
        </p>

        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </form>
  );
}
