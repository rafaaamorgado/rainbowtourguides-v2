'use client';

import { getBookings, getMessages } from '@/lib/data-service';
import MessageInbox from '@/components/messaging/MessageInbox';

export default function TravelerMessagesPage() {
  const currentUserId = 'u3';

  return (
    <MessageInbox
      userRole="traveler"
      fetchMessages={getMessages}
      fetchBookings={getBookings}
      currentUserId={currentUserId}
    />
  );
}
