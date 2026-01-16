'use client';

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
import { Checkbox } from "@/components/ui/checkbox";

interface StepSpecialtiesProps {
    form: UseFormReturn<GuideOnboardingData>;
}

const SPECIALTIES_OPTIONS = [
    "Culture & History",
    "Nightlife & Bars",
    "Food & Drink",
    "Nature & Outdoors",
    "Hidden Gems",
    "Shopping",
    "Art & Architecture",
    "Queer History",
];

const LANGUAGE_OPTIONS = [
    "English",
    "Spanish",
    "French",
    "Portuguese",
    "German",
    "Italian",
    "Mandarin",
    "Japanese",
    "Vietnamese",
    "Thai"
];

export function StepSpecialties({ form }: StepSpecialtiesProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Experience Design</h2>
                <p className="text-sm text-muted-foreground">
                    Define what you offer and your expertise.
                </p>
            </div>

            <div className="space-y-4">
                <FormLabel>Specialties</FormLabel>
                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        control={form.control}
                        name="specialties"
                        render={({ field }) => {
                            return (
                                <>
                                    {SPECIALTIES_OPTIONS.map((item) => (
                                        <FormItem
                                            key={item}
                                            className="flex flex-row items-center space-x-2 space-y-0"
                                        >
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), item])
                                                            : field.onChange(
                                                                field.value?.filter((value) => value !== item)
                                                            );
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                                {item}
                                            </FormLabel>
                                        </FormItem>
                                    ))}
                                    <FormMessage />
                                </>
                            );
                        }}
                    />
                </div>
            </div>

            <div className="space-y-4 pt-4">
                <FormLabel>Languages</FormLabel>
                <div className="grid grid-cols-2 gap-3">
                    <FormField
                        control={form.control}
                        name="languages"
                        render={({ field }) => {
                            return (
                                <>
                                    {LANGUAGE_OPTIONS.map((item) => (
                                        <FormItem
                                            key={item}
                                            className="flex flex-row items-center space-x-2 space-y-0"
                                        >
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), item])
                                                            : field.onChange(
                                                                field.value?.filter((value) => value !== item)
                                                            );
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                                {item}
                                            </FormLabel>
                                        </FormItem>
                                    ))}
                                    <FormMessage />
                                </>
                            );
                        }}
                    />
                </div>
            </div>

            <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Your Headline</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. Explore hidden Saigon with a local foodie" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>What we'll do</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Describe a typical tour experience..."
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
