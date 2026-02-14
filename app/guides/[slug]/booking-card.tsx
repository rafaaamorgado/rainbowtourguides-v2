'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Users, MapPin, FileText } from 'lucide-react';
import { parseDate, type CalendarDate } from '@internationalized/date';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface BookingCardProps {
  guide: {
    id: string;
    slug: string;
    name: string;
    price_4h: number;
    price_6h: number;
    price_8h: number;
  };
  isAuthenticated: boolean;
}

export function BookingCard({ guide, isAuthenticated }: BookingCardProps) {
  const router = useRouter();
  const [duration, setDuration] = useState<4 | 6 | 8>(4);
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [time, setTime] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [meetingLocation, setMeetingLocation] = useState('default');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Price calculation
  const basePrice =
    duration === 4
      ? guide.price_4h
      : duration === 6
        ? guide.price_6h
        : guide.price_8h;
  const serviceFee = Math.round(basePrice * 0.1);
  const total = basePrice + serviceFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!date || !time) {
      setError('Please select a date and time');
      return;
    }

    // Check if date is in the future
    const selectedDate = new Date(date.toString() + 'T' + time);
    if (selectedDate <= new Date()) {
      setError('Please select a future date and time');
      return;
    }

    // Check authentication
    // TODO: add slug field to guides table, using id for now
    if (!isAuthenticated) {
      router.push(`/auth/sign-in?redirect=/guides/${guide.slug || guide.id}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Create booking via data-service
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate to bookings page
      router.push('/traveler/bookings');
    } catch (err) {
      setError('Failed to create booking request. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-panel-light border-2 border-slate-200 rounded-2xl p-6 shadow-glass sticky top-24">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Price Display */}
        <div className="pb-6 border-b border-slate-200">
          <p className="text-sm text-ink-soft mb-1">Starting from</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-ink">${basePrice}</span>
            <span className="text-ink-soft">/ per tour</span>
          </div>
        </div>

        {/* Tour Duration */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-ink block">
            Tour Duration
          </label>
          <div className="space-y-2">
            {[
              { hours: 4 as const, price: guide.price_4h },
              { hours: 6 as const, price: guide.price_6h },
              { hours: 8 as const, price: guide.price_8h },
            ].map((option) => (
              <label
                key={option.hours}
                className={cn(
                  'flex items-center justify-between p-3 border-2 rounded-xl cursor-pointer transition-all',
                  duration === option.hours
                    ? 'border-brand bg-brand/5'
                    : 'border-slate-200 hover:border-slate-300',
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="duration"
                    value={option.hours}
                    checked={duration === option.hours}
                    onChange={() => setDuration(option.hours)}
                    className="w-4 h-4 text-brand focus:ring-brand"
                  />
                  <span className="font-medium text-ink">
                    {option.hours} hours
                  </span>
                </div>
                <span className="font-semibold text-ink">${option.price}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Picker */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink flex items-center gap-2">
            Date
          </label>
          <DatePicker
            value={date}
            onChange={setDate}
            minValue={parseDate(new Date().toISOString().split('T')[0])}
            placeholderValue={parseDate(new Date().toISOString().split('T')[0])}
            isRequired
          />
        </div>

        {/* Time Picker */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time
          </label>
          <Input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className="w-full"
          />
        </div>

        {/* Number of Travelers */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink flex items-center gap-2">
            <Users className="h-4 w-4" />
            Number of Travelers
          </label>
          <Select
            value={travelers.toString()}
            onChange={(val) => setTravelers(parseInt(val))}
            options={[
              { value: '1', label: '1 person' },
              { value: '2', label: '2 people' },
              { value: '3', label: '3 people' },
              { value: '4', label: '4 people' },
            ]}
            icon={<Users className="h-4 w-4" />}
          />
          <p className="text-xs text-ink-soft">Max group size: 4 people</p>
        </div>

        {/* Meeting Location */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Meeting Location
          </label>
          <Select
            value={meetingLocation}
            onChange={setMeetingLocation}
            options={[
              { value: 'default', label: "Guide's Default Meetup" },
              { value: 'hotel', label: 'My Hotel' },
              { value: 'custom', label: 'Custom Location' },
            ]}
            icon={<MapPin className="h-4 w-4" />}
          />
        </div>

        {/* Special Requests */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-ink flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Special Requests (Optional)
          </label>
          <Textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Any specific interests, dietary restrictions, or accessibility needs?"
            rows={3}
          />
        </div>

        {/* Price Summary */}
        <div className="pt-6 border-t border-slate-200 space-y-2">
          <div className="flex justify-between text-ink-soft text-sm">
            <span>Base tour price ({duration} hours)</span>
            <span>${basePrice}</span>
          </div>
          <div className="flex justify-between text-ink-soft text-sm">
            <span>Service fee</span>
            <span>${serviceFee}</span>
          </div>
          <div className="flex justify-between text-ink font-semibold text-lg pt-2 border-t border-slate-200">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-4 text-base font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Request Booking'}
        </Button>

        {/* Note */}
        <p className="text-xs text-ink-soft text-center leading-relaxed">
          You won't be charged yet. The guide will confirm availability first.
        </p>
      </form>
    </div>
  );
}
