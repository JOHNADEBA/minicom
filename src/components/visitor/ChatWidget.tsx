'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import { v4 as uuid } from 'uuid';
import debounce from 'lodash.debounce';

import { useChatStore } from '@/store/chatStore';
import { deliver, sendTyping } from '@/lib/realtime';
import { getThreadId } from '@/lib/thread';
import { MessageBubble } from '@/components/shared/MessageBubble';
import { Message } from '@/lib/models';

const EMPTY_MESSAGES: Message[] = [];


export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [online, setOnline] = useState(true);
const typingRef = useRef<
  ((typing: boolean) => void) | null
>(null);
const PAGE_SIZE = 50;
const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);


  useEffect(() => {
    setThreadId(getThreadId());

    const on = () => setOnline(true);
  const off = () => setOnline(false);

  window.addEventListener('online', on);
  window.addEventListener('offline', off);

  setOnline(navigator.onLine);

  return () => {
    window.removeEventListener('online', on);
    window.removeEventListener('offline', off);
  };
  }, []);

  const allMessages = useChatStore((s) => s.messages);
  const agentTyping = useChatStore((s) =>
    threadId ? s.typing[`${threadId}:agent`] : false
  );

  const messages = useMemo(() => {
    if (!threadId) return EMPTY_MESSAGES;
    return allMessages[threadId] ?? EMPTY_MESSAGES;
  }, [allMessages, threadId]);

  const lastMessageId = messages[messages.length - 1]?.id;

  if (!threadId) return null;

  if (!typingRef.current && threadId) {
  typingRef.current = debounce((t: boolean) => {
    sendTyping({ threadId, sender: 'visitor', typing: t });
  }, 300);
}

const visibleMessages = messages.slice(-visibleCount);


  const send = () => {
    if (!input.trim()) return;

    const msg = {
      id: uuid(),
      threadId,
      sender: 'visitor' as const,
      body: input,
      createdAt: Date.now(),
      status: 'sending' as const,
      read: false,
    };

    useChatStore.getState().sendMessage(msg);
    deliver(msg);
    setInput('');
    typingRef.current?.(false);

  };

  if (!threadId) return null;

  return (
    <div className="fixed bottom-4 right-4">
      <button className="cursor-pointer text-3xl"  onClick={() => setOpen(!open)}>💬</button>

      {open && (
        <div className="w-80 h-96 bg-gray-900 border border-gray-700 rounded-lg shadow-xl flex flex-col text-white">
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-700 text-sm font-medium bg-gray-800">
            Live Support
          </div>

          {!online && (
  <div className="bg-yellow-600 text-black text-xs px-3 py-1">
    You are offline. Messages will be sent when reconnected.
  </div>
)}


          {/* Messages */}
          <div
  className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-900"
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
                showStatus={Boolean(m.id === lastMessageId)}
              />
            ))}
          </div>

          {/* Typing indicator */}
          {agentTyping && (
            <div className="px-3 pb-1">
              <p className="text-xs italic text-gray-400">
                Agent is typing…
              </p>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-700 bg-gray-800 p-2">
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                typingRef.current?.(true);

                setTimeout(() => typingRef.current?.(false), 1200);
              }}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Type a message..."
              className="
          w-full
          rounded-md
          border
          border-gray-600
          bg-gray-900
          px-3
          py-2
          text-sm
          text-white
          placeholder-gray-400
          focus:outline-none
        "
            />
          </div>
        </div>
      )}

    </div>
  );
}
