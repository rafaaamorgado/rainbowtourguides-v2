import { AvailabilityForm } from '@/components/guide/availability-form';
import { GuideAvailabilityCalendar } from '@/components/guide/availability-calendar';
import { TimeOffList } from '@/components/guide/time-off-list';
import { getGuideAvailability } from '@/lib/guide-availability';
import {
  saveAvailabilityPattern,
  blockUnavailableDate,
  unblockUnavailableDate,
} from './actions';

export default async function GuideAvailabilityPage() {
  const { availabilityPattern, unavailableDates, timeOff } =
    await getGuideAvailability();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Availability</h2>
        <p className="text-muted-foreground">
          Manage your weekly schedule and block out specific dates.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[6fr_1fr] h-auto">
        <GuideAvailabilityCalendar
          availabilityPattern={availabilityPattern}
          unavailableDates={unavailableDates}
          timeOff={timeOff}
        />

        <div className="space-y-4">
          <AvailabilityForm
            initialAvailabilityPattern={availabilityPattern}
            initialUnavailableDates={unavailableDates}
            onSaveSchedule={saveAvailabilityPattern}
            onBlockDate={blockUnavailableDate}
            onUnblockDate={unblockUnavailableDate}
          />
          <TimeOffList items={timeOff} />
        </div>
      </div>
    </div>
  );
}
