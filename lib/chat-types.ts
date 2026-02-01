export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender?: {
    full_name?: string;
    avatar_url: string | null;
  };
}

export interface BookingRead {
  booking_id: string;
  user_id: string;
  last_read_message_id: string | null;
  last_read_at: string;
  created_at: string;
  updated_at: string;
}

export interface BookingChatContext {
  bookingId: string;
  travelerId: string;
  guideId: string;
  currentUserId: string;
  recipientId: string;
  myRead: BookingRead | null;
  recipientRead: BookingRead | null;
}

export interface MessageWithReadStatus extends Message {
  isRead: boolean;
}
