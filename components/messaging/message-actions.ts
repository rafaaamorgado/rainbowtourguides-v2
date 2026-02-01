'use server';

/**
 * Server Actions for messaging functionality
 * These are called from client components to perform server-side operations
 */

import { sendChatMessage } from '@/lib/chat-api';

interface SendMessageResult {
  success: boolean;
  error?: string;
}

/**
 * Server Action: Send a chat message
 *
 * @param bookingId - UUID of the booking
 * @param senderId - UUID of the current user
 * @param body - Message content
 * @returns Result with success status and optional error
 */
export async function sendMessageAction(
  bookingId: string,
  senderId: string,
  body: string,
): Promise<SendMessageResult> {
  const result = await sendChatMessage(bookingId, senderId, body);

  return {
    success: result.success,
    error: result.error,
  };
}
