import { getBookings, getMessages } from '@/lib/data-service';
import MessageInbox from '@/components/messaging/MessageInbox';
import { requireRole } from '@/lib/auth-helpers';

export default async function TravelerMessagesPage() {
  const { user } = await requireRole('traveler');

  return (
    <MessageInbox
      userRole="traveler"
      fetchMessages={getMessages}
      fetchBookings={getBookings}
      currentUserId={user.id}
    />
  );
}
