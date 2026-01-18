'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Search, Users } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { City } from '@/lib/mock-data';

interface HomeSearchBarProps {
  cities: City[];
}

export function HomeSearchBar({ cities }: HomeSearchBarProps) {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
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
        <div className="space-y-2">
          <label
            id={whereLabelId}
            className="text-xs font-semibold text-ink-soft uppercase tracking-wider px-1"
          >
            Where to?
          </label>
          <Combobox
            options={cityOptions}
            value={city}
            onChange={setCity}
            placeholder="Search cities"
            icon={<MapPin className="h-4 w-4" />}
            ariaLabelledby={whereLabelId}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor={startLabelId}
            id={`${startLabelId}-label`}
            className="text-xs font-semibold text-ink-soft uppercase tracking-wider px-1"
          >
            Start
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft pointer-events-none" />
            <Input
              id={startLabelId}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="h-12 rounded-xl pl-11 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor={endLabelId}
            id={`${endLabelId}-label`}
            className="text-xs font-semibold text-ink-soft uppercase tracking-wider px-1"
          >
            End
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft pointer-events-none" />
            <Input
              id={endLabelId}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              className="h-12 rounded-xl pl-11 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor={travelersLabelId}
            id={`${travelersLabelId}-label`}
            className="text-xs font-semibold text-ink-soft uppercase tracking-wider px-1"
          >
            Travelers
          </label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft pointer-events-none z-10" />
            <select
              id={travelersLabelId}
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-transparent px-3 py-2 pl-11 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="1">1 Traveler</option>
              <option value="2">2 Travelers</option>
              <option value="3">3 Travelers</option>
              <option value="4">4 Travelers</option>
              <option value="5">5 Travelers</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-soft">
          Flexible dates? Leave them blank and explore guides in your destination.
        </p>
        <Button
          type="submit"
          className="w-full sm:w-auto h-12 px-6 rounded-xl text-base font-semibold flex items-center justify-center gap-2"
        >
          <Search className="h-4 w-4" />
          Search Now
        </Button>
      </div>
    </form>
  );
}
