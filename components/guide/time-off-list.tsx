'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  DatePicker,
} from '@heroui/react';
import { parseAbsoluteToLocal } from '@internationalized/date';
import { format } from 'date-fns';
import { Umbrella, Plus, X, Stethoscope } from 'lucide-react';
import type { GuideTimeOff } from '@/lib/guide-time-off';
import {
  createTimeOffAction,
  deleteTimeOffAction,
} from '@/app/guide/availability/time-off-actions';

interface TimeOffListProps {
  items: Array<GuideTimeOff>;
}

const iconFor = (kind?: 'vacation' | 'medical') => {
  switch (kind) {
    case 'medical':
      return <Stethoscope className="h-5 w-5 text-primary" />;
    default:
      return <Umbrella className="h-5 w-5 text-primary" />;
  }
};

export function TimeOffList({ items }: TimeOffListProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    title: '',
    start: '',
    end: '',
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const isoToDateValue = (iso: string | null | undefined) =>
    (iso ? parseAbsoluteToLocal(iso) : undefined) as unknown as any;

  const dateValueToIso = (val: any) => {
    if (!val) return '';
    if (typeof val.toAbsoluteString === 'function') {
      return val.toAbsoluteString();
    }
    if (typeof val.toDate === 'function') {
      return val.toDate().toISOString();
    }
    return '';
  };

  const formattedItems = useMemo(
    () =>
      items.map((item, idx) => {
        const startLabel = format(
          new Date(item.starts_at),
          'MMM d, yyyy, h:mm a',
        );
        const endLabel = format(new Date(item.ends_at), 'MMM d, yyyy, h:mm a');
        return {
          ...item,
          displayTitle: item.title || `Time off ${idx + 1}`,
          displayRange: `${startLabel} - ${endLabel}`,
        };
      }),
    [items],
  );

  return (
    <Card className="rounded-lg border bg-card">
      <CardHeader className="flex items-center justify-between px-4 py-3">
        <div className="text-sm font-semibold tracking-wide text-muted-foreground">
          TIME OFF & BLACKOUTS
        </div>
        <Button
          variant="light"
          size="sm"
          startContent={<Plus className="h-4 w-4" />}
          onPress={() => setIsOpen(true)}
        >
          Add Date
        </Button>
      </CardHeader>
      <Divider />
      <CardBody className="space-y-3">
        {formattedItems.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No blackout periods yet. Click “Add Date” to create one.
          </div>
        ) : (
          formattedItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-muted/40 px-4 py-3"
            >
              <div className="flex-1">
                <div className="font-semibold">{item.displayTitle}</div>
                <div className="text-sm text-muted-foreground">
                  {item.displayRange}
                </div>
              </div>
              <Button
                isIconOnly
                variant="light"
                radius="full"
                size="sm"
                aria-label="Remove blackout"
                onPress={() =>
                  startTransition(async () => {
                    await deleteTimeOffAction(item.id);
                    router.refresh();
                  })
                }
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardBody>

      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="center"
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Add time off / blackout
              </ModalHeader>
              <ModalBody className="space-y-4">
                {error && <div className="text-sm text-danger">{error}</div>}
                <Input
                  label="Title"
                  placeholder="e.g. Summer Vacation"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                />
                <DatePicker
                  label="Start"
                  granularity="minute"
                  hourCycle={24}
                  variant="bordered"
                  description="Select date and time you are unavailable from"
                  value={isoToDateValue(form.start)}
                  onChange={(val) =>
                    setForm((f) => ({
                      ...f,
                      start: dateValueToIso(val),
                    }))
                  }
                />
                <DatePicker
                  label="End"
                  granularity="minute"
                  hourCycle={24}
                  variant="bordered"
                  description="Select date and time you are unavailable until"
                  value={isoToDateValue(form.end)}
                  onChange={(val) =>
                    setForm((f) => ({
                      ...f,
                      end: dateValueToIso(val),
                    }))
                  }
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="primary"
                  isLoading={isPending}
                  onPress={() => {
                    setError(null);
                    if (!form.start || !form.end) {
                      setError('Start and end are required');
                      return;
                    }
                    if (new Date(form.start) >= new Date(form.end)) {
                      setError('End must be after start');
                      return;
                    }
                    startTransition(async () => {
                      const res = await createTimeOffAction({
                        title: form.title || 'Time off',
                        starts_at: form.start,
                        ends_at: form.end,
                      });
                      if (!res.success) {
                        setError(res.error || 'Failed to save');
                        return;
                      }
                      setForm({ title: '', start: '', end: '' });
                      router.refresh();
                      onClose();
                    });
                  }}
                >
                  Save
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </Card>
  );
}
