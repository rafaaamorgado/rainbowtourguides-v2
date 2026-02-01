'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Send, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { isMessagingEnabled } from '@/lib/messaging-rules';

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
  guide_name: string;
  city_name: string;
  status: string;
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
  const messageEndRef = useRef<HTMLDivElement>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileConversationOpen, setIsMobileConversationOpen] =
    useState(false);

  const handleSelectConversation = useCallback(
    async (booking: Booking) => {
      setSelectedBooking(booking);
      setIsMobileConversationOpen(true);
      const bookingMessages = await fetchMessages(booking.id);
      setMessages(bookingMessages);
    },
    [fetchMessages],
  );

  useEffect(() => {
    fetchBookings(currentUserId, userRole).then((data) => {
      const filteredBookings = data.filter((b) =>
        isMessagingEnabled(b.status),
      );
      setBookings(filteredBookings);
      setIsLoading(false);

      const bookingId = searchParams.get('booking');
      if (bookingId) {
        const booking = filteredBookings.find((b) => b.id === bookingId);
        if (booking) {
          handleSelectConversation(booking);
        }
      }
    });
  }, [
    searchParams,
    fetchBookings,
    currentUserId,
    userRole,
    handleSelectConversation,
  ]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedBooking) return;
    alert('Messaging coming soon! Your message: ' + messageInput);
    setMessageInput('');
  };

  const handleBackToList = () => {
    setIsMobileConversationOpen(false);
    setSelectedBooking(null);
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.guide_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.city_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

  const messageGroups = groupMessagesByDate(messages);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-ink mb-2">Messages</h1>
          <p className="text-ink-soft">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 lg:static lg:inset-auto -m-8 lg:m-0">
      <div className="h-screen lg:h-[calc(100vh-8rem)] flex bg-white lg:rounded-2xl lg:border lg:border-slate-200 overflow-hidden">
        <aside
          className={cn(
            'w-full lg:w-80 border-r border-slate-200 flex flex-col bg-white',
            isMobileConversationOpen && 'hidden lg:flex',
          )}
        >
          <div className="p-4 border-b border-slate-200 space-y-4">
            <h2 className="text-xl font-bold text-ink">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-soft" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredBookings.length === 0 ? (
              <EmptyState
                title="No conversations yet"
                description="Conversations will appear here when you start chatting."
                icon="message"
              />
            ) : (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 border-b border-slate-200 cursor-pointer hover:bg-slate-50"
                  onClick={() => handleSelectConversation(booking)}
                >
                  <p className="font-bold text-ink truncate">
                    {booking.guide_name}
                  </p>
                  <p className="text-sm text-ink-soft truncate">
                    {booking.city_name} • {booking.status}
                  </p>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedBooking ? (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden mr-2"
                  onClick={handleBackToList}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-bold text-ink">
                  Chat with {selectedBooking.guide_name}
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {Object.entries(messageGroups).map(([date, msgs]) => (
                  <div key={date}>
                    <div className="text-center text-xs text-ink-soft mb-4">
                      {date}
                    </div>
                    {msgs.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex gap-4 max-w-2xl',
                          msg.sender_id === currentUserId
                            ? 'ml-auto flex-row-reverse'
                            : '',
                        )}
                      >
                        <div className="shrink-0 w-10 h-10 rounded-full bg-slate-200" />
                        <div
                          className={cn(
                            'rounded-2xl px-6 py-4 shadow-sm text-[15px] leading-relaxed',
                            msg.sender_id === currentUserId
                              ? 'bg-primary text-white rounded-br-none'
                              : 'bg-slate-100 text-ink rounded-bl-none',
                          )}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>

              <div className="p-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
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
  );
}
