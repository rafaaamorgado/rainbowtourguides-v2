'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search, Users } from 'lucide-react';
import { parseDate, type CalendarDate } from '@internationalized/date';
import { Autocomplete } from '@/components/ui/autocomplete';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import type { City } from '@/lib/mock-data';

const SEARCH_INPUT_HEIGHT = 'h-12';
const SEARCH_INPUT_FONT = 'text-base';

interface HomeSearchBarProps {
  cities: City[];
}

export function HomeSearchBar({ cities }: HomeSearchBarProps) {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [travelers, setTravelers] = useState('1');

  const cityOptions = cities.map((c) => ({
    value: c.slug,
    label: `${c.name}, ${c.country_name}`,
  }));

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (date) params.set('date', date.toString());
    if (travelers) params.set('travelers', travelers);

    const query = params.toString();
    router.push(`/guides${query ? `?${query}` : ''}`);
  };

  const whereLabelId = 'home-search-where';
  const whenLabelId = 'home-search-when';
  const travelersLabelId = 'home-search-travelers';

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-white/90 backdrop-blur-lg shadow-2xl ring-1 ring-black/5 border border-white/70 p-4 sm:p-6 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr,1.2fr,1fr,auto] gap-3 sm:gap-4">
        {/* City Autocomplete - Where */}
        <div className="space-y-2">
          <label
            id={whereLabelId}
            className="text-xs font-semibold text-ink-soft uppercase tracking-wider px-1"
          >
            Where
          </label>
          <Autocomplete
            options={cityOptions}
            value={city}
            onChange={setCity}
            placeholder="Search cities"
            startContent={<MapPin className="h-4 w-4 text-ink-soft" />}
            ariaLabelledby={whereLabelId}
            inputClassName={SEARCH_INPUT_FONT}
          />
        </div>

        {/* Single Date - When */}
        <div className="space-y-2">
          <label
            htmlFor={whenLabelId}
            id={`${whenLabelId}-label`}
            className="text-xs font-semibold text-ink-soft uppercase tracking-wider px-1"
          >
            When
          </label>
          <DatePicker
            id={whenLabelId}
            value={date}
            onChange={setDate}
            minValue={parseDate(new Date().toISOString().split('T')[0])}
            placeholderValue={parseDate(new Date().toISOString().split('T')[0])}
            aria-labelledby={`${whenLabelId}-label`}
            className="h-12 [&_button]:h-12 [&_button]:text-base [&_input]:text-base"
          />
        </div>

        {/* Travelers Select */}
        <div className="space-y-2">
          <label
            htmlFor={travelersLabelId}
            id={`${travelersLabelId}-label`}
            className="text-xs font-semibold text-ink-soft uppercase tracking-wider px-1"
          >
            Travelers
          </label>
          <Select
            value={travelers}
            onChange={setTravelers}
            placeholder="Select travelers"
            options={[
              { value: '1', label: '1 Traveler' },
              { value: '2', label: '2 Travelers' },
              { value: '3', label: '3 Travelers' },
              { value: '4', label: '4 Travelers' },
              { value: '5', label: '5 Travelers' },
            ]}
            icon={<Users className="h-4 w-4 text-ink-soft" />}
            aria-labelledby={`${travelersLabelId}-label`}
            className={`${SEARCH_INPUT_HEIGHT} ${SEARCH_INPUT_FONT}`}
          />
        </div>

        {/* Search Button */}
        <div className="flex items-end">
        <Button
          type="submit"
          size="lg"
          className={`w-full ${SEARCH_INPUT_HEIGHT} px-6 rounded-xl ${SEARCH_INPUT_FONT} font-semibold gap-2`}
          startContent={<Search className="h-4 w-4" />}
        >
            Search Now
          </Button>
        </div>
      </div>

      <p className="text-sm text-ink-soft">
        Flexible dates? Leave the date blank to explore guides in your
        destination.
      </p>
    </form>
  );
}
