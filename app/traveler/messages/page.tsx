"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Send,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { getBookings, getMessages } from "@/lib/data-service";
import type { Booking, Message } from "@/lib/mock-data";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function TravelerMessagesPage() {
  const searchParams = useSearchParams();
  const messageEndRef = useRef<HTMLDivElement>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileConversationOpen, setIsMobileConversationOpen] = useState(false);

  // Mock current user ID
  const currentUserId = "u3";

  useEffect(() => {
    // Fetch bookings with conversations
    getBookings(currentUserId, "traveler").then((data) => {
      // Filter to only bookings that have messages or are confirmed/accepted
      const bookingsWithMessages = data.filter(
        (b) =>
          b.status === "confirmed" ||
          b.status === "accepted" ||
          b.status === "completed"
      );
      setBookings(bookingsWithMessages);
      setIsLoading(false);

      // Auto-select from URL param
      const bookingId = searchParams.get("booking");
      if (bookingId) {
        const booking = bookingsWithMessages.find((b) => b.id === bookingId);
        if (booking) {
          handleSelectConversation(booking);
        }
      }
    });
  }, [searchParams]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSelectConversation = async (booking: Booking) => {
    setSelectedBooking(booking);
    setIsMobileConversationOpen(true);

    // Fetch messages for this booking
    const bookingMessages = await getMessages(booking.id);
    setMessages(bookingMessages);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedBooking) return;

    // TODO: Implement real send message
    alert("Messaging coming soon! Your message: " + messageInput);
    setMessageInput("");
  };

  const handleBackToList = () => {
    setIsMobileConversationOpen(false);
    setSelectedBooking(null);
  };

  const filteredBookings = bookings.filter((booking) =>
    booking.guide_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.city_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group messages by date
  const groupMessagesByDate = (msgs: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    msgs.forEach((msg) => {
      const date = new Date(msg.timestamp).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
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
        {/* Left Sidebar - Conversation List */}
        <aside
          className={cn(
            "w-full lg:w-80 border-r border-slate-200 flex flex-col bg-white",
            isMobileConversationOpen && "hidden lg:flex"
          )}
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-200 space-y-4">
            <h2 className="text-xl font-bold text-ink">Messages</h2>

            {/* Search */}
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

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredBookings.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No conversations"
                  description="You don't have any active conversations yet."
                  icon="message-square"
                  variant="minimal"
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredBookings.map((booking) => {
                  const isActive = selectedBooking?.id === booking.id;
                  // Mock: Get last message (would come from messages)
                  const lastMessage = "Looking forward to showing you around!";
                  const lastMessageTime = "2h ago";
                  const unreadCount = 0; // Mock

                  return (
                    <button
                      key={booking.id}
                      onClick={() => handleSelectConversation(booking)}
                      className={cn(
                        "w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left",
                        isActive && "bg-brand/10 hover:bg-brand/10"
                      )}
                    >
                      {/* Guide Photo */}
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-pride-lilac to-pride-mint flex-shrink-0">
                        <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                          {booking.guide_name.charAt(0)}
                        </div>
                      </div>

                      {/* Conversation Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <p className="font-semibold text-ink truncate">
                              {booking.guide_name}
                            </p>
                            <p className="text-xs text-ink-soft">
                              {booking.city_name}
                            </p>
                          </div>
                          <span className="text-xs text-ink-soft whitespace-nowrap">
                            {lastMessageTime}
                          </span>
                        </div>
                        <p className="text-sm text-ink-soft truncate">
                          {lastMessage}
                        </p>
                      </div>

                      {/* Unread Badge */}
                      {unreadCount > 0 && (
                        <Badge className="bg-brand text-white border-0 text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Right Panel - Message Thread */}
        <main
          className={cn(
            "flex-1 flex flex-col bg-slate-50",
            !isMobileConversationOpen && selectedBooking && "hidden lg:flex"
          )}
        >
          {!selectedBooking ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState
                title="Select a conversation"
                description="Choose a conversation from the left to start messaging your guide."
                icon="message-square"
                variant="minimal"
              />
            </div>
          ) : (
            <>
              {/* Header */}
              <header className="bg-white border-b border-slate-200 p-4">
                <div className="flex items-center gap-4">
                  {/* Back Button (Mobile) */}
                  <button
                    onClick={handleBackToList}
                    className="lg:hidden p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-ink" />
                  </button>

                  {/* Guide Photo */}
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-pride-lilac to-pride-mint flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center text-white font-semibold">
                      {selectedBooking.guide_name.charAt(0)}
                    </div>
                  </div>

                  {/* Guide Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ink">
                      {selectedBooking.guide_name}
                    </p>
                    <p className="text-sm text-ink-soft">
                      Booking #{selectedBooking.id}
                    </p>
                  </div>

                  {/* View Booking Link */}
                  <Link
                    href={`/traveler/bookings/${selectedBooking.id}`}
                    className="text-brand hover:text-brand-dark flex items-center gap-1 text-sm font-medium"
                  >
                    <span className="hidden sm:inline">View Details</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </header>

              {/* Message Thread */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-2">
                      <MessageSquare className="h-12 w-12 text-ink-soft mx-auto mb-4" />
                      <p className="text-ink-soft">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  </div>
                ) : (
                  Object.entries(messageGroups).map(([date, msgs]) => (
                    <div key={date} className="space-y-4">
                      {/* Date Divider */}
                      <div className="flex items-center gap-4">
                        <div className="flex-1 border-t border-slate-200" />
                        <span className="text-xs text-ink-soft font-medium">
                          {date}
                        </span>
                        <div className="flex-1 border-t border-slate-200" />
                      </div>

                      {/* Messages */}
                      {msgs.map((message) => {
                        const isFromMe = message.sender_id === currentUserId;

                        return (
                          <div
                            key={message.id}
                            className={cn(
                              "flex",
                              isFromMe ? "justify-end" : "justify-start"
                            )}
                          >
                            <div
                              className={cn(
                                "max-w-md rounded-2xl px-4 py-3 space-y-1",
                                isFromMe
                                  ? "bg-brand text-white"
                                  : "bg-white border border-slate-200 text-ink"
                              )}
                            >
                              <p className="text-sm leading-relaxed">
                                {message.content}
                              </p>
                              <p
                                className={cn(
                                  "text-xs",
                                  isFromMe
                                    ? "text-white/70"
                                    : "text-ink-soft"
                                )}
                              >
                                {new Date(message.timestamp).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "numeric",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                <div ref={messageEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-slate-200 p-4">
                <div className="flex gap-3">
                  <textarea
                    value={messageInput}
                    onChange={(e) => {
                      if (e.target.value.length <= 500) {
                        setMessageInput(e.target.value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="self-end px-6"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-ink-soft mt-2">
                  {messageInput.length}/500 characters
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

