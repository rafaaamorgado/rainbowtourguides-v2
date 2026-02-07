'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarCore,
  DayJsAdapter,
  MonthView,
  ViewRegistry,
  WeekView,
} from '@taskgenius/calendar';
import '@taskgenius/calendar/styles.css';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/en';
import type {
  AvailabilityPattern,
  UnavailableDate,
} from '@/lib/guide-availability';
import type { GuideTimeOff } from '@/lib/guide-time-off';

type ViewType = 'month' | 'week';

class MonthViewLongLabel extends MonthView {
  static override meta = {
    ...MonthView.meta,
    label: 'Month',
    shortLabel: 'Month',
  };
}

class WeekViewLongLabel extends WeekView {
  static override meta = {
    ...WeekView.meta,
    label: 'Week',
    shortLabel: 'Week',
  };
}

interface BookingEvent {
  id: string;
  title: string;
  start: string; // ISO date-time string
  end: string; // ISO date-time string
  color?: string;
}

interface GuideAvailabilityCalendarProps {
  availabilityPattern: AvailabilityPattern;
  unavailableDates: UnavailableDate[];
  timeOff?: GuideTimeOff[];
  bookings?: BookingEvent[];
}

export function GuideAvailabilityCalendar({
  availabilityPattern,
  unavailableDates,
  timeOff = [],
  bookings = [],
}: GuideAvailabilityCalendarProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<CalendarCore | null>(null);
  const [view, setView] = useState<ViewType>('month');
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  dayjs.locale('en');

  // Calculate visible date range for the current view to generate availability slots.
  const visibleRange = useMemo(() => {
    if (view === 'week') {
      const start = currentDate
        .startOf('day')
        .subtract(currentDate.day(), 'day'); // Sunday-start week
      const end = start.add(6, 'day');
      return { start, end };
    }
    // month
    const monthStart = currentDate.startOf('month');
    const start = monthStart.subtract(monthStart.day(), 'day');
    const monthEnd = currentDate.endOf('month');
    const end = monthEnd.add(6 - monthEnd.day(), 'day');
    return { start, end };
  }, [currentDate, view]);

  // Build events from availability pattern, blackout dates, and bookings.
  const events = useMemo(() => {
    const result: Array<{
      id: string;
      title: string;
      start: string;
      end: string;
      color?: string;
      metadata?: Record<string, unknown>;
    }> = [];

    // Availability slots (recurring by weekday) rendered over the visible range
    if (availabilityPattern) {
      let cursor = visibleRange.start;
      while (
        cursor.isBefore(visibleRange.end) ||
        cursor.isSame(visibleRange.end, 'day')
      ) {
        const weekdayKey = cursor.format('dddd').toLowerCase(); // e.g., "monday"
        const slot = (availabilityPattern as Record<string, any>)[weekdayKey];
        if (slot?.active) {
          const start =
            cursor.format('YYYY-MM-DD') + ` ${slot.start ?? '09:00'}`;
          const end = cursor.format('YYYY-MM-DD') + ` ${slot.end ?? '17:00'}`;
          result.push({
            id: `avail-${cursor.format('YYYY-MM-DD')}`,
            title: 'Available',
            start,
            end,
            color: '#22c55e', // green
            metadata: { type: 'availability', weekdayKey },
          });
        }
        cursor = cursor.add(1, 'day');
      }
    }

    // Blocked ranges (time-bound)
    unavailableDates.forEach((date) => {
      result.push({
        id: `blocked-${date.id}`,
        title: 'Blocked',
        start: `${date.start_date} 00:00`,
        end: `${date.end_date} 23:59`,
        color: '#f97316', // orange
        metadata: { type: 'blocked' },
      });
    });

    // Time off intervals (timestamptz)
    timeOff.forEach((item) => {
      result.push({
        id: `timeoff-${item.id}`,
        title: item.title || 'Time off',
        start: item.starts_at,
        end: item.ends_at,
        color: '#ef4444', // red
        metadata: { type: 'time_off' },
      });
    });

    // Bookings (passed in from server if available)
    bookings.forEach((booking) => {
      result.push({
        id: `booking-${booking.id}`,
        title: booking.title,
        start: booking.start,
        end: booking.end,
        color: booking.color ?? '#0ea5e9', // blue
        metadata: { type: 'booking' },
      });
    });

    return result;
  }, [
    availabilityPattern,
    bookings,
    unavailableDates,
    timeOff,
    visibleRange.end,
    visibleRange.start,
  ]);

  // Initialize calendar once
  useEffect(() => {
    if (!containerRef.current) return;
    const registry = new ViewRegistry();
    registry.register(MonthViewLongLabel);
    registry.register(WeekViewLongLabel);
    const calendar = new CalendarCore(containerRef.current, {
      viewRegistry: registry,
      dateAdapter: new DayJsAdapter(),
      view: { type: view },
      events,
      dateFormats: {
        monthHeader: 'MMMM YYYY',
        dayHeader: 'ddd',
      },
      draggable: { enabled: false }, // per requirements, no drag/resize
      onViewChange: (nextView) => {
        setView((prev) => (prev === nextView ? prev : (nextView as ViewType)));
      },
      onDateChange: (date) => {
        const next = dayjs(date);
        setCurrentDate((prev) => (prev.isSame(next, 'day') ? prev : next));
      },
    });
    calendarRef.current = calendar;
    return () => calendar.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync events to the calendar instance
  useEffect(() => {
    const calendar = calendarRef.current;
    if (!calendar) return;
    calendar.setEvents(events);
  }, [events]);

  // Sync view/date changes to the calendar instance without causing loops
  useEffect(() => {
    const calendar = calendarRef.current;
    if (!calendar) return;
    if (calendar.getView() !== view) {
      calendar.setView(view);
    }
    const calDate = dayjs(calendar.getCurrentDate());
    if (!calDate.isSame(currentDate, 'day')) {
      calendar.goToDate(currentDate.toDate());
    }
  }, [view, currentDate]);

  return <div ref={containerRef} className="tg-calendar w-full h-[760px]" />;
}
