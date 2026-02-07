'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Check, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { useBookingMessagesRealtime } from '@/lib/hooks/useBookingMessagesRealtime';
import { useBookingReads } from '@/lib/hooks/useBookingReads';
import { RealtimeHealthCheck } from './RealtimeHealthCheck';
import { upsertBookingRead } from '@/lib/chat-actions';

interface ChatWindowProps {
  bookingId: string;
  currentUserId: string;
  recipientId: string;
  initialMessages?: any[];
}

export function ChatWindow({
  bookingId,
  currentUserId,
  recipientId,
  initialMessages = [],
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(0);
  const supabase = createSupabaseBrowserClient();

  // Use the reliable realtime hook
  const {
    messages,
    status: realtimeStatus,
    error: realtimeError,
    lastEventAt,
    addOptimisticMessage,
  } = useBookingMessagesRealtime({
    bookingId,
    initialMessages,
    currentUserId,
  });

  // Use booking reads hook for read status
  const { recipientRead } = useBookingReads({
    bookingId,
    currentUserId,
    recipientId,
  });

  // Auto-scroll to bottom only when NEW messages arrive (not on initial load)
  useEffect(() => {
    const currentCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    // Only scroll if we have more messages than before (new message arrived)
    // Skip on initial load (prevCount === 0 means first render)
    if (scrollRef.current && currentCount > prevCount && prevCount > 0) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // Update the ref for next comparison
    prevMessageCountRef.current = currentCount;
  }, [messages]);

  // Mark chat as read when messages load or new messages arrive
  useEffect(() => {
    const markAsRead = async () => {
      if (messages.length === 0 || realtimeStatus !== 'subscribed') {
        return;
      }

      const lastMessage = messages[messages.length - 1];
      await upsertBookingRead(bookingId, lastMessage.id);
    };

    markAsRead();
  }, [bookingId, messages, realtimeStatus]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !supabase) return;
    setIsLoading(true);

    const messageBody = newMessage.trim();
    setNewMessage(''); // Clear input immediately for better UX

    try {
      const { data, error } = await (supabase.from('messages') as any)
        .insert({
          booking_id: bookingId,
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
      console.error('[ChatWindow] Failed to send message:', error);
      // Restore message on error
      setNewMessage(messageBody);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col h-[600px] border rounded-lg bg-background">
        {/* Header */}
        <div className="p-4 border-b">
          <h3 className="font-semibold">Chat</h3>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {!isMe && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.sender?.avatar_url || ''} />
                      <AvatarFallback>
                        {(msg.sender?.full_name || '?')[0]}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${
                      isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    <p>{msg.body}</p>
                    <div
                      className={`flex items-center gap-1 text-[10px] mt-1 opacity-70 ${isMe ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                    >
                      <span>{format(new Date(msg.created_at), 'p')}</span>
                      {isMe &&
                        (() => {
                          // Determine if recipient has read this message
                          const isRead = recipientRead
                            ? new Date(recipientRead.last_read_at).getTime() >=
                              new Date(msg.created_at).getTime()
                            : false;

                          return isRead ? (
                            <CheckCheck className="w-3 h-3 ml-1" />
                          ) : (
                            <Check className="w-3 h-3 ml-1" />
                          );
                        })()}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t flex gap-2">
          <Textarea
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="min-h-[40px] max-h-[120px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            size="sm"
            onClick={handleSendMessage}
            disabled={isLoading || !newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Realtime Health Check (dev only) */}
      <RealtimeHealthCheck
        status={realtimeStatus}
        error={realtimeError}
        lastEventAt={lastEventAt}
        messageCount={messages.length}
        bookingId={bookingId}
      />
    </>
  );
}
