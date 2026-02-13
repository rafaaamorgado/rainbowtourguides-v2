'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Users, MapPin, Loader2 } from 'lucide-react';
import { parseDate, type CalendarDate } from '@internationalized/date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

type Duration = 4 | 6 | 8;

interface BookingCardProps {
  guideId: string;
  cityId: string;
  basePrices: Partial<Record<Duration, number>>;
  currency?: string | null;
}

export function BookingCard({
  guideId,
  cityId,
  basePrices,
  currency = 'USD',
}: BookingCardProps) {
  const router = useRouter();
  const [duration, setDuration] = useState<Duration>(4);
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [time, setTime] = useState('');
  const [travelers, setTravelers] = useState(2);
  const [location, setLocation] = useState('default');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const price = basePrices[duration] ?? 120;
  const serviceFee = price * 0.08;
  const total = price + serviceFee;

  const canSubmit = date && time && travelers > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError('');

    try {
      const supabase = createSupabaseBrowserClient();
      if (!supabase) {
        setError('Unable to connect to database');
        setLoading(false);
        return;
      }

      // Check authentication
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        // Redirect to sign-in with return URL
        router.push(
          `/auth/sign-in?returnUrl=${encodeURIComponent(window.location.pathname)}`,
        );
        return;
      }

      // Validate date is in the future
      const startDateTime = new Date(`${date.toString()}T${time}`);
      if (startDateTime <= new Date()) {
        setError('Please select a future date and time');
        setLoading(false);
        return;
      }

      // Create booking via API
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guideId,
          cityId,
          duration,
          date: date.toString(),
          time,
          travelers,
          location,
          notes,
          price: total,
          currency: currency || 'USD',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create booking request');
        setLoading(false);
        return;
      }

      // Redirect to traveler bookings page
      router.push('/traveler/bookings?success=booking_created');
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const durationOptions: Duration[] = [4, 6, 8];

  return (
    <aside className="rounded-3xl border border-border bg-card shadow-editorial p-5 space-y-5 sticky top-24">
      <div>
        <p className="text-sm text-ink-soft">Starting from</p>
        <p className="text-3xl font-display font-bold text-ink">
          {currency === 'EUR' ? '€' : '$'}
          {price.toFixed(0)}{' '}
          <span className="text-base font-medium text-ink-soft">per tour</span>
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
                'rounded-xl border px-3 py-2 text-sm font-semibold transition-colors',
                duration === opt
                  ? 'border-brand bg-brand/10 text-brand'
                  : 'border-border hover:border-brand/40',
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
          <DatePicker
            value={date}
            onChange={setDate}
            minValue={parseDate(new Date().toISOString().split('T')[0])}
            placeholderValue={parseDate(new Date().toISOString().split('T')[0])}
          />
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
        <Select
          value={location}
          onChange={setLocation}
          options={[
            { value: 'default', label: "Guide's default meetup" },
            { value: 'hotel', label: 'Hotel pickup' },
            { value: 'custom', label: 'Custom location' },
          ]}
          className="h-11"
        />
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
      <div className="rounded-xl border border-border bg-surface-warm p-4 space-y-2 text-sm text-ink">
        <div className="flex justify-between">
          <span>Base tour ({duration} hrs)</span>
          <span>
            {currency === 'EUR' ? '€' : '$'}
            {price.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Service fee</span>
          <span>
            {currency === 'EUR' ? '€' : '$'}
            {serviceFee.toFixed(0)}
          </span>
        </div>
        <div className="h-px bg-border my-1" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>
            {currency === 'EUR' ? '€' : '$'}
            {total.toFixed(0)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}
        <Button
          className="w-full h-12 text-base font-semibold rounded-full"
          disabled={!canSubmit || loading}
          onClick={handleSubmit}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating request...
            </>
          ) : (
            'Request to Book'
          )}
        </Button>
        <p className="text-xs text-center text-ink-soft">
          You won&apos;t be charged yet. The guide will confirm availability
          first.
        </p>
      </div>
    </aside>
  );
}
