"use client";

import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};

interface GuideReviewsProps {
  reviews: Review[];
}

export function GuideReviews({ reviews }: GuideReviewsProps) {
  if (!reviews.length) {
    return (
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-ink">Reviews</h3>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-ink-soft">
          No reviews yet. Be the first to explore with this guide.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-ink">Reviews</h3>
      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-brand/10 text-brand font-semibold">
                  {review.author.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">{review.author}</p>
                    <p className="text-xs text-ink-soft">{review.date}</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-4 w-4 fill-amber-400" />
                    <span className="text-sm font-semibold">{review.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-sm text-ink leading-relaxed">{review.comment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
