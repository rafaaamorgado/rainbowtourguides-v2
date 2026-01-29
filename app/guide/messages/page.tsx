import MessageInbox from '@/components/messaging/MessageInbox';
import { getBookings, getMessages } from '@/lib/data-service';
import { requireRole } from '@/lib/auth-helpers';

export default async function GuideMessagesPage() {
  const { user } = await requireRole('guide');

  return (
    <MessageInbox
      userRole="guide"
      fetchMessages={getMessages}
      fetchBookings={getBookings}
      currentUserId={user.id}
    />
  );
}
