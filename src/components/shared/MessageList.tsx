"use client";

import { useEffect, useRef, useState } from "react";
import { Message } from "@/lib/models";
import { MessageBubble } from "./MessageBubble";
import { MESSAGE_STATUS } from "@/lib/constants";

const PAGE_SIZE = 50;
const BASE_SPACER = 40;

interface Props {
  messages: Message[];
  showStatusForId?: string;
}

export function MessageList({ messages, showStatusForId }: Props) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [spacerHeight, setSpacerHeight] = useState(BASE_SPACER);

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const visibleMessages = messages.slice(-visibleCount);
  const lastMessage = visibleMessages[visibleMessages.length - 1];

  // ✅ CLIENT-ONLY spacer adjustment (after hydration)
  useEffect(() => {
    if (!lastMessage || lastMessage.id !== showStatusForId) {
      setSpacerHeight(BASE_SPACER);
      return;
    }

    if (lastMessage.status === MESSAGE_STATUS.FAILED) {
      setSpacerHeight(70);
    } else if (lastMessage.status) {
      setSpacerHeight(56);
    } else {
      setSpacerHeight(BASE_SPACER);
    }
  }, [lastMessage?.id, lastMessage?.status, showStatusForId]);

  // ✅ ALWAYS scroll fully to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages.length]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 space-y-2"
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

      {/* 🔑 STABLE SSR SAFE SPACER */}
      <div ref={bottomRef} style={{ height: spacerHeight }} />
    </div>
  );
}
