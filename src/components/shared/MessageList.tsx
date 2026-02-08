"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { Message } from "@/lib/models";
import { MessageBubble } from "./MessageBubble";

const PAGE_SIZE = 50;

interface Props {
  messages: Message[];
  showStatusForId?: string;
}

export function MessageList({ messages, showStatusForId }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleMessages = messages.slice(-visibleCount);

  // ✅ SCROLL AFTER LAYOUT IS 100% READY
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // two-frame scroll (this is the key)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    });
  }, [messages.length, showStatusForId]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-2 sm:px-3 py-3 space-y-2"
      onScroll={(e) => {
        const el = e.currentTarget;
        if (el.scrollTop === 0 && visibleCount < messages.length) {
          setVisibleCount((c) => c + PAGE_SIZE);
        }
      }}
    >
      {visibleMessages.map((m) => (
        <MessageBubble
          key={`${m.id}-${m.status}`}
          message={m}
          showStatus={m.id === showStatusForId}
        />
      ))}
    </div>
  );
}
