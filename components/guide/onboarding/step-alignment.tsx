'use client';

import { UseFormReturn } from "react-hook-form";
import { GuideOnboardingData } from "@/lib/validations/guide-onboarding";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface StepAlignmentProps {
    form: UseFormReturn<GuideOnboardingData>;
}

export function StepAlignment({ form }: StepAlignmentProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h2 className="text-xl font-semibold">Alignment & Standards</h2>
                <p className="text-sm text-muted-foreground">
                    Rainbow Tour Guides is built on trust, safety, and respect.
                </p>
            </div>

            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="lgbtq_alignment.affirms_identity"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    I provide LGBTQ+ affirming experiences
                                </FormLabel>
                                <FormDescription>
                                    You commit to creating a safe, welcoming environment for queer travelers.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="lgbtq_alignment.agrees_conduct"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    I agree to the Code of Conduct
                                </FormLabel>
                                <FormDescription>
                                    You will treat all travelers with respect and maintain professional boundaries.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="lgbtq_alignment.no_sexual_services"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Strict policy: No sexual services
                                </FormLabel>
                                <FormDescription>
                                    This platform is for tours only. You will not offer or imply sexual services.
                                </FormDescription>
                            </div>
                        </FormItem>
                    )}
                />
            </div>

            <FormField
                control={form.control}
                name="lgbtq_alignment.why_guiding"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Why I enjoy guiding LGBTQ+ travelers</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="Share your motivation..."
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="lgbtq_alignment.expectations"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>What travelers can expect from me (Tone & Vibe)</FormLabel>
                        <FormControl>
                            <Textarea
                                placeholder="e.g. Relaxed, informative, like a friend showing you around..."
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
