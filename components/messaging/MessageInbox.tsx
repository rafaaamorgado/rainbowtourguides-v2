'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Send, ArrowLeft, Lock, Check, CheckCheck } from 'lucide-react';
import {
  Avatar,
  Button,
  Input,
  Chip,
  Spinner,
  ScrollShadow,
  Tooltip,
  Skeleton,
} from '@heroui/react';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { isMessagingEnabled } from '@/lib/messaging-rules';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { formatDistanceToNow } from 'date-fns';
import { useBookingMessagesRealtime } from '@/lib/hooks/useBookingMessagesRealtime';
import { useBookingReads } from '@/lib/hooks/useBookingReads';
import { useMessageScroll } from '@/lib/hooks/useMessageScroll';
import { RealtimeHealthCheck } from './RealtimeHealthCheck';
import { upsertBookingRead, getUnreadCounts } from '@/lib/chat-actions';

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  timestamp: string;
}

interface Booking {
  id: string;
  guide_id: string;
  traveler_id: string;
  guide_name: string;
  traveler_name?: string;
  city_name: string;
  status: string;
  guide_avatar?: string | null;
  traveler_avatar?: string | null;
}

interface MessageInboxProps {
  userRole: 'guide' | 'traveler';
  fetchMessages: (bookingId: string) => Promise<Message[]>;
  fetchBookings: (
    userId: string,
    role: 'guide' | 'traveler',
  ) => Promise<Booking[]>;
  currentUserId: string;
}

export default function MessageInbox({
  userRole,
  fetchMessages,
  fetchBookings,
  currentUserId,
}: MessageInboxProps) {
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isMobileConversationOpen, setIsMobileConversationOpen] =
    useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Track last messages and unread counts (DB-backed)
  const [lastMessages, setLastMessages] = useState<
    Record<string, { text: string; timestamp: string; senderId: string }>
  >({});
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  // Use the reliable realtime hook for selected booking
  const {
    messages: realtimeMessages,
    status: realtimeStatus,
    error: realtimeError,
    lastEventAt,
    addOptimisticMessage,
  } = useBookingMessagesRealtime({
    bookingId: selectedBooking?.id,
    currentUserId,
  });

  // Determine recipient ID for selected booking
  const recipientId = useMemo(() => {
    if (!selectedBooking) return undefined;
    return userRole === 'traveler'
      ? selectedBooking.guide_id
      : selectedBooking.traveler_id;
  }, [selectedBooking, userRole]);

  // Use booking reads hook for read status
  const { recipientRead } = useBookingReads({
    bookingId: selectedBooking?.id,
    currentUserId,
    recipientId,
  });

  // Convert realtime messages to the format expected by this component
  // Memoize to prevent infinite loop in useEffect that depends on messages
  const messages: Message[] = useMemo(() => {
    return realtimeMessages.map((msg) => ({
      id: msg.id,
      booking_id: msg.booking_id,
      sender_id: msg.sender_id,
      sender_name: msg.sender?.full_name || 'Unknown',
      content: msg.body,
      timestamp: msg.created_at,
    }));
  }, [realtimeMessages]);

  // Auto-scroll hook for chat messages
  const { scrollContainerRef, resetScroll } = useMessageScroll({
    messages,
    isLoading: isLoadingMessages,
  });

  const handleSelectConversation = useCallback(
    async (booking: Booking) => {
      // Set loading state immediately to prevent flash of old content
      setIsLoadingMessages(true);
      setSelectedBooking(booking);
      setIsMobileConversationOpen(true);
      setSendError(null);

      // Reset scroll state when switching chats
      resetScroll();

      // Note: Messages are now fetched by the realtime hook
      // Mark as read will happen in useEffect after messages load
    },
    [resetScroll],
  );

  // Load bookings and their last messages on mount
  useEffect(() => {
    const loadBookingsAndMessages = async () => {
      const data = await fetchBookings(currentUserId, userRole);
      const filteredBookings = data.filter((b) => isMessagingEnabled(b.status));
      setBookings(filteredBookings);

      // Fetch last message for each booking
      const lastMsgs: Record<
        string,
        { text: string; timestamp: string; senderId: string }
      > = {};

      for (const booking of filteredBookings) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const messages: any[] = await fetchMessages(booking.id);
        if (messages.length > 0) {
          const lastMsg = messages[messages.length - 1];
          lastMsgs[booking.id] = {
            text: lastMsg.content,
            timestamp: lastMsg.timestamp,
            senderId: lastMsg.sender_id,
          };
        }
      }

      setLastMessages(lastMsgs);

      // Fetch unread counts from DB
      const bookingIds = filteredBookings.map((b) => b.id);
      const unreadResult = await getUnreadCounts(bookingIds);
      if (unreadResult.success && unreadResult.data) {
        setUnreadCounts(unreadResult.data);
      }

      setIsLoading(false);

      const bookingId = searchParams.get('booking');
      if (bookingId) {
        const booking = filteredBookings.find((b) => b.id === bookingId);
        if (booking) {
          // Open conversation (messages will be loaded by realtime hook)
          setSelectedBooking(booking);
          setIsMobileConversationOpen(true);
          setSendError(null);
        }
      }
    };

    loadBookingsAndMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, userRole]);

  // Clear loading state once messages are loaded
  useEffect(() => {
    if (selectedBooking && realtimeStatus === 'subscribed') {
      setIsLoadingMessages(false);
    }
  }, [selectedBooking, realtimeStatus, messages.length]);

  // Mark chat as read when messages are loaded and chat is focused
  useEffect(() => {
    const markAsRead = async () => {
      if (
        !selectedBooking ||
        messages.length === 0 ||
        isLoadingMessages ||
        realtimeStatus !== 'subscribed'
      ) {
        return;
      }

      // Get last message ID
      const lastMessage = messages[messages.length - 1];

      // Mark as read
      const result = await upsertBookingRead(
        selectedBooking.id,
        lastMessage.id,
      );

      if (result.success) {
        console.log(
          '[MessageInbox] Marked as read booking=%s lastMsgId=%s',
          selectedBooking.id,
          lastMessage.id,
        );

        // Update unread count locally
        setUnreadCounts((prev) => ({
          ...prev,
          [selectedBooking.id]: 0,
        }));
      } else {
        console.error('[MessageInbox] Failed to mark as read:', result.error);
      }
    };

    markAsRead();
  }, [selectedBooking, messages, isLoadingMessages, realtimeStatus]);

  // Note: Last messages are updated by the background realtime subscription below
  // We don't update them here to prevent visual flash when switching chats

  // Background subscription: Listen for ALL user's messages (inbox updates)
  useEffect(() => {
    if (!supabase || bookings.length === 0) return;

    // Create a Set of booking IDs for fast lookup (stable reference)
    const bookingIds = new Set(bookings.map((b) => b.id));

    console.log(
      '[RT-Inbox] Setting up background subscription for %d bookings',
      bookingIds.size,
    );

    // Subscribe to ALL messages the user can see (RLS will filter automatically)
    const channel = supabase
      .channel(`inbox:${currentUserId}:messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload: {
          new: {
            id: string;
            booking_id: string;
            sender_id: string;
            body: string;
            created_at: string;
          };
        }) => {
          const newMessage = payload.new;
          const bookingId = newMessage.booking_id;

          // Check if this message belongs to one of our bookings
          if (!bookingIds.has(bookingId)) {
            console.log(
              '[RT-Inbox] Message for unknown booking %s, ignoring',
              bookingId,
            );
            return;
          }

          console.log(
            '[RT-Inbox] New message in booking=%s sender=%s (current=%s selected=%s)',
            bookingId,
            newMessage.sender_id,
            currentUserId,
            selectedBooking?.id || 'none',
          );

          // Update last message for this booking
          setLastMessages((prev) => ({
            ...prev,
            [bookingId]: {
              text: newMessage.body,
              timestamp: newMessage.created_at,
              senderId: newMessage.sender_id,
            },
          }));

          // Move this booking to the top of the list
          setBookings((prev) => {
            const bookingIndex = prev.findIndex((b) => b.id === bookingId);
            if (bookingIndex === -1) return prev; // Booking not found
            if (bookingIndex === 0) return prev; // Already at top

            // Remove from current position and add to front
            const updatedBookings = [...prev];
            const [movedBooking] = updatedBookings.splice(bookingIndex, 1);
            updatedBookings.unshift(movedBooking);

            console.log(
              '[RT-Inbox] Moved booking %s to top of list',
              bookingId,
            );

            return updatedBookings;
          });

          // Update unread count if message is from other party and booking is not selected
          if (
            newMessage.sender_id !== currentUserId &&
            selectedBooking?.id !== bookingId
          ) {
            console.log(
              '[RT-Inbox] Incrementing unread count for booking %s',
              bookingId,
            );
            setUnreadCounts((prev) => ({
              ...prev,
              [bookingId]: (prev[bookingId] || 0) + 1,
            }));
          }
        },
      )
      .subscribe((status: string) => {
        console.log(
          '[RT-Inbox] Background subscription status=%s time=%s',
          status,
          new Date().toISOString(),
        );

        if (status === 'SUBSCRIBED') {
          console.log('[RT-Inbox] ✅ Subscribed to inbox updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[RT-Inbox] ❌ Channel error');
        }
      });

    return () => {
      console.log('[RT-Inbox] Cleaning up background subscription');
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, bookings.length, currentUserId, selectedBooking?.id]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedBooking || isSending || !supabase)
      return;

    setIsSending(true);
    setSendError(null);

    const messageBody = messageInput.trim();
    setMessageInput(''); // Clear input immediately for better UX

    try {
      // Use direct Supabase insert for optimistic updates
      const { data, error } = await (supabase.from('messages') as any)
        .insert({
          booking_id: selectedBooking.id,
          sender_id: currentUserId,
          body: messageBody,
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistic update (realtime will dedupe if it arrives)
      if (data) {
        addOptimisticMessage({
          id: data.id,
          booking_id: data.booking_id,
          sender_id: data.sender_id,
          body: data.body,
          created_at: data.created_at,
        });
      }
    } catch (error) {
      console.error('[handleSendMessage] Error:', error);
      setSendError('Failed to send message');
      // Restore message on error
      setMessageInput(messageBody);
    } finally {
      setIsSending(false);
    }
  };

  const handleBackToList = () => {
    setIsMobileConversationOpen(false);
    setSelectedBooking(null);
  };

  // Filter and sort bookings by newest message first
  const filteredBookings = useMemo(() => {
    const filtered = bookings.filter(
      (booking) =>
        booking.guide_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.city_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Sort by last message timestamp (newest first)
    return filtered.sort((a, b) => {
      const aLastMsg = lastMessages[a.id];
      const bLastMsg = lastMessages[b.id];

      // If neither has messages, maintain original order
      if (!aLastMsg && !bLastMsg) return 0;
      // If only a has messages, it comes first
      if (aLastMsg && !bLastMsg) return -1;
      // If only b has messages, it comes first
      if (!aLastMsg && bLastMsg) return 1;

      // Both have messages - sort by timestamp (newest first)
      const aTime = new Date(aLastMsg.timestamp).getTime();
      const bTime = new Date(bLastMsg.timestamp).getTime();
      return bTime - aTime;
    });
  }, [bookings, lastMessages, searchQuery]);

  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    msgs.forEach((msg) => {
      const date = new Date(msg.timestamp).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  // Helper function to determine if user is online
  // Based on recent message activity (last 5 minutes) or realtime connection
  const isUserOnline = useCallback(() => {
    if (!selectedBooking || messages.length === 0) return false;

    // Check if there's a recent message from the other party (within 5 minutes)
    const otherUserId =
      userRole === 'traveler'
        ? selectedBooking.guide_id
        : selectedBooking.traveler_id;

    const recentMessages = messages
      .filter((msg) => msg.sender_id === otherUserId)
      .slice(-5); // Check last 5 messages

    if (recentMessages.length === 0) return false;

    const lastMessage = recentMessages[recentMessages.length - 1];
    const lastMessageTime = new Date(lastMessage.timestamp).getTime();
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    return now - lastMessageTime < fiveMinutes;
  }, [selectedBooking, messages, userRole]);

  const messageGroups = groupMessagesByDate(messages);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2">Messages</h1>
          <div className="space-y-4 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-4">
                <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 rounded-lg" />
                  <Skeleton className="h-3 w-24 rounded-lg" />
                  <Skeleton className="h-3 w-full rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 lg:static lg:inset-auto -m-8 lg:m-0">
        <div className="h-screen lg:h-[calc(100vh-8rem)] flex bg-white lg:rounded-2xl lg:border lg:border-slate-200 overflow-hidden">
          <aside
            className={cn(
              'w-full lg:w-80 border-r border-slate-200 flex flex-col bg-white min-h-0',
              isMobileConversationOpen && 'hidden lg:flex',
            )}
          >
            <div className="p-4 border-b border-slate-200 space-y-4 flex-shrink-0">
              <h2 className="text-xl font-bold text-ink">Messages</h2>
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent={<Search className="h-4 w-4 text-ink-soft" />}
                classNames={{
                  inputWrapper: 'bg-default-100',
                }}
              />
            </div>
            <ScrollShadow className="flex-1 min-h-0" size={20}>
              {filteredBookings.length === 0 ? (
                <EmptyState
                  title="No conversations yet"
                  description="Conversations will appear here when you start chatting."
                  icon="message"
                />
              ) : (
                filteredBookings.map((booking) => {
                  const lastMsg = lastMessages[booking.id];
                  const unreadCount = unreadCounts[booking.id] || 0;
                  const isUnread = unreadCount > 0;
                  const avatar =
                    userRole === 'traveler'
                      ? booking.guide_avatar
                      : booking.traveler_avatar;
                  const displayName =
                    userRole === 'traveler'
                      ? booking.guide_name
                      : booking.traveler_name || 'Traveler';

                  return (
                    <div
                      key={booking.id}
                      className={cn(
                        'p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50 relative',
                        isUnread && 'bg-slate-50/50',
                      )}
                      onClick={() => handleSelectConversation(booking)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <Avatar
                            src={avatar || undefined}
                            name={displayName}
                            showFallback
                            size="lg"
                            className="flex-shrink-0"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  'truncate',
                                  isUnread
                                    ? 'font-bold text-ink'
                                    : 'font-semibold text-ink',
                                )}
                              >
                                {displayName}
                              </p>
                              <p className="text-sm text-ink-soft truncate">
                                {booking.city_name}
                              </p>
                              {lastMsg && (
                                <p
                                  className={cn(
                                    'text-sm truncate mt-1',
                                    isUnread
                                      ? 'font-medium text-ink'
                                      : 'text-ink-soft',
                                  )}
                                >
                                  {lastMsg.senderId === currentUserId && (
                                    <span className="mr-1">You: </span>
                                  )}
                                  {lastMsg.text}
                                </p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 flex-shrink-0">
                              {lastMsg && (
                                <span className="text-xs text-ink-soft whitespace-nowrap">
                                  {formatDistanceToNow(
                                    new Date(lastMsg.timestamp),
                                    {
                                      addSuffix: true,
                                    },
                                  ).replace('about ', '')}
                                </span>
                              )}
                              {isUnread && (
                                <Chip
                                  color="primary"
                                  size="sm"
                                  variant="solid"
                                  classNames={{
                                    base: 'min-w-[20px] h-5',
                                    content: 'text-xs font-bold px-1',
                                  }}
                                >
                                  {unreadCount}
                                </Chip>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollShadow>
          </aside>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {selectedBooking ? (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* Enhanced Chat Header */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white/95 backdrop-blur-sm flex-shrink-0 z-10">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="light"
                      isIconOnly
                      className="lg:hidden"
                      onPress={handleBackToList}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>

                    {/* Avatar */}
                    <Tooltip
                      content={isUserOnline() ? 'Active' : 'Offline'}
                      placement="bottom"
                    >
                      <div className="relative">
                        <Avatar
                          src={
                            (userRole === 'traveler'
                              ? selectedBooking.guide_avatar
                              : selectedBooking.traveler_avatar) || undefined
                          }
                          name={
                            userRole === 'traveler'
                              ? selectedBooking.guide_name
                              : selectedBooking.traveler_name || 'Traveler'
                          }
                          showFallback
                          isBordered
                          size="lg"
                          classNames={{
                            base: 'shadow-md',
                          }}
                        />
                        {/* Online indicator */}
                        <div
                          className={cn(
                            'absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full transition-colors',
                            isUserOnline()
                              ? 'bg-green-500'
                              : 'bg-slate-400 opacity-50',
                          )}
                        ></div>
                      </div>
                    </Tooltip>

                    {/* Name and Role */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-ink">
                          {userRole === 'traveler'
                            ? selectedBooking.guide_name
                            : selectedBooking.traveler_name || 'Traveler'}
                        </h2>
                      </div>
                      <p className="text-sm text-ink-soft">
                        {userRole === 'traveler' ? 'Guide' : 'Traveler'} •{' '}
                        {selectedBooking.city_name}
                      </p>
                    </div>
                  </div>
                </div>

                <ScrollShadow
                  ref={scrollContainerRef}
                  className="flex-1 p-4 space-y-4 min-h-0"
                  size={40}
                >
                  {isLoadingMessages ? (
                    <div className="flex items-center justify-center h-full">
                      <Spinner size="lg" label="Loading messages..." />
                    </div>
                  ) : (
                    Object.entries(messageGroups).map(([date, msgs]) => (
                      <div key={date}>
                        <div className="text-center text-xs text-ink-soft mb-4">
                          {date}
                        </div>
                        {msgs.map((msg) => {
                          const isMe = msg.sender_id === currentUserId;
                          const avatar = isMe
                            ? userRole === 'traveler'
                              ? selectedBooking?.traveler_avatar
                              : selectedBooking?.guide_avatar
                            : userRole === 'traveler'
                              ? selectedBooking?.guide_avatar
                              : selectedBooking?.traveler_avatar;

                          return (
                            <div
                              key={msg.id}
                              className={cn(
                                'flex gap-3 max-w-2xl mb-4',
                                isMe ? 'ml-auto flex-row-reverse' : '',
                              )}
                            >
                              {/* Avatar */}
                              <Avatar
                                src={avatar || undefined}
                                name={msg.sender_name}
                                showFallback
                                size="md"
                                className="shrink-0"
                              />

                              {/* Message bubble */}
                              <div className="flex flex-col gap-1 max-w-[70%]">
                                <div
                                  className={cn(
                                    'rounded-2xl px-5 py-3 shadow-sm text-[15px] leading-relaxed break-words',
                                    isMe
                                      ? 'bg-primary text-white rounded-br-none'
                                      : 'bg-slate-100 text-ink rounded-bl-none',
                                  )}
                                >
                                  {msg.content}
                                </div>

                                {/* Message status and timestamp */}
                                <div
                                  className={cn(
                                    'flex items-center gap-1 text-xs text-ink-soft px-2',
                                    isMe ? 'justify-end' : 'justify-start',
                                  )}
                                >
                                  <span>
                                    {new Date(msg.timestamp).toLocaleTimeString(
                                      'en-US',
                                      {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                      },
                                    )}
                                  </span>
                                  {isMe &&
                                    (() => {
                                      // Determine if recipient has read this message
                                      const isRead = recipientRead
                                        ? new Date(
                                            recipientRead.last_read_at,
                                          ).getTime() >=
                                          new Date(msg.timestamp).getTime()
                                        : false;

                                      return (
                                        <span className="ml-1">
                                          {isRead ? (
                                            <CheckCheck className="w-4 h-4 text-blue-500" />
                                          ) : (
                                            <Check className="w-4 h-4" />
                                          )}
                                        </span>
                                      );
                                    })()}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))
                  )}
                </ScrollShadow>

                <div className="p-4 border-t border-slate-200 flex-shrink-0">
                  {!isMessagingEnabled(selectedBooking.status) ? (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg text-ink-soft">
                      <Lock className="h-5 w-5" />
                      <p className="text-sm">
                        Chat will open after the guide accepts your booking
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sendError && (
                        <div className="text-sm text-red-600 px-2">
                          {sendError}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          type="text"
                          placeholder="Type your message..."
                          value={messageInput}
                          onValueChange={setMessageInput}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          isDisabled={isSending}
                          classNames={{
                            inputWrapper: 'bg-default-100',
                          }}
                        />
                        <Button
                          color="primary"
                          isIconOnly
                          onPress={handleSendMessage}
                          isDisabled={isSending || !messageInput.trim()}
                          isLoading={isSending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <EmptyState
                  title="Select a conversation"
                  description="Choose a conversation to start chatting."
                  icon="message"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Realtime Health Check (dev only) */}
      <RealtimeHealthCheck
        status={realtimeStatus}
        error={realtimeError}
        lastEventAt={lastEventAt}
        messageCount={messages.length}
        bookingId={selectedBooking?.id}
      />
    </>
  );
}
