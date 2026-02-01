import { useEffect, useState, useCallback, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { BookingRead } from '@/lib/chat-types';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';

interface UseBookingReadsParams {
  bookingId: string | undefined;
  currentUserId: string | undefined;
  recipientId: string | undefined;
}

interface UseBookingReadsReturn {
  myRead: BookingRead | null;
  recipientRead: BookingRead | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing booking reads with realtime updates.
 * Subscribes to changes in booking_reads for both participants.
 */
export function useBookingReads({
  bookingId,
  currentUserId,
  recipientId,
}: UseBookingReadsParams): UseBookingReadsReturn {
  const [myRead, setMyRead] = useState<BookingRead | null>(null);
  const [recipientRead, setRecipientRead] = useState<BookingRead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createSupabaseBrowserClient();

  const fetchReads = useCallback(async () => {
    if (!bookingId || !currentUserId || !recipientId || !supabase) {
      setIsLoading(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: reads, error: fetchError } = await (supabase as any)
        .from('booking_reads')
        .select('*')
        .eq('booking_id', bookingId)
        .in('user_id', [currentUserId, recipientId]);

      if (fetchError) {
        console.error('[useBookingReads] Fetch error:', fetchError);
        setError(fetchError.message);
        return;
      }

      const myReadData =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (reads?.find((r: any) => r.user_id === currentUserId) as BookingRead) ||
        null;
      const recipientReadData =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (reads?.find((r: any) => r.user_id === recipientId) as BookingRead) ||
        null;

      setMyRead(myReadData);
      setRecipientRead(recipientReadData);
      setError(null);

      console.log(
        '[useBookingReads] Fetched reads booking=%s myRead=%s recipientRead=%s',
        bookingId,
        myReadData?.last_read_at || 'none',
        recipientReadData?.last_read_at || 'none',
      );
    } catch (err) {
      console.error('[useBookingReads] Exception:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, currentUserId, recipientId, supabase]);

  useEffect(() => {
    if (!bookingId || !currentUserId || !recipientId || !supabase) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Fetch initial reads
    fetchReads();

    // Subscribe to realtime changes
    const channelName = `booking:${bookingId}:reads`;

    console.log('[useBookingReads] Subscribing booking=%s', bookingId);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'booking_reads',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newRecord = payload.new as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const oldRecord = payload.old as any;

          console.log(
            '[useBookingReads] Realtime event=%s user=%s time=%s',
            payload.eventType,
            newRecord?.user_id || oldRecord?.user_id,
            new Date().toISOString(),
          );

          if (
            payload.eventType === 'INSERT' ||
            payload.eventType === 'UPDATE'
          ) {
            const updatedRead = newRecord as BookingRead;

            if (updatedRead.user_id === currentUserId) {
              setMyRead(updatedRead);
              console.log('[useBookingReads] Updated myRead:', updatedRead);
            } else if (updatedRead.user_id === recipientId) {
              setRecipientRead(updatedRead);
              console.log(
                '[useBookingReads] Updated recipientRead:',
                updatedRead,
              );
            }
          } else if (payload.eventType === 'DELETE') {
            const deletedUserId = oldRecord?.user_id;

            if (deletedUserId === currentUserId) {
              setMyRead(null);
            } else if (deletedUserId === recipientId) {
              setRecipientRead(null);
            }
          }
        },
      )
      .subscribe((status: string) => {
        console.log(
          '[useBookingReads] Subscription status=%s booking=%s',
          status,
          bookingId,
        );

        if (status === 'CHANNEL_ERROR') {
          setError('Failed to subscribe to read status updates');
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('[useBookingReads] Cleanup booking=%s', bookingId);

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [bookingId, currentUserId, recipientId, supabase, fetchReads]);

  return {
    myRead,
    recipientRead,
    isLoading,
    error,
    refetch: fetchReads,
  };
}
