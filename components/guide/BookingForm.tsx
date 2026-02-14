'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { parseDate, type CalendarDate } from '@internationalized/date';
import { addToast } from '@heroui/react';
import { addHours, format, isBefore } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';

type BookingFormProps = {
  onSubmit: (
    formData: FormData,
  ) => Promise<{
    success: boolean;
    error?: string;
    guideName?: string;
    bookingId?: string;
  }>;
  guideName: string;
  guideTimezone?: string;
};

export function BookingForm({
  onSubmit,
  guideName,
  guideTimezone = 'UTC',
}: BookingFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [time, setTime] = useState('');
  // TODO: Pull this from guide profile/city records when timezone is missing.
  const resolvedGuideTimezone = guideTimezone || 'UTC';

  const getSafeMinDate = () => {
    const nowInGuideCity = toZonedTime(new Date(), resolvedGuideTimezone);
    return addHours(nowInGuideCity, 24);
  };

  const safeMinDate = getSafeMinDate();
  const safeMinDateValue = parseDate(format(safeMinDate, 'yyyy-MM-dd'));
  const safeMinTimeValue = format(safeMinDate, 'HH:mm');
  const isCutoffDaySelected = !!date && date.compare(safeMinDateValue) === 0;

  const isBeforeSafeMinDateTime = (
    selectedDate: CalendarDate,
    selectedTime: string,
    safeDate: Date,
  ) => {
    if (!selectedTime) {
      return false;
    }

    const selectedZonedDateTime = fromZonedTime(
      `${selectedDate.toString()}T${selectedTime}:00`,
      resolvedGuideTimezone,
    );
    const safeMinZonedDateTime = fromZonedTime(safeDate, resolvedGuideTimezone);

    return isBefore(selectedZonedDateTime, safeMinZonedDateTime);
  };

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

    const safeMinDateForValidation = getSafeMinDate();
    const safeMinDateValueForValidation = parseDate(
      format(safeMinDateForValidation, 'yyyy-MM-dd'),
    );

    if (nextDate.compare(safeMinDateValueForValidation) < 0) {
      showNoticeToast();
      return;
    }

    if (
      time &&
      isBeforeSafeMinDateTime(nextDate, time, safeMinDateForValidation)
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

    if (isBeforeSafeMinDateTime(date, nextTime, getSafeMinDate())) {
      showNoticeToast();
      return;
    }

    setTime(nextTime);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (date && time && isBeforeSafeMinDateTime(date, time, getSafeMinDate())) {
      showNoticeToast();
      setError('Please give the guide at least 24 hours notice.');
      return;
    }

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setError('Unable to connect to database');
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError('Please sign in before booking.');
      return;
    }

    if (!user.email_confirmed_at) {
      const verificationMessage =
        'Please verify your email address before booking. Check your inbox.';
      addToast({
        title: 'Email verification required',
        description: verificationMessage,
        color: 'danger',
      });
      setError(verificationMessage);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    if (date) {
      formData.set('date', date.toString());
    }
    if (time) {
      formData.set('time', time);
    }

    const result = await onSubmit(formData);

    setIsSubmitting(false);

    if (result.success) {
      if (result.bookingId) {
        router.push(`/traveler/bookings/${result.bookingId}?success=request_sent`);
        return;
      }
      setSuccess(true);
    } else if (result.error) {
      setError(result.error);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">
            Booking request sent!
          </h3>
          <p className="text-sm text-green-800 dark:text-green-200">
            Your request has been sent to {guideName}. You&apos;ll hear back
            soon.
          </p>
        </div>
        <Button
          asChild
          variant="bordered"
          className="w-full border-green-300 dark:border-green-700"
        >
          <Link href="/traveler/bookings">View my bookings</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="date" className="text-sm font-medium">
          Date
        </label>
        <DatePicker
          id="date"
          value={date}
          onChange={handleDateChange}
          minDate={safeMinDate}
          minValue={safeMinDateValue}
          placeholderValue={safeMinDateValue}
          isRequired
        />
        <p className="text-xs text-muted-foreground">
          To give guides enough time to prepare, bookings must be made at least
          24 hours in advance.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="time" className="text-sm font-medium">
          Time
        </label>
        <Input
          id="time"
          name="time"
          type="time"
          value={time}
          onChange={(e) => handleTimeChange(e.target.value)}
          min={isCutoffDaySelected ? safeMinTimeValue : undefined}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="duration" className="text-sm font-medium">
          Duration (hours)
        </label>
        <Input
          id="duration"
          name="duration"
          type="number"
          min="1"
          max="12"
          step="0.5"
          defaultValue="4"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes (optional)
        </label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Any special requests or information for the guide..."
          rows={4}
        />
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Request Booking'}
      </Button>

      <p className="text-xs text-muted-foreground">
        Your request will be sent to the guide for approval. You&apos;ll be
        notified once they respond.
      </p>
      <p className="text-xs text-muted-foreground italic mt-2">
        Please follow all local laws and platform rules. Rainbow Tour Guides is
        a marketplace connecting travelers with guides.
      </p>
    </form>
  );
}
