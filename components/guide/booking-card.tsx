'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Users, Loader2 } from 'lucide-react';
import { type CalendarDate } from '@internationalized/date';
import { addToast, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import {
  getSafeBookingStart,
  isBeforeSafeBookingStart,
  toCalendarDateValue,
  toTimeValue,
} from '@/lib/booking-notice';
import { resolveGuideTimezone } from '@/lib/guide-timezone';

type Duration = 4 | 6 | 8;

interface BookingCardProps {
  guideId: string;
  cityId: string;
  guideCityName?: string | null;
  guideTimezone?: string | null;
  basePrices: Partial<Record<Duration, number>>;
  currency?: string | null;
}

export function BookingCard({
  guideId,
  cityId,
  guideCityName,
  guideTimezone,
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
  const [isMobileBookingOpen, setIsMobileBookingOpen] = useState(false);
  // TODO: Pull timezone from guide profile/city records when missing.
  const resolvedGuideTimezone =
    guideTimezone || resolveGuideTimezone(guideCityName);
  const safeBookingStart = getSafeBookingStart(resolvedGuideTimezone);
  const safeBookingStartDate = toCalendarDateValue(safeBookingStart);
  const safeBookingStartTime = toTimeValue(safeBookingStart);
  const currencySymbol = currency === 'EUR' ? '€' : '$';

  const price = basePrices[duration] ?? 120;
  const serviceFee = price * 0.08;
  const total = price + serviceFee;

  const canSubmit = date && time && travelers > 0;
  const isCutoffDaySelected = !!date && date.compare(safeBookingStartDate) === 0;

  const showNoticeToast = () => {
    addToast({
      title: '24-hour notice required',
      description: 'Please give the guide at least 24 hours notice.',
      color: 'warning',
    });
  };

  const handleDateChange = (nextDate: CalendarDate | null) => {
    if (!nextDate) {
      setDate(null);
      return;
    }

    const safeBookingStartForValidation = getSafeBookingStart(
      resolvedGuideTimezone,
    );
    const safeBookingStartDateForValidation = toCalendarDateValue(
      safeBookingStartForValidation,
    );

    if (nextDate.compare(safeBookingStartDateForValidation) < 0) {
      showNoticeToast();
      return;
    }

    if (
      time &&
      isBeforeSafeBookingStart(
        nextDate,
        time,
        safeBookingStartForValidation,
        resolvedGuideTimezone,
      )
    ) {
      showNoticeToast();
      setTime('');
    }

    setDate(nextDate);
  };

  const handleTimeChange = (nextTime: string) => {
    if (!date) {
      setTime(nextTime);
      return;
    }

    if (
      isBeforeSafeBookingStart(
        date,
        nextTime,
        getSafeBookingStart(resolvedGuideTimezone),
        resolvedGuideTimezone,
      )
    ) {
      showNoticeToast();
      return;
    }

    setTime(nextTime);
  };

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

      if (!user.email_confirmed_at) {
        addToast({
          title: 'Email verification required',
          description:
            'Please verify your email address before booking. Check your inbox.',
          color: 'danger',
        });
        setLoading(false);
        return;
      }

      if (
        isBeforeSafeBookingStart(
          date,
          time,
          getSafeBookingStart(resolvedGuideTimezone),
          resolvedGuideTimezone,
        )
      ) {
        showNoticeToast();
        setError('Please give the guide at least 24 hours notice.');
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

      if (!data.bookingId) {
        setError('Booking was created but no booking ID was returned.');
        setLoading(false);
        return;
      }

      // Redirect to booking detail with success state for the request-first flow.
      router.push(
        `/traveler/bookings/${data.bookingId}?success=request_sent`,
      );
    } catch (err) {
      console.error('Error creating booking:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const durationOptions: Duration[] = [4, 6, 8];
  const renderBookingFormContent = () => (
    <>
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
            onChange={handleDateChange}
            minDate={safeBookingStart}
            minValue={safeBookingStartDate}
            placeholderValue={safeBookingStartDate}
          />
          <p className="text-xs text-ink-soft">
            To give guides enough time to prepare, bookings must be made at
            least 24 hours in advance.
          </p>
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
              onChange={(e) => handleTimeChange(e.target.value)}
              min={isCutoffDaySelected ? safeBookingStartTime : undefined}
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
            {currencySymbol}
            {price.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Service fee</span>
          <span>
            {currencySymbol}
            {serviceFee.toFixed(0)}
          </span>
        </div>
        <div className="h-px bg-border my-1" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>
            {currencySymbol}
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
            'Request Booking'
          )}
        </Button>
        <p className="text-xs text-center text-ink-soft">
          You won&apos;t be charged yet. The guide will confirm availability
          first.
        </p>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden md:block rounded-3xl border border-border bg-card shadow-editorial p-5 space-y-5 sticky top-24">
        <div>
          <p className="text-sm text-ink-soft">Starting from</p>
          <p className="text-3xl font-display font-bold text-ink">
            {currencySymbol}
            {price.toFixed(0)}{' '}
            <span className="text-base font-medium text-ink-soft">per tour</span>
          </p>
        </div>
        {renderBookingFormContent()}
      </aside>

      <div className="h-24 md:hidden" aria-hidden="true" />
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t p-4 md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ink-soft uppercase tracking-wide">From</p>
            <p className="text-lg font-display font-bold text-ink">
              {currencySymbol}
              {price.toFixed(0)}
              <span className="ml-1 text-sm font-medium text-ink-soft">/tour</span>
            </p>
          </div>
          <Button
            className="h-11 rounded-full px-6 text-sm font-semibold"
            onClick={() => setIsMobileBookingOpen(true)}
            disabled={loading}
          >
            Request Booking
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isMobileBookingOpen}
        onOpenChange={setIsMobileBookingOpen}
        placement="bottom-center"
        size="full"
        scrollBehavior="inside"
        classNames={{
          wrapper: 'items-end',
          base: 'm-0 rounded-t-3xl',
        }}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Request Booking
              </ModalHeader>
              <ModalBody className="space-y-5 pb-28">
                <div>
                  <p className="text-sm text-ink-soft">Starting from</p>
                  <p className="text-2xl font-display font-bold text-ink">
                    {currencySymbol}
                    {price.toFixed(0)}{' '}
                    <span className="text-sm font-medium text-ink-soft">per tour</span>
                  </p>
                </div>
                {renderBookingFormContent()}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
