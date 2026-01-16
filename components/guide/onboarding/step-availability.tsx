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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

interface StepAvailabilityProps {
    form: UseFormReturn<GuideOnboardingData>;
}

const WEEKDAYS = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
];

export function StepAvailability({ form }: StepAvailabilityProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Availability</h2>
                <p className="text-sm text-muted-foreground">
                    Set your typical weekly schedule. You can block specific dates later in your dashboard.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="typical_start_time"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Typical Start Time</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="typical_end_time"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Typical End Time</FormLabel>
                            <FormControl>
                                <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="space-y-4 pt-2">
                <FormLabel className="text-base">Days I'm usually available</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                        control={form.control}
                        name="available_days"
                        render={({ field }) => {
                            return (
                                <>
                                    {WEEKDAYS.map((item) => (
                                        <FormItem
                                            key={item.id}
                                            className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3"
                                        >
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(item.id)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), item.id])
                                                            : field.onChange(
                                                                field.value?.filter((value) => value !== item.id)
                                                            );
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer w-full">
                                                {item.label}
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
        </div>
    );
}
