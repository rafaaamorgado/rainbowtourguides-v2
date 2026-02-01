import { useEffect, useState, useCallback, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import type { Message } from '@/lib/chat-types';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js';

export type RealtimeStatus =
  | 'idle'
  | 'subscribing'
  | 'subscribed'
  | 'error'
  | 'closed';

interface UseBookingMessagesRealtimeParams {
  bookingId: string | undefined;
  initialMessages?: Message[];
  currentUserId?: string;
}

interface UseBookingMessagesRealtimeReturn {
  messages: Message[];
  status: RealtimeStatus;
  error: string | null;
  lastEventAt: Date | null;
  addOptimisticMessage: (message: Message) => void;
}

/**
 * Reliable realtime hook for booking messages.
 *
 * Handles:
 * - Race-free subscription setup (subscribe BEFORE fetch)
 * - Automatic deduplication by message.id
 * - Sorting by created_at ascending
 * - Proper cleanup on unmount/bookingId change
 * - Comprehensive debug logging
 * - Health monitoring (status, last event time)
 */
export function useBookingMessagesRealtime({
  bookingId,
  initialMessages = [],
  currentUserId,
}: UseBookingMessagesRealtimeParams): UseBookingMessagesRealtimeReturn {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [status, setStatus] = useState<RealtimeStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastEventAt, setLastEventAt] = useState<Date | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);
  const supabase = createSupabaseBrowserClient();

  // Validate bookingId is a UUID
  const isValidBookingId = useCallback(
    (id: string | undefined): id is string => {
      if (!id) return false;
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuidRegex.test(id);
    },
    [],
  );

  // Deduplicate and sort messages
  const normalizeMessages = useCallback((msgs: Message[]): Message[] => {
    const uniqueMap = new Map<string, Message>();
    msgs.forEach((msg) => uniqueMap.set(msg.id, msg));
    const uniqueMessages = Array.from(uniqueMap.values());
    // Sort by created_at ascending (oldest first)
    return uniqueMessages.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }, []);

  // Add optimistic message (e.g., after sending)
  const addOptimisticMessage = useCallback(
    (message: Message) => {
      setMessages((prev) => normalizeMessages([...prev, message]));
    },
    [normalizeMessages],
  );

  useEffect(() => {
    // Reset state when bookingId changes - CLEAR MESSAGES IMMEDIATELY
    setMessages([]);
    setLastEventAt(null);

    // Reset state when bookingId changes
    if (!isValidBookingId(bookingId)) {
      if (bookingId) {
        console.warn('[RT] Invalid bookingId:', bookingId);
        setError('Invalid booking ID');
        setStatus('error');
      }
      return;
    }

    if (!supabase) {
      console.error('[RT] Supabase client not configured');
      setError('Supabase client not configured');
      setStatus('error');
      return;
    }

    // Clear previous error
    setError(null);
    setStatus('subscribing');

    const channelName = `booking:${bookingId}:messages`;

    console.log('[RT] subscribing booking=%s', bookingId);

    // Step 1: Create channel and subscribe FIRST (to not miss events during fetch)
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        async (
          payload: RealtimePostgresChangesPayload<{
            id: string;
            booking_id: string;
            sender_id: string;
            body: string;
            created_at: string;
          }>,
        ) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newMsg = payload.new as any;
          const messageId = newMsg.id;
          const senderId = newMsg.sender_id;

          console.log(
            '[RT] received INSERT id=%s booking=%s sender=%s time=%s',
            messageId,
            bookingId,
            senderId,
            new Date().toISOString(),
          );

          setLastEventAt(new Date());

          // Build message from payload
          const newMessage: Message = {
            id: messageId,
            booking_id: newMsg.booking_id,
            sender_id: senderId,
            body: newMsg.body,
            created_at: newMsg.created_at,
          };

          // Fetch sender profile asynchronously (non-blocking)
          // This happens in parallel with state update
          void supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', senderId)
            .single()
            .then(
              ({
                data: sender,
                error: profileError,
              }: {
                data: { full_name: string; avatar_url: string | null } | null;
                error: unknown;
              }) => {
                if (profileError) {
                  console.warn(
                    '[RT] Failed to fetch sender profile:',
                    profileError,
                  );
                  return;
                }

                if (sender) {
                  newMessage.sender = {
                    full_name: sender.full_name,
                    avatar_url: sender.avatar_url,
                  };

                  // Update the message with sender info
                  setMessages((prev) => {
                    const updated = prev.map((m) =>
                      m.id === messageId
                        ? { ...m, sender: newMessage.sender }
                        : m,
                    );
                    return normalizeMessages(updated);
                  });
                }
              },
            );

          // Add message to state immediately (dedup + sort handled)
          setMessages((prev) => {
            // Check for duplicate
            if (prev.some((m) => m.id === messageId)) {
              console.log('[RT] duplicate detected id=%s, skipping', messageId);
              return prev;
            }

            console.log('[RT] adding message id=%s to state', messageId);
            return normalizeMessages([...prev, newMessage]);
          });
        },
      )
      .subscribe((subscriptionStatus: string) => {
        console.log(
          '[RT] subscription status=%s booking=%s time=%s',
          subscriptionStatus,
          bookingId,
          new Date().toISOString(),
        );

        if (subscriptionStatus === 'SUBSCRIBED') {
          setStatus('subscribed');
          console.log('[RT] ✅ subscribed booking=%s', bookingId);
        } else if (subscriptionStatus === 'CHANNEL_ERROR') {
          setStatus('error');
          setError('Channel error - check RLS policies or network');
          console.error(
            '[RT] ❌ channel error booking=%s (RLS or network issue)',
            bookingId,
          );
        } else if (subscriptionStatus === 'TIMED_OUT') {
          setStatus('error');
          setError('Subscription timed out');
          console.error('[RT] ❌ timeout booking=%s', bookingId);
        } else if (subscriptionStatus === 'CLOSED') {
          setStatus('closed');
          console.log('[RT] 🔌 closed booking=%s', bookingId);
        }
      });

    channelRef.current = channel;

    // Step 2: Fetch initial messages AFTER subscription is set up
    // This ensures we don't miss messages that arrive during the fetch
    const fetchInitialMessages = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('messages')
          .select(
            `
            id,
            booking_id,
            sender_id,
            body,
            created_at,
            sender:profiles!messages_sender_id_fkey(full_name, avatar_url)
          `,
          )
          .eq('booking_id', bookingId)
          .order('created_at', { ascending: true });

        if (fetchError) {
          console.error('[RT] Failed to fetch initial messages:', fetchError);
          setError(`Failed to load messages: ${fetchError.message}`);
          return;
        }

        const fetchedMessages: Message[] = (data || []).map((row: any) => ({
          id: row.id,
          booking_id: row.booking_id,
          sender_id: row.sender_id,
          body: row.body,
          created_at: row.created_at,
          sender: row.sender
            ? {
                full_name: row.sender.full_name,
                avatar_url: row.sender.avatar_url,
              }
            : undefined,
        }));

        console.log(
          '[RT] fetched %d initial messages booking=%s',
          fetchedMessages.length,
          bookingId,
        );

        // Merge with any realtime messages that arrived during fetch
        setMessages((prev) => {
          const merged = [...prev, ...fetchedMessages];
          return normalizeMessages(merged);
        });
      } catch (err) {
        console.error('[RT] Exception fetching initial messages:', err);
        setError('Failed to load messages');
      }
    };

    fetchInitialMessages();

    // Cleanup function
    return () => {
      console.log('[RT] cleanup booking=%s', bookingId);

      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      setStatus('idle');
    };
  }, [bookingId, supabase, isValidBookingId, normalizeMessages]);

  return {
    messages,
    status,
    error,
    lastEventAt,
    addOptimisticMessage,
  };
}
