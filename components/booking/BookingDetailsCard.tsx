'use client';

import { formatInTimeZone } from 'date-fns-tz';
import { Clock, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type BookingDetailsCardProps = {
  bookingDateUtc: string;
  guideTimezone: string;
  userTimezone?: string;
};

export function BookingDetailsCard({
  bookingDateUtc,
  guideTimezone,
  userTimezone,
}: BookingDetailsCardProps) {
  const bookingDate = new Date(bookingDateUtc);
  const browserTimezone =
    userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const yourTime = formatInTimeZone(bookingDate, browserTimezone, 'h:mm a zzz');
  const localTime = formatInTimeZone(bookingDate, guideTimezone, 'h:mm a zzz');
  const yourDate = formatInTimeZone(bookingDate, browserTimezone, 'EEE, MMM d');
  const localDate = formatInTimeZone(bookingDate, guideTimezone, 'EEE, MMM d');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Booking Time</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="text-base font-semibold text-foreground">
            Your Time: {yourTime}
          </p>
          <p className="text-sm text-muted-foreground">{yourDate}</p>
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Zone: {browserTimezone}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <p className="text-base font-semibold text-foreground">
            Local Time: {localTime}
          </p>
          <p className="text-sm text-muted-foreground">{localDate}</p>
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            Zone: {guideTimezone}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
