'use client';

import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { GuideOnboardingData } from "@/lib/validations/guide-onboarding";
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

interface StepBasicInfoProps {
    form: UseFormReturn<GuideOnboardingData>;
}

export function StepBasicInfo({ form }: StepBasicInfoProps) {
    const [cities, setCities] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        async function fetchCities() {
            const supabase = createSupabaseBrowserClient();
            if (!supabase) return;
            const { data } = await (supabase.from("cities") as any).select("id, name").order("name");
            if (data) setCities(data);
        }
        fetchCities();
    }, []);

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
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Primary City</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your city" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {cities.map((city) => (
                                    <SelectItem key={city.id} value={city.id}>
                                        {city.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
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
