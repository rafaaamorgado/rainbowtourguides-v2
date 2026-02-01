import { useEffect, useRef } from 'react';

interface UseMessageScrollOptions {
  messages: unknown[];
  isLoading?: boolean;
}

/**
 * Hook to handle auto-scrolling in chat windows
 * - Scrolls container to bottom on initial load
 * - Scrolls container to bottom when new messages arrive
 * - Uses instant scroll (no smooth behavior)
 */
export function useMessageScroll({
  messages,
  isLoading = false,
}: UseMessageScrollOptions) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef<number>(0);
  const hasInitialScrolledRef = useRef<boolean>(false);

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading && messages.length > 0 && !hasInitialScrolledRef.current) {
      scrollToBottom();
      hasInitialScrolledRef.current = true;
      prevMessageCountRef.current = messages.length;
    }
  }, [messages.length, isLoading]);

  // Auto-scroll to bottom when NEW messages arrive (after initial load)
  useEffect(() => {
    const currentCount = messages.length;
    const prevCount = prevMessageCountRef.current;

    // Only scroll if we have more messages than before (new message arrived)
    // Skip on initial load (handled by the effect above)
    if (
      currentCount > prevCount &&
      prevCount > 0 &&
      hasInitialScrolledRef.current
    ) {
      scrollToBottom();
    }

    // Update the ref for next comparison
    prevMessageCountRef.current = currentCount;
  }, [messages.length]);

  // Reset initial scroll flag when switching chats
  const resetScroll = () => {
    hasInitialScrolledRef.current = false;
    prevMessageCountRef.current = 0;
  };

  return {
    scrollContainerRef,
    resetScroll,
  };
}
