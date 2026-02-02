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

interface HeroSearchProps {
  cities: City[];
}

export function HeroSearch({ cities }: HeroSearchProps) {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('');
  const [startDate, setStartDate] = useState<CalendarDate | null>(null);
  const [endDate, setEndDate] = useState<CalendarDate | null>(null);
  const [travelers, setTravelers] = useState('1');
  const [error, setError] = useState('');

  const cityOptions = cities.map((city) => ({
    value: city.slug,
    label: `${city.name}, ${city.country_name}`,
  }));

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    setError('');

    // Validation: at least city must be selected
    if (!selectedCity) {
      setError('Please select a destination');
      return;
    }

    // Build query params
    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.set('dates', `${startDate.toString()}_${endDate.toString()}`);
    }
    params.set('travelers', travelers);

    // Navigate to city page or cities listing
    const url = `/cities/${selectedCity}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(url);
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr,1fr,1fr,0.8fr,auto] gap-4 lg:gap-5 items-end">
          {/* City Autocomplete - Where to */}
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <label
              htmlFor="city-search"
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1"
            >
              Where to
            </label>
            <Combobox
              options={cityOptions}
              value={selectedCity}
              onChange={setSelectedCity}
              placeholder="Search destinations..."
              icon={<MapPin className="h-4 w-4" />}
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label
              htmlFor="start-date"
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1"
            >
              Start date
            </label>
            <DatePicker
              id="start-date"
              value={startDate}
              onChange={setStartDate}
              minValue={parseDate(new Date().toISOString().split('T')[0])}
              placeholderValue={parseDate(
                new Date().toISOString().split('T')[0],
              )}
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label
              htmlFor="end-date"
              className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1"
            >
              End date
            </label>
            <DatePicker
              id="end-date"
              value={endDate}
              onChange={setEndDate}
              minValue={
                startDate || parseDate(new Date().toISOString().split('T')[0])
              }
              placeholderValue={parseDate(
                new Date().toISOString().split('T')[0],
              )}
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
              ]}
              icon={<Users className="h-4 w-4 text-slate-400" />}
              className="h-12"
            />
          </div>

          {/* Search Button */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Button
              type="submit"
              size="lg"
              className="w-full h-12 rounded-xl text-base font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <SearchIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Search Now</span>
              <span className="sm:hidden">Search</span>
            </Button>
          </div>
        </div>

        {/* Helper Text */}
        <p className="mt-4 text-sm text-slate-500">
          Flexible dates? Leave them blank and explore guides in your
          destination.
        </p>

        {/* Error Message */}
        {error && (
          <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </form>
  );
}
