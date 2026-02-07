'use client';

import { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal, ModalBody, ModalContent, ModalFooter } from '@heroui/react';
import { TimeInput } from '@/components/ui/time-input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

type DayKey = (typeof DAYS_OF_WEEK)[number]['key'];

interface DaySchedule {
  active: boolean;
  start: string;
  end: string;
}

interface AvailabilityFormProps {
  initialAvailabilityPattern: Record<string, DaySchedule> | null;
  initialUnavailableDates: Array<{
    id: string;
    start_date: string;
    end_date: string;
  }>;
  onSaveSchedule: (
    pattern: Record<string, DaySchedule>,
  ) => Promise<{ success: boolean; error?: string }>;
  onBlockDate: (
    startDate: string,
    endDate: string,
  ) => Promise<{ success: boolean; error?: string; id?: string }>;
  onUnblockDate: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export function AvailabilityForm({
  initialAvailabilityPattern,
  // Keeping props for compatibility but not used since blackout UI removed
  initialUnavailableDates: _initialUnavailableDates,
  onSaveSchedule,
  onBlockDate: _onBlockDate,
  onUnblockDate: _onUnblockDate,
}: AvailabilityFormProps) {
  // Initialize weekly schedule
  const defaultSchedule: Record<string, DaySchedule> = DAYS_OF_WEEK.reduce(
    (acc, day) => {
      acc[day.key] = { active: false, start: '09:00', end: '17:00' };
      return acc;
    },
    {} as Record<string, DaySchedule>,
  );

  // Merge any provided pattern with defaults so every day always has a schedule shape
  const [weeklySchedule, setWeeklySchedule] = useState<
    Record<string, DaySchedule>
  >(() => {
    const provided = initialAvailabilityPattern || {};
    return DAYS_OF_WEEK.reduce(
      (acc, day) => {
        const existing = provided[day.key];
        acc[day.key] = existing
          ? {
              active: !!existing.active,
              start: existing.start ?? '09:00',
              end: existing.end ?? '17:00',
            }
          : { ...defaultSchedule[day.key] };
        return acc;
      },
      {} as Record<string, DaySchedule>,
    );
  });

  const baselineRef = useRef<string>(JSON.stringify(weeklySchedule));
  const isDirty = useMemo(
    () => JSON.stringify(weeklySchedule) !== baselineRef.current,
    [weeklySchedule],
  );

  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
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

  const handleTimeChange = (
    dayKey: DayKey,
    field: 'start' | 'end',
    value: string,
  ) => {
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
        baselineRef.current = JSON.stringify(weeklySchedule);
      } else {
        setError(result.error || 'Failed to save schedule');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred',
      );
    } finally {
      setIsSavingSchedule(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <Modal isOpen={success} onOpenChange={setSuccess} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="py-6 text-center">
                <div className="text-lg font-semibold">
                  Schedule saved successfully!
                </div>
              </ModalBody>
              <ModalFooter className="justify-center">
                <Button type="button" onClick={onClose}>
                  OK
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Weekly Schedule Section */}
      <Card className="w-[320px] p-2" shadow="sm" radius="lg">
        <CardHeader className="flex-col items-start">
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>
            Set your regular working hours for each day of the week.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map((day) => {
            const schedule = weeklySchedule[day.key];
            return (
              <div key={day.key} className="flex h-8 w-full">
                <div className="flex items-center gap-3 flex-1 flex-grow">
                  <Switch
                    size="sm"
                    checked={schedule.active}
                    onCheckedChange={() => handleDayToggle(day.key)}
                  />
                  <Label className="font-medium">{day.label}</Label>
                </div>

                {schedule.active && (
                  <div className="flex  gap-2 ml-auto">
                    <div className="flex items-center w-16">
                      <TimeInput
                        size="sm"
                        id={`${day.key}-start`}
                        value={schedule.start}
                        onChange={(value) =>
                          handleTimeChange(day.key, 'start', value)
                        }
                      />
                    </div>
                    <span className="text-muted-foreground">-</span>
                    <div className="flex items-center w-16">
                      <TimeInput
                        size="sm"
                        id={`${day.key}-end`}
                        value={schedule.end}
                        onChange={(value) =>
                          handleTimeChange(day.key, 'end', value)
                        }
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
              disabled={isSavingSchedule || !isDirty}
              variant="solid"
              color="primary"
              isLoading={isSavingSchedule}
            >
              {isSavingSchedule ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Schedule'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
