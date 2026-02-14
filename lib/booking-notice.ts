import { type CalendarDate, parseDate } from '@internationalized/date';
import { addHours, addMinutes, format, isBefore } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

export function getSafeBookingStart(guideTimezone: string) {
  const guideNow = toZonedTime(new Date(), guideTimezone);
  const safeBookingStart = addHours(guideNow, 24);

  if (
    safeBookingStart.getSeconds() > 0 ||
    safeBookingStart.getMilliseconds() > 0
  ) {
    safeBookingStart.setSeconds(0, 0);
    return addMinutes(safeBookingStart, 1);
  }

  safeBookingStart.setSeconds(0, 0);
  return safeBookingStart;
}

export function toCalendarDateValue(date: Date) {
  return parseDate(format(date, 'yyyy-MM-dd'));
}

export function toTimeValue(date: Date) {
  return format(date, 'HH:mm');
}

export function isBeforeSafeBookingStart(
  selectedDate: CalendarDate,
  selectedTime: string,
  safeBookingStart: Date,
  guideTimezone: string,
) {
  if (!selectedTime) {
    return false;
  }

  const selectedDateTime = fromZonedTime(
    `${selectedDate.toString()}T${selectedTime}:00`,
    guideTimezone,
  );
  const safeBookingStartUtc = fromZonedTime(safeBookingStart, guideTimezone);
  return isBefore(selectedDateTime, safeBookingStartUtc);
}
