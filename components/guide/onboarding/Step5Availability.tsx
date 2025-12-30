"use client";

import { Calendar, Clock, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export type Step5Data = {
  availableDays: string[];
  startTime: string;
  endTime: string;
};

type Step5AvailabilityProps = {
  data: Step5Data;
  onChange: (data: Partial<Step5Data>) => void;
};

const DAYS_OF_WEEK = [
  { value: "monday", label: "Mon", fullLabel: "Monday" },
  { value: "tuesday", label: "Tue", fullLabel: "Tuesday" },
  { value: "wednesday", label: "Wed", fullLabel: "Wednesday" },
  { value: "thursday", label: "Thu", fullLabel: "Thursday" },
  { value: "friday", label: "Fri", fullLabel: "Friday" },
  { value: "saturday", label: "Sat", fullLabel: "Saturday" },
  { value: "sunday", label: "Sun", fullLabel: "Sunday" },
];

export function Step5Availability({ data, onChange }: Step5AvailabilityProps) {
  const toggleDay = (day: string) => {
    const newDays = data.availableDays.includes(day)
      ? data.availableDays.filter((d) => d !== day)
      : [...data.availableDays, day];
    onChange({ availableDays: newDays });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-3xl font-serif">Availability</CardTitle>
        <CardDescription>
          Set your general availability. You&apos;ll be able to manage specific dates and times through your dashboard later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Days of Week */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-brand" />
            <label className="text-sm font-medium text-slate-700">
              Available Days <span className="text-destructive">*</span>
            </label>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = data.availableDays.includes(day.value);

              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleDay(day.value)}
                  className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? "bg-brand border-brand text-white shadow-lg"
                      : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1 right-1">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                  <span className="text-xs font-bold">{day.label}</span>
                </button>
              );
            })}
          </div>

          {data.availableDays.length > 0 && (
            <p className="text-sm text-slate-600 mt-2">
              Selected: {data.availableDays.map((d) => {
                const day = DAYS_OF_WEEK.find((day) => day.value === d);
                return day?.fullLabel;
              }).join(", ")}
            </p>
          )}
        </div>

        {/* Time Range */}
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-brand" />
            <label className="text-sm font-medium text-slate-700">
              Typical Hours <span className="text-destructive">*</span>
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startTime" className="text-sm font-medium text-slate-700">
                Start Time
              </label>
              <Input
                id="startTime"
                type="time"
                value={data.startTime}
                onChange={(e) => onChange({ startTime: e.target.value })}
                required
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="endTime" className="text-sm font-medium text-slate-700">
                End Time
              </label>
              <Input
                id="endTime"
                type="time"
                value={data.endTime}
                onChange={(e) => onChange({ endTime: e.target.value })}
                required
                className="text-base"
              />
            </div>
          </div>

          {data.startTime && data.endTime && (
            <p className="text-sm text-slate-600 mt-2">
              You&apos;re typically available from <span className="font-semibold">{data.startTime}</span> to <span className="font-semibold">{data.endTime}</span>
            </p>
          )}
        </div>

        {/* Info Box */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-sm text-slate-700 leading-relaxed">
            <span className="font-semibold">Note:</span> This is your general availability. Once approved, you&apos;ll be able to set specific available time slots, block dates, and manage bookings through your dashboard.
          </p>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={() => onChange({ availableDays: DAYS_OF_WEEK.map((d) => d.value) })}
            className="px-4 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg hover:border-brand transition-colors"
          >
            Select All Days
          </button>
          <button
            type="button"
            onClick={() => onChange({ availableDays: DAYS_OF_WEEK.filter((d) => !["saturday", "sunday"].includes(d.value)).map((d) => d.value) })}
            className="px-4 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg hover:border-brand transition-colors"
          >
            Weekdays Only
          </button>
          <button
            type="button"
            onClick={() => onChange({ availableDays: ["saturday", "sunday"] })}
            className="px-4 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg hover:border-brand transition-colors"
          >
            Weekends Only
          </button>
          <button
            type="button"
            onClick={() => onChange({ availableDays: [] })}
            className="px-4 py-2 text-sm bg-white border-2 border-slate-200 rounded-lg hover:border-slate-300 transition-colors text-slate-600"
          >
            Clear
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
