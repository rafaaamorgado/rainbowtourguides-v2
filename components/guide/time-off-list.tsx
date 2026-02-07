"use client";

import { useMemo, useState } from "react";
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
} from "@heroui/react";
import { format } from "date-fns";
import { Umbrella, Plus, X, Stethoscope } from "lucide-react";
import type { UnavailableDate } from "@/lib/guide-availability";

interface TimeOffListProps {
  items: Array<UnavailableDate & { title?: string; icon?: "vacation" | "medical" }>;
}

const iconFor = (kind?: "vacation" | "medical") => {
  switch (kind) {
    case "medical":
      return <Stethoscope className="h-5 w-5 text-primary" />;
    default:
      return <Umbrella className="h-5 w-5 text-primary" />;
  }
};

export function TimeOffList({ items }: TimeOffListProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formattedItems = useMemo(
    () =>
      items.map((item, idx) => {
        const startLabel = format(new Date(item.start_date), "MMM d, yyyy");
        const endLabel = format(new Date(item.end_date), "MMM d, yyyy");
        return {
          ...item,
          displayTitle: item.title || `Blocked ${idx + 1}`,
          displayRange:
            item.start_date === item.end_date
              ? startLabel
              : `${startLabel} - ${endLabel}`,
        };
      }),
    [items]
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {iconFor(item.icon)}
              </div>
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
                <Input label="Title" placeholder="e.g. Summer Vacation" />
                <DatePicker
                  label="Start"
                  granularity="minute"
                  hourCycle={24}
                  variant="bordered"
                  description="Select date and time you are unavailable from"
                />
                <DatePicker
                  label="End"
                  granularity="minute"
                  hourCycle={24}
                  variant="bordered"
                  description="Select date and time you are unavailable until"
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
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
