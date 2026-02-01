'use server';

import { createSupabaseServerClient } from './supabase-server';
import type { BookingRead } from './chat-types';

/**
 * Upsert booking_reads for current user.
 * This marks the chat as read up to the specified message.
 */
export async function upsertBookingRead(
  bookingId: string,
  lastMessageId: string | null,
): Promise<{ success: boolean; error?: string; data?: BookingRead }> {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const now = new Date().toISOString();

    // Upsert booking_reads
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('booking_reads')
      .upsert(
        {
          booking_id: bookingId,
          user_id: user.id,
          last_read_message_id: lastMessageId,
          last_read_at: now,
          updated_at: now,
        },
        {
          onConflict: 'booking_id,user_id',
        },
      )
      .select()
      .single();

    if (error) {
      console.error('[upsertBookingRead] Error:', error);
      return { success: false, error: error.message };
    }

    console.log(
      '[upsertBookingRead] Success booking=%s user=%s lastMsgId=%s',
      bookingId,
      user.id,
      lastMessageId,
    );

    return { success: true, data: data as BookingRead };
  } catch (err) {
    console.error('[upsertBookingRead] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Get booking reads for a specific booking (both participants).
 * Used to determine message read status.
 */
export async function getBookingReads(bookingId: string): Promise<{
  success: boolean;
  error?: string;
  data?: { myRead: BookingRead | null; recipientRead: BookingRead | null };
}> {
  try {
    const supabase = await createSupabaseServerClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get booking to determine participant IDs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: booking, error: bookingError } = await (supabase as any)
      .from('bookings')
      .select('traveler_id, guide_id')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return { success: false, error: 'Booking not found' };
    }

    // Determine recipient ID
    const recipientId =
      booking.traveler_id === user.id ? booking.guide_id : booking.traveler_id;

    // Get both reads
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: reads, error: readsError } = await (supabase as any)
      .from('booking_reads')
      .select('*')
      .eq('booking_id', bookingId)
      .in('user_id', [user.id, recipientId]);

    if (readsError) {
      console.error('[getBookingReads] Error:', readsError);
      return { success: false, error: readsError.message };
    }

    const myRead =
      (reads?.find((r: any) => r.user_id === user.id) as BookingRead) || null;
    const recipientRead =
      (reads?.find((r: any) => r.user_id === recipientId) as BookingRead) ||
      null;

    return {
      success: true,
      data: { myRead, recipientRead },
    };
  } catch (err) {
    console.error('[getBookingReads] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Get unread count for a booking from the current user's perspective.
 */
export async function getUnreadCount(
  bookingId: string,
): Promise<{ success: boolean; error?: string; count?: number }> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get my read status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: myRead } = await (supabase as any)
      .from('booking_reads')
      .select('last_read_at')
      .eq('booking_id', bookingId)
      .eq('user_id', user.id)
      .single();

    // Count messages from other users after my last_read_at
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('booking_id', bookingId)
      .neq('sender_id', user.id);

    if (myRead?.last_read_at) {
      query = query.gt('created_at', myRead.last_read_at);
    }

    const { count, error: countError } = await query;

    if (countError) {
      console.error('[getUnreadCount] Error:', countError);
      return { success: false, error: countError.message };
    }

    return { success: true, count: count || 0 };
  } catch (err) {
    console.error('[getUnreadCount] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Get unread counts for multiple bookings at once (for inbox).
 * Returns a map of booking_id -> unread count.
 */
export async function getUnreadCounts(bookingIds: string[]): Promise<{
  success: boolean;
  error?: string;
  data?: Record<string, number>;
}> {
  try {
    if (bookingIds.length === 0) {
      return { success: true, data: {} };
    }

    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get all my reads for these bookings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: myReads, error: readsError } = await (supabase as any)
      .from('booking_reads')
      .select('booking_id, last_read_at')
      .eq('user_id', user.id)
      .in('booking_id', bookingIds);

    if (readsError) {
      console.error('[getUnreadCounts] Error fetching reads:', readsError);
      return { success: false, error: readsError.message };
    }

    // Create map of booking_id -> last_read_at
    const readMap = new Map<string, string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (myReads || []).forEach((read: any) => {
      readMap.set(read.booking_id, read.last_read_at);
    });

    // Get all messages for these bookings
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: messages, error: messagesError } = await (supabase as any)
      .from('messages')
      .select('booking_id, sender_id, created_at')
      .in('booking_id', bookingIds)
      .neq('sender_id', user.id)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error(
        '[getUnreadCounts] Error fetching messages:',
        messagesError,
      );
      return { success: false, error: messagesError.message };
    }

    // Count unread messages per booking
    const unreadCounts: Record<string, number> = {};

    bookingIds.forEach((bookingId) => {
      const lastReadAt = readMap.get(bookingId);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bookingMessages = (messages || []).filter(
        (msg: any) => msg.booking_id === bookingId,
      );

      if (!lastReadAt) {
        // Never read - all messages are unread
        unreadCounts[bookingId] = bookingMessages.length;
      } else {
        // Count messages after last_read_at
        const unreadCount = bookingMessages.filter(
          (msg: any) => msg.created_at > lastReadAt,
        ).length;
        unreadCounts[bookingId] = unreadCount;
      }
    });

    return { success: true, data: unreadCounts };
  } catch (err) {
    console.error('[getUnreadCounts] Exception:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
