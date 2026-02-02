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

interface HomeSearchBarProps {
  cities: City[];
}

export function HomeSearchBar({ cities }: HomeSearchBarProps) {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState<CalendarDate | null>(null);
  const [endDate, setEndDate] = useState<CalendarDate | null>(null);
  const [travelers, setTravelers] = useState('1');

  const cityOptions = cities.map((c) => ({
    value: c.slug,
    label: `${c.name}, ${c.country_name}`,
  }));

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    // Prefer city when available; otherwise browse all guides
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (startDate) params.set('start', startDate.toString());
    if (endDate) params.set('end', endDate.toString());
    if (travelers) params.set('travelers', travelers);

    // If only city selected, take users to city details
    if (city && !startDate && !endDate) {
      router.push(`/cities/${city}`);
      return;
    }

    const query = params.toString();
    router.push(`/guides${query ? `?${query}` : ''}`);
  };

  const whereLabelId = 'home-search-where';
  const startLabelId = 'home-search-start';
  const endLabelId = 'home-search-end';
  const travelersLabelId = 'home-search-travelers';

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl bg-white/90 backdrop-blur-lg shadow-2xl ring-1 ring-black/5 border border-white/70 p-4 sm:p-6 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* City Autocomplete */}
        <div className="space-y-2">
          <label
            id={whereLabelId}
            className="text-xs font-semibold text-ink-soft uppercase tracking-wider px-1"
          >
            Where to?
          </label>
          <Autocomplete
            options={cityOptions}
            value={city}
            onChange={setCity}
            placeholder="Search cities"
            startContent={<MapPin className="h-4 w-4 text-ink-soft" />}
            ariaLabelledby={whereLabelId}
          />
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label
            htmlFor={startLabelId}
            id={`${startLabelId}-label`}
            className="text-xs font-semibold text-ink-soft uppercase tracking-wider px-1"
          >
            Start
          </label>
          <DatePicker
            id={startLabelId}
            value={startDate}
            onChange={setStartDate}
            minValue={parseDate(new Date().toISOString().split('T')[0])}
            placeholderValue={parseDate(new Date().toISOString().split('T')[0])}
            aria-labelledby={`${startLabelId}-label`}
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <label
            htmlFor={endLabelId}
            id={`${endLabelId}-label`}
            className="text-xs font-semibold text-ink-soft uppercase tracking-wider px-1"
          >
            End
          </label>
          <DatePicker
            id={endLabelId}
            value={endDate}
            onChange={setEndDate}
            minValue={
              startDate ?? parseDate(new Date().toISOString().split('T')[0])
            }
            placeholderValue={parseDate(new Date().toISOString().split('T')[0])}
            aria-labelledby={`${endLabelId}-label`}
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
            className="h-12"
          />
        </div>
      </div>

      {/* Search Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">
          Flexible dates? Leave them blank and explore guides in your
          destination.
        </p>
        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto h-12 px-6 rounded-xl text-base font-semibold gap-2"
          startContent={<Search className="h-4 w-4" />}
        >
          Search Now
        </Button>
      </div>
    </form>
  );
}
