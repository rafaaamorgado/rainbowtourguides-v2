"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Search as SearchIcon } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { City } from "@/lib/mock-data";

interface HeroSearchProps {
  cities: City[];
}

export function HeroSearch({ cities }: HeroSearchProps) {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [error, setError] = useState("");

  const cityOptions = cities.map((city) => ({
    value: city.slug,
    label: `${city.name}, ${city.country_name}`,
  }));

  const handleSearch = (e?: FormEvent) => {
    e?.preventDefault();
    setError("");

    // Validation: at least city must be selected
    if (!selectedCity) {
      setError("Please select a destination");
      return;
    }

    // Build query params
    const params = new URLSearchParams();
    if (startDate && endDate) {
      params.set("dates", `${startDate}_${endDate}`);
    }
    params.set("travelers", travelers);

    // Navigate to city page or cities listing
    const url = `/cities/${selectedCity}${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(url);
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.2fr,1fr,1fr,0.8fr,auto] gap-4 lg:gap-5 items-end">
          {/* City Autocomplete - Where to */}
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <label htmlFor="city-search" className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
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
            <label htmlFor="start-date" className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
              Start date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="h-12 rounded-xl text-sm pl-10 bg-white border-slate-200 focus:border-brand focus:ring-brand"
              />
            </div>
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label htmlFor="end-date" className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
              End date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split("T")[0]}
                className="h-12 rounded-xl text-sm pl-10 bg-white border-slate-200 focus:border-brand focus:ring-brand"
              />
            </div>
          </div>

          {/* Travelers */}
          <div className="space-y-2">
            <label htmlFor="travelers" className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
              Travelers
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
              <select
                id="travelers"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 pl-10 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand disabled:cursor-not-allowed disabled:opacity-50 appearance-none cursor-pointer"
              >
                <option value="1">1 Traveler</option>
                <option value="2">2 Travelers</option>
                <option value="3">3 Travelers</option>
                <option value="4">4 Travelers</option>
              </select>
            </div>
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
          Flexible dates? Leave them blank and explore guides in your destination.
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

