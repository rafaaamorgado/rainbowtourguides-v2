"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import type { DateRange } from "react-day-picker";

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
] as const;

type DayKey = (typeof DAYS_OF_WEEK)[number]["key"];

interface DaySchedule {
  active: boolean;
  start: string;
  end: string;
}

interface AvailabilityFormProps {
  initialAvailabilityPattern: Record<string, DaySchedule> | null;
  initialUnavailableDates: Array<{ id: string; start_date: string; end_date: string }>;
  onSaveSchedule: (pattern: Record<string, DaySchedule>) => Promise<{ success: boolean; error?: string }>;
  onBlockDate: (startDate: string, endDate: string) => Promise<{ success: boolean; error?: string; id?: string }>;
  onUnblockDate: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function AvailabilityForm({
  initialAvailabilityPattern,
  initialUnavailableDates,
  onSaveSchedule,
  onBlockDate,
  onUnblockDate,
}: AvailabilityFormProps) {
  // Initialize weekly schedule
  const defaultSchedule: Record<string, DaySchedule> = DAYS_OF_WEEK.reduce((acc, day) => {
    acc[day.key] = { active: false, start: "09:00", end: "17:00" };
    return acc;
  }, {} as Record<string, DaySchedule>);

  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, DaySchedule>>(
    initialAvailabilityPattern || defaultSchedule
  );

  const [unavailableDates, setUnavailableDates] = useState(initialUnavailableDates);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isBlockingDate, setIsBlockingDate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDayToggle = (dayKey: DayKey) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        active: !prev[dayKey].active,
      },
    }));
    setError(null);
    setSuccess(false);
  };

  const handleTimeChange = (dayKey: DayKey, field: "start" | "end", value: string) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value,
      },
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSaveSchedule = async () => {
    setIsSavingSchedule(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await onSaveSchedule(weeklySchedule);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "Failed to save schedule");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleBlockDate = async () => {
    if (!selectedDateRange?.from) {
      setError("Please select a date to block");
      return;
    }

    setIsBlockingDate(true);
    setError(null);

    try {
      const startDate = format(selectedDateRange.from, "yyyy-MM-dd");
      const endDate = selectedDateRange.to
        ? format(selectedDateRange.to, "yyyy-MM-dd")
        : startDate;

      const result = await onBlockDate(startDate, endDate);
      if (result.success && result.id) {
        setUnavailableDates([
          ...unavailableDates,
          { id: result.id, start_date: startDate, end_date: endDate },
        ]);
        setSelectedDateRange(undefined);
      } else {
        setError(result.error || "Failed to block date");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsBlockingDate(false);
    }
  };

  const handleUnblockDate = async (id: string) => {
    try {
      const result = await onUnblockDate(id);
      if (result.success) {
        setUnavailableDates(unavailableDates.filter((date) => date.id !== id));
      } else {
        setError(result.error || "Failed to unblock date");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Schedule saved successfully!
        </div>
      )}

      {/* Weekly Schedule Section */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            Set your regular working hours for each day of the week.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const schedule = weeklySchedule[day.key];
            return (
              <div
                key={day.key}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Switch
                    checked={schedule.active}
                    onCheckedChange={() => handleDayToggle(day.key)}
                  />
                  <Label className="font-medium min-w-[100px]">{day.label}</Label>
                </div>

                {schedule.active && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${day.key}-start`} className="text-sm text-muted-foreground">
                        Start
                      </Label>
                      <Input
                        id={`${day.key}-start`}
                        type="time"
                        value={schedule.start}
                        onChange={(e) => handleTimeChange(day.key, "start", e.target.value)}
                        className="w-32"
                      />
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${day.key}-end`} className="text-sm text-muted-foreground">
                        End
                      </Label>
                      <Input
                        id={`${day.key}-end`}
                        type="time"
                        value={schedule.end}
                        onChange={(e) => handleTimeChange(day.key, "end", e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end pt-4 border-t">
            <Button
              type="button"
              onClick={handleSaveSchedule}
              disabled={isSavingSchedule}
            >
              {isSavingSchedule ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Schedule"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Blackout Dates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Block Out Dates</CardTitle>
          <CardDescription>
            Select dates when you're unavailable. You can select a single date or a date range.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <Calendar
                mode="range"
                selected={selectedDateRange}
                onSelect={setSelectedDateRange}
                className="rounded-md border"
              />
            </div>

            <div className="flex flex-col gap-4">
              <Button
                type="button"
                onClick={handleBlockDate}
                disabled={isBlockingDate || !selectedDateRange?.from}
              >
                {isBlockingDate ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Blocking...
                  </>
                ) : (
                  "Block Date"
                )}
              </Button>

              {selectedDateRange?.from && (
                <div className="text-sm text-muted-foreground">
                  <p>
                    Selected: {format(selectedDateRange.from, "MMM d, yyyy")}
                    {selectedDateRange.to &&
                      ` - ${format(selectedDateRange.to, "MMM d, yyyy")}`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* List of Blocked Dates */}
          {unavailableDates.length > 0 && (
            <div className="space-y-2 pt-4 border-t">
              <h4 className="font-medium">Blocked Dates</h4>
              <div className="space-y-2">
                {unavailableDates.map((date) => {
                  const startDate = new Date(date.start_date);
                  const endDate = new Date(date.end_date);
                  const isRange = date.start_date !== date.end_date;

                  return (
                    <div
                      key={date.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <span className="text-sm">
                        {format(startDate, "MMM d, yyyy")}
                        {isRange && ` - ${format(endDate, "MMM d, yyyy")}`}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnblockDate(date.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
