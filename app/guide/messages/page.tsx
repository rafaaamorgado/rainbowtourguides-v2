import MessageInbox from '@/components/messaging/MessageInbox';
import { getBookings, getMessages } from '@/lib/data-service';
import { requireRole } from '@/lib/auth-helpers';

export default async function GuideMessagesPage() {
  await requireRole('guide');
  const currentUserId = 'u3'; // Replace with actual user ID logic

  return (
    <MessageInbox
      userRole="guide"
      fetchMessages={getMessages}
      fetchBookings={getBookings}
      currentUserId={currentUserId}
    />
  );
}
