'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Clock } from 'lucide-react';
import { parseDate, type CalendarDate } from '@internationalized/date';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Select } from '@/components/ui/select';
import type { City } from '@/lib/mock-data';

interface GuidesSearchBarProps {
  cities: City[];
}

export function GuidesSearchBar({ cities }: GuidesSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState(
    searchParams.get('city') || '',
  );
  const [startDate, setStartDate] = useState<CalendarDate | null>(
    searchParams.get('start') ? parseDate(searchParams.get('start')!) : null,
  );
  const [endDate, setEndDate] = useState<CalendarDate | null>(
    searchParams.get('end') ? parseDate(searchParams.get('end')!) : null,
  );
  const [duration, setDuration] = useState(searchParams.get('duration') || '');

  const cityOptions = cities.map((city) => ({
    value: city.slug,
    label: `${city.name}, ${city.country_name}`,
  }));

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (selectedCity) params.set('city', selectedCity);
    if (startDate) params.set('start', startDate.toString());
    if (endDate) params.set('end', endDate.toString());
    if (duration) params.set('duration', duration);

    router.push(`/guides?${params.toString()}`);
  };

  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-glass border border-slate-200 p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Text Search */}
        <div className="space-y-2 lg:col-span-2">
          <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
            <Input
              type="text"
              placeholder="Guide name, city, or interest..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* City Filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
            City
          </label>

          <Combobox
            options={[{ value: '', label: 'All Cities' }, ...cityOptions]}
            value={selectedCity}
            onChange={setSelectedCity}
            placeholder="Any city"
            ariaLabel="Select city"
            icon={<MapPin className="h-4 w-4" />}
          />
        </div>

        {/* Duration Filter */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
            Duration
          </label>
          <Select
            options={[
              { value: '', label: 'Any Duration' },
              { value: '4', label: '4 Hours' },
              { value: '6', label: '6 Hours' },
              { value: '8', label: '8 Hours' },
            ]}
            value={duration}
            onChange={setDuration}
            placeholder="Any Duration"
            ariaLabel="Select tour duration"
            icon={<Clock className="h-4 w-4" />}
          />
        </div>

        {/* Search Button */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-transparent uppercase tracking-wider select-none">
            Go
          </label>
          <Button
            onClick={handleSearch}
            className="w-full h-12 rounded-xl text-base font-semibold"
          >
            Search
          </Button>
        </div>
      </div>

      {/* Date Range (Optional - UI Only) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
            Start Date (Optional)
          </label>
          <DatePicker
            value={startDate}
            onChange={setStartDate}
            minValue={parseDate(new Date().toISOString().split('T')[0])}
            placeholderValue={parseDate(new Date().toISOString().split('T')[0])}
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
            End Date (Optional)
          </label>

          <DatePicker
            value={endDate}
            onChange={setEndDate}
            minValue={
              startDate || parseDate(new Date().toISOString().split('T')[0])
            }
            placeholderValue={parseDate(new Date().toISOString().split('T')[0])}
          />
        </div>
      </div>
    </div>
  );
}
