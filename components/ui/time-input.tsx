"use client";

import * as React from "react";
import {
  TimeInput as HeroTimeInput,
  TimeInputProps as HeroTimeInputProps,
} from "@heroui/react";
import { parseTime, Time } from "@internationalized/date";
import { cn } from "@/lib/utils";

export interface TimeInputProps
  extends Omit<HeroTimeInputProps, "value" | "defaultValue" | "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

// Convert TimeValue to "HH:mm" string
const formatTime = (time: Time): string => {
  const hour = `${time.hour}`.padStart(2, "0");
  const minute = `${time.minute}`.padStart(2, "0");
  return `${hour}:${minute}`;
};

/**
 * TimeInput wrapper that speaks string values ("HH:mm") to the rest of the app,
 * while using HeroUI's TimeInput under the hood.
 */
export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, value, defaultValue, onChange, granularity = "minute", ...props }, ref) => {
    const parsedValue = value ? parseTime(value) : undefined;
    const parsedDefault = defaultValue ? parseTime(defaultValue) : undefined;

    return (
      <HeroTimeInput
        ref={ref}
        variant="bordered"
        radius="sm"
        hourCycle={24}
        granularity={granularity}
        value={parsedValue}
        defaultValue={parsedDefault}
        onChange={(time) => onChange?.(formatTime(time as Time))}
        classNames={{
          base: cn("w-32", className),
          inputWrapper: "border-input hover:border-ring",
          input: "bg-background",
        }}
        {...props}
      />
    );
  }
);

TimeInput.displayName = "TimeInput";
