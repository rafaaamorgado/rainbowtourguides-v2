'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { useToast } from "@/hooks/use-toast"; // Assuming toast hook exists or standard shadcn pattern

const bookingSchema = z.object({
    date: z.date({ message: "A date is required." }),
    start_time: z.string().min(1, "Start time is required"), // HH:MM
    duration: z.string(), // "4", "6", "8"
    notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingRequestFormProps {
    guideId: string;
    cityId: string;
    priceRates: {
        price_4h: number;
        price_6h: number;
        price_8h: number;
        currency: string;
    };
}

export function BookingRequestForm({ guideId, cityId, priceRates }: BookingRequestFormProps) {
    const router = useRouter();
    // Safe toast usage placeholder - if hook doesn't exist, we just console log
    // const { toast } = useToast(); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            duration: "4",
        },
    });

    const duration = form.watch("duration");

    const estimatedPrice = (() => {
        switch (duration) {
            case "4": return priceRates.price_4h;
            case "6": return priceRates.price_6h;
            case "8": return priceRates.price_8h;
            default: return 0;
        }
    })();

    async function onSubmit(data: BookingFormValues) {
        setIsSubmitting(true);

        try {
            const supabase = createSupabaseBrowserClient();
            if (!supabase) {
                alert("Supabase not configured");
                return;
            }
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push("/auth/sign-in?returnUrl=" + window.location.pathname);
                return;
            }

            // Calculate timestamps
            // Note: This is simplified. Proper implementation needs timezone handling.
            // We are assuming inputs are "local time" effectively.

            const dateStr = format(data.date, 'yyyy-MM-dd');
            const startDateTimeStr = `${dateStr}T${data.start_time}:00`;
            const startAt = new Date(startDateTimeStr);
            const endAt = new Date(startAt.getTime() + parseInt(data.duration) * 60 * 60 * 1000);

            const { error } = await (supabase.from('bookings') as any).insert({
                traveler_id: user.id,
                guide_id: guideId,
                city_id: cityId,
                status: 'pending',
                price_total: estimatedPrice,
                currency: priceRates.currency,
                start_at: startAt.toISOString(),
                ends_at: endAt.toISOString(),
                duration_hours: parseInt(data.duration),
                notes: data.notes
            });

            if (error) throw error;

            // Redirect to success or dashboard
            router.push("/traveler/dashboard?success=booking_requested");

        } catch (error) {
            alert("Failed to submit request."); // Fallback
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date < new Date() || date < new Date("1900-01-01")
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="start_time"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="duration"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Duration</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="4">4 Hours (Half Day)</SelectItem>
                                        <SelectItem value="6">6 Hours</SelectItem>
                                        <SelectItem value="8">8 Hours (Full Day)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="p-4 bg-muted/20 rounded-lg flex justify-between items-center">
                    <span className="text-sm font-medium">Estimated Total</span>
                    <span className="text-xl font-bold">{estimatedPrice} {priceRates.currency}</span>
                </div>

                <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Message to Guide</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Tell them about your interests or any special requests..."
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Sending Request..." : "Request Booking"}
                </Button>
            </form>
        </Form>
    );
}
