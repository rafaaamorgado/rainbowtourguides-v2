'use client';

import { DatePicker as HeroUIDatePicker } from '@heroui/react';
import { parseDate, type CalendarDate } from '@internationalized/date';
import type { DatePickerProps as HeroUIDatePickerProps } from '@heroui/react';
import { format } from 'date-fns';

export interface DatePickerProps {
  id?: string;
  value: CalendarDate | null;
  onChange: (date: CalendarDate | null) => void;
  minDate?: Date;
  minValue?: CalendarDate;
  maxValue?: CalendarDate;
  placeholderValue?: CalendarDate;
  granularity?: 'day' | 'hour' | 'minute' | 'second';
  showMonthAndYearPickers?: boolean;
  hideTimeZone?: boolean;
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  className?: string;
  calendarProps?: HeroUIDatePickerProps['calendarProps'];
  classNames?: HeroUIDatePickerProps['classNames'];
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

export function DatePicker({
  id,
  value,
  onChange,
  minDate,
  minValue,
  maxValue,
  placeholderValue,
  granularity = 'day',
  showMonthAndYearPickers = false,
  hideTimeZone = true,
  variant = 'bordered',
  isRequired = false,
  isDisabled = false,
  isReadOnly = false,
  className,
  calendarProps,
  classNames,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
}: DatePickerProps) {
  // Default values
  const today = parseDate(format(new Date(), 'yyyy-MM-dd'));
  const minDateValue = minDate
    ? parseDate(format(minDate, 'yyyy-MM-dd'))
    : undefined;
  const defaultMinValue = minValue ?? minDateValue ?? today;
  const defaultPlaceholderValue = placeholderValue ?? minDateValue ?? today;

  // Default calendar styling
  const defaultCalendarProps = {
    // classNames: {
    //   base: 'bg-white',
    //   gridHeader: 'bg-white shadow-none',
    //   gridBody: 'bg-white',
    // },
    ...calendarProps,
  };

  return (
    <HeroUIDatePicker
      id={id}
      value={value}
      onChange={onChange}
      minValue={defaultMinValue}
      maxValue={maxValue}
      placeholderValue={defaultPlaceholderValue}
      granularity={granularity}
      showMonthAndYearPickers={showMonthAndYearPickers}
      hideTimeZone={hideTimeZone}
      variant={variant}
      isRequired={isRequired}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      calendarProps={defaultCalendarProps}
      classNames={classNames}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={className}
    />
  );
}
