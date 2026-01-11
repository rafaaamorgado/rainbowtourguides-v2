"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, Users, Search as SearchIcon } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

  const handleSearch = () => {
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
    <div className="w-full max-w-5xl mx-auto">
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-glass p-4 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* City Autocomplete */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider px-1">
              Where?
            </label>
            <Combobox
              options={cityOptions}
              value={selectedCity}
              onChange={setSelectedCity}
              placeholder="Select city..."
              icon={<MapPin className="h-4 w-4" />}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider px-1">
              When?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="h-12 rounded-xl text-sm"
                placeholder="Start"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split("T")[0]}
                className="h-12 rounded-xl text-sm"
                placeholder="End"
              />
            </div>
          </div>

          {/* Travelers */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider px-1">
              Travelers
            </label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft pointer-events-none z-10" />
              <Select
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="h-12 pl-10 rounded-xl"
              >
                <option value="1">1 Traveler</option>
                <option value="2">2 Travelers</option>
                <option value="3">3 Travelers</option>
                <option value="4">4 Travelers</option>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <div className={cn("space-y-1", error && "space-y-0")}>
            <label className="text-xs font-semibold text-transparent uppercase tracking-wider px-1 select-none">
              Search
            </label>
            <Button
              onClick={handleSearch}
              className="w-full h-12 rounded-xl text-base font-semibold flex items-center justify-center gap-2"
            >
              <SearchIcon className="h-4 w-4" />
              Search Guides
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="flex items-center justify-center gap-6 mt-6 text-white/70 text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{cities.length} Cities</span>
        </div>
        <div className="w-1 h-1 rounded-full bg-white/50" />
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>
            {cities.reduce((sum, city) => sum + city.guide_count, 0)} Guides
          </span>
        </div>
      </div>
    </div>
  );
}

