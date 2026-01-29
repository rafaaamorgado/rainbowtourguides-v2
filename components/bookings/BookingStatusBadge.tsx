import { Badge } from '@/components/ui/badge';
import { getStatusColor, getStatusLabel } from '@/lib/booking-status';

interface BookingStatusBadgeProps {
  status: string;
  className?: string;
}

export function BookingStatusBadge({
  status,
  className,
}: BookingStatusBadgeProps) {
  return (
    <Badge className={`${getStatusColor(status)} ${className || ''}`}>
      {getStatusLabel(status)}
    </Badge>
  );
}
