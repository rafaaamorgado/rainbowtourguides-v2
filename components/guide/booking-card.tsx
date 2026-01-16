"use client";

import { useState } from "react";
import { Calendar, Clock, Users, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Duration = 4 | 6 | 8;

interface BookingCardProps {
  basePrices: Partial<Record<Duration, number>>;
  currency?: string | null;
}

export function BookingCard({ basePrices, currency = "USD" }: BookingCardProps) {
  const [duration, setDuration] = useState<Duration>(4);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [location, setLocation] = useState("default");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const price = basePrices[duration] ?? 120;
  const serviceFee = price * 0.08;
  const total = price + serviceFee;

  const canSubmit = date && time && travelers > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
    setLoading(false);
  };

  const durationOptions: Duration[] = [4, 6, 8];

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white shadow-xl p-5 space-y-5 sticky top-24">
      <div>
        <p className="text-sm text-ink-soft">Starting from</p>
        <p className="text-3xl font-bold text-ink">
          {currency === "EUR" ? "€" : "$"}
          {price.toFixed(0)} <span className="text-base font-medium text-ink-soft">per tour</span>
        </p>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-ink">Duration</label>
        <div className="grid grid-cols-3 gap-2">
          {durationOptions.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setDuration(opt)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-semibold transition-colors",
                duration === opt
                  ? "border-brand bg-brand/10 text-brand"
                  : "border-slate-200 hover:border-brand/40"
              )}
            >
              {opt} hrs
            </button>
          ))}
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
            Time
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Travelers */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
          Travelers
        </label>
        <div className="relative flex items-center gap-2">
          <Users className="absolute left-3 h-4 w-4 text-ink-soft" />
          <Input
            type="number"
            min={1}
            max={8}
            value={travelers}
            onChange={(e) => setTravelers(Number(e.target.value))}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-ink-soft">Max group size: 8 people</p>
      </div>

      {/* Location */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
          Meeting location
        </label>
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <option value="default">Guide's default meetup</option>
          <option value="hotel">Hotel pickup</option>
          <option value="custom">Custom location</option>
        </select>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-ink-soft uppercase tracking-wider">
          Special requests
        </label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Accessibility needs, food preferences, must-see spots..."
          className="rounded-xl"
        />
      </div>

      {/* Price breakdown */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm text-ink">
        <div className="flex justify-between">
          <span>Base tour ({duration} hrs)</span>
          <span>
            {currency === "EUR" ? "€" : "$"}
            {price.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Service fee</span>
          <span>
            {currency === "EUR" ? "€" : "$"}
            {serviceFee.toFixed(0)}
          </span>
        </div>
        <div className="h-px bg-slate-200 my-1" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>
            {currency === "EUR" ? "€" : "$"}
            {total.toFixed(0)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          className="w-full h-12 text-base font-semibold"
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Request to Book"}
        </Button>
        <p className="text-xs text-center text-ink-soft">
          You won&apos;t be charged yet. The guide will confirm availability first.
        </p>
        {submitted && (
          <p className="text-xs text-emerald-600 text-center">
            Request sent (demo). We&apos;ll notify the guide.
          </p>
        )}
      </div>
    </aside>
  );
}
