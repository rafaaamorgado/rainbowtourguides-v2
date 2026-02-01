'use server';

/**
 * Chat API Module - Server-side functions for real-time chat functionality
 *
 * This module provides the canonical API for chat operations between travelers and guides.
 * All chat operations are based on booking_id and enforce RLS policies.
 */

import { createSupabaseServerClient } from './supabase-server';
import { adaptMessageFromDB } from './adapters';
import type { Message } from './mock-data';
import type { Database } from '@/types/database';

type BookingRow = Database['public']['Tables']['bookings']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

/**
 * Booking context needed for chat UI
 * Contains booking details and participant profiles
 */
export interface BookingChatContext {
  bookingId: string;
  status: string;
  travelerId: string;
  guideId: string;
  travelerProfile: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  guideProfile: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  cityName: string;
  startAt: string;
  durationHours: number;
}

/**
 * Result type for chat operations
 */
export interface ChatOperationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Get all messages for a booking, ordered by creation time ascending
 *
 * @param bookingId - UUID of the booking
 * @param limit - Maximum number of messages to fetch (default: 50)
 * @returns Array of messages or empty array if error/no messages
 */
export async function getChatMessages(
  bookingId: string,
  limit: number = 50,
): Promise<Message[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: messages, error } = await supabase
      .from('messages')
      .select(
        `
        id,
        booking_id,
        sender_id,
        body,
        created_at,
        sender:profiles!messages_sender_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `,
      )
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('[getChatMessages] Error fetching messages:', error);
      return [];
    }

    if (!messages || messages.length === 0) {
      return [];
    }

    return messages.map((msg: any) =>
      adaptMessageFromDB(
        {
          id: msg.id,
          booking_id: msg.booking_id,
          sender_id: msg.sender_id,
          body: msg.body,
          created_at: msg.created_at,
        },
        msg.sender as ProfileRow | null,
      ),
    );
  } catch (error) {
    console.error('[getChatMessages] Unexpected error:', error);
    return [];
  }
}

/**
 * Send a new chat message
 *
 * RLS policy will enforce:
 * - User must be sender_id
 * - User must be participant (traveler or guide)
 * - Booking status must be: accepted, awaiting_payment, confirmed, or completed
 *
 * @param bookingId - UUID of the booking
 * @param senderId - UUID of the current user (must match auth.uid())
 * @param body - Message content
 * @returns Result with success status and optional error message
 */
export async function sendChatMessage(
  bookingId: string,
  senderId: string,
  body: string,
): Promise<ChatOperationResult<Message>> {
  try {
    if (!body.trim()) {
      return {
        success: false,
        error: 'Message cannot be empty',
      };
    }

    const supabase = await createSupabaseServerClient();

    const { data: message, error } = await (supabase.from('messages') as any)
      .insert({
        booking_id: bookingId,
        sender_id: senderId,
        body: body.trim(),
      })
      .select(
        `
        id,
        booking_id,
        sender_id,
        body,
        created_at,
        sender:profiles!messages_sender_id_fkey(
          id,
          full_name,
          avatar_url
        )
      `,
      )
      .single();

    if (error) {
      console.error('[sendChatMessage] Error sending message:', error);

      // Check for RLS policy violation (chat not available yet)
      if (error.code === '42501' || error.message?.includes('policy')) {
        return {
          success: false,
          error: 'Chat is not available until booking is accepted.',
        };
      }

      return {
        success: false,
        error: error.message || 'Failed to send message',
      };
    }

    if (!message) {
      return {
        success: false,
        error: 'Failed to send message',
      };
    }

    const adaptedMessage = adaptMessageFromDB(
      {
        id: message.id,
        booking_id: message.booking_id,
        sender_id: message.sender_id,
        body: message.body,
        created_at: message.created_at,
      },
      (message as any).sender as ProfileRow | null,
    );

    return {
      success: true,
      data: adaptedMessage,
    };
  } catch (error) {
    console.error('[sendChatMessage] Unexpected error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Get booking context for chat UI
 *
 * Fetches booking details and profiles of both participants.
 * Used to display chat header and enforce UI-level access control.
 *
 * @param bookingId - UUID of the booking
 * @returns Booking context or null if not found/error
 */
export async function getBookingChatContext(
  bookingId: string,
): Promise<BookingChatContext | null> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(
        `
        id,
        status,
        traveler_id,
        guide_id,
        start_at,
        duration_hours,
        city:cities!bookings_city_id_fkey(
          name
        ),
        traveler:profiles!bookings_traveler_id_fkey(
          id,
          full_name,
          avatar_url
        ),
        guide:guides!bookings_guide_id_fkey(
          id,
          profile:profiles!guides_id_fkey(
            id,
            full_name,
            avatar_url
          )
        )
      `,
      )
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      console.error(
        '[getBookingChatContext] Error fetching booking:',
        bookingError,
      );
      return null;
    }

    const bookingData = booking as any;
    const guideProfile = bookingData.guide?.profile;

    return {
      bookingId: bookingData.id,
      status: bookingData.status,
      travelerId: bookingData.traveler_id,
      guideId: bookingData.guide_id,
      travelerProfile: {
        id: bookingData.traveler?.id || bookingData.traveler_id,
        name: bookingData.traveler?.full_name || 'Traveler',
        avatarUrl: bookingData.traveler?.avatar_url || null,
      },
      guideProfile: {
        id: guideProfile?.id || bookingData.guide_id,
        name: guideProfile?.full_name || 'Guide',
        avatarUrl: guideProfile?.avatar_url || null,
      },
      cityName: bookingData.city?.name || 'Unknown City',
      startAt: bookingData.start_at,
      durationHours: bookingData.duration_hours,
    };
  } catch (error) {
    console.error('[getBookingChatContext] Unexpected error:', error);
    return null;
  }
}

/**
 * Check if current user has access to this booking's chat
 *
 * @param bookingId - UUID of the booking
 * @param userId - UUID of the current user
 * @returns true if user is traveler or guide of this booking
 */
export async function canAccessChat(
  bookingId: string,
  userId: string,
): Promise<boolean> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('traveler_id, guide_id')
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      return false;
    }

    const bookingData = booking as BookingRow;
    return (
      bookingData.traveler_id === userId || bookingData.guide_id === userId
    );
  } catch (error) {
    console.error('[canAccessChat] Unexpected error:', error);
    return false;
  }
}
