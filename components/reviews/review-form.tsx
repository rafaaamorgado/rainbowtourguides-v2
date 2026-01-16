'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Review must be at least 10 characters"),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  bookingId: string;
  guideId: string;
  travelerId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ bookingId, guideId, travelerId, onSuccess }: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const supabase = createSupabaseBrowserClient();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
    },
  });

  async function onSubmit(data: ReviewFormValues) {
    if (!supabase) {
      alert("Supabase not configured");
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await (supabase.from('reviews') as any).insert({
        booking_id: bookingId,
        guide_id: guideId,
        traveler_id: travelerId,
        rating: data.rating,
        comment: data.comment,
      });

      if (error) throw error;
      if (onSuccess) onSuccess();

    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 border p-6 rounded-lg bg-card">
        <h3 className="font-semibold text-lg">Leave a Review</h3>
        
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rating</FormLabel>
              <FormControl>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-8 w-8 cursor-pointer transition-colors",
                        (hoverRating || field.value) >= star
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      )}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => field.onChange(star)}
                    />
                  ))}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Experience</FormLabel>
              <FormControl>
                <Textarea placeholder="Share details about your tour..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </Form>
  );
}
