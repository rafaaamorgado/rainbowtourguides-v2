'use client';

import { useEffect, useState, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  text: string;
  sender_id: string;
  created_at: string;
  sender?: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface ChatWindowProps {
  bookingId: string;
  currentUserId: string;
  initialMessages?: Message[];
}

export function ChatWindow({ bookingId, currentUserId, initialMessages = [] }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseBrowserClient();

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Subscribe to Realtime
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel(`booking_messages:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, supabase]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !supabase) return;
    setIsLoading(true);

    try {
      const { error } = await (supabase.from('messages') as any).insert({
        booking_id: bookingId,
        sender_id: currentUserId,
        text: newMessage,
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
                     <AvatarFallback>{msg.sender?.display_name?.[0] || '?'}</AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    isMe
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 opacity-70 ${isMe ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    {format(new Date(msg.created_at), 'p')}
                  </p>
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
           size="icon" 
           onClick={handleSendMessage} 
           disabled={isLoading || !newMessage.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
