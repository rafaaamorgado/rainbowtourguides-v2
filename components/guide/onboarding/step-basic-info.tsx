'use client';

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { GuideOnboardingData } from "@/lib/validations/guide-onboarding";
import { useTransition } from "react";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { createOrGetCity } from "@/app/guide/onboarding/actions";
import { Button } from "@/components/ui/button";

interface StepBasicInfoProps {
    form: UseFormReturn<GuideOnboardingData>;
}

export function StepBasicInfo({ form }: StepBasicInfoProps) {
    const [countries, setCountries] = useState<{ id: string; name: string; iso_code?: string | null }[]>([]);
    const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<{ id: string; iso?: string } | null>(null);
    const [cityInput, setCityInput] = useState("");
    const [cityError, setCityError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        async function fetchCountries() {
            const supabase = createSupabaseBrowserClient();
            if (!supabase) return;
            const { data } = await (supabase
                .from("countries") as any)
                .select("id, name, iso_code")
                .eq("is_supported", true)
                .order("name");
            if (data) setCountries(data);
        }
        fetchCountries();
    }, []);

    useEffect(() => {
        async function fetchCities() {
            if (!selectedCountry) return;
            const supabase = createSupabaseBrowserClient();
            if (!supabase) return;
            const { data } = await (supabase
                .from("cities") as any)
                .select("id, name")
                .eq("country_id", selectedCountry.id)
                .order("name");
            if (data) setCities(data);
        }
        setCities([]);
        fetchCities();
    }, [selectedCountry]);

    const handleAddCity = () => {
        if (!selectedCountry) {
            setCityError("Select a country first");
            return;
        }
        if (!cityInput.trim()) {
            setCityError("Enter a city name");
            return;
        }
        setCityError(null);
        startTransition(async () => {
            const result = await createOrGetCity(selectedCountry.iso || selectedCountry.id, cityInput.trim());
            if (result.error) {
                setCityError(result.error);
                return;
            }
            if (result.cityId) {
                const newCityId = result.cityId;
                form.setValue("city_id", newCityId, { shouldValidate: true });
                setCities((prev) => {
                    if (prev.some((c) => c.id === newCityId)) return prev;
                    return [...prev, { id: newCityId, name: cityInput.trim() }].sort((a, b) =>
                        a.name.localeCompare(b.name)
                    );
                });
            }
        });
    };

    const handleCityInputChange = (value: string) => {
        setCityInput(value);
        setCityError(null);
        const match = cities.find((c) => c.name.toLowerCase() === value.toLowerCase());
        if (match) {
            form.setValue("city_id", match.id, { shouldValidate: true });
        } else {
            form.setValue("city_id", "", { shouldValidate: true });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Account & Basics</h2>
                <p className="text-sm text-muted-foreground">
                    Let's start with your public profile details.
                </p>
            </div>

            <FormField
                control={form.control}
                name="display_name"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Alex" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="city_id"
                render={() => (
                    <FormItem className="space-y-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-2">
                                <FormLabel>Country</FormLabel>
                                <Select
                                    onValueChange={(value) => {
                                        const country = countries.find((c) => c.id === value);
                                        setSelectedCountry(country ? { id: country.id, iso: country.iso_code || undefined } : null);
                                        form.setValue("city_id", "", { shouldValidate: true });
                                        setCityInput("");
                                    }}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select country" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {countries.map((country) => (
                                            <SelectItem key={country.id} value={country.id}>
                                                {country.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <FormLabel>City</FormLabel>
                                <Input
                                    list="city-options"
                                    placeholder="Start typing your city"
                                    value={cityInput}
                                    onChange={(e) => handleCityInputChange(e.target.value)}
                                    disabled={!selectedCountry}
                                />
                                <datalist id="city-options">
                                    {cities.map((city) => (
                                        <option key={city.id} value={city.name} />
                                    ))}
                                </datalist>
                                <div className="flex gap-2">
                                    <Button type="button" variant="secondary" onClick={handleAddCity} disabled={isPending}>
                                        {isPending ? "Adding..." : "Add new city"}
                                    </Button>
                                </div>
                                {cityError && <p className="text-xs text-destructive">{cityError}</p>}
                                <FormMessage />
                            </div>
                        </div>
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Tell travelers a bit about yourself..."
                                className="min-h-[120px]"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        </div>
    );
}
