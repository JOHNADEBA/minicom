'use client';
import { useEffect, useState, useRef } from 'react';
import { v4 as uuid } from 'uuid';

import { useChatStore } from '@/store/chatStore';
import { deliver, publish } from '@/lib/realtime';
import { MessageBubble } from '@/components/shared/MessageBubble';
import debounce from 'lodash.debounce';
import { sendTyping } from '@/lib/realtime';
import { getVisitorLabel } from '@/lib/visitorLabel';

export function ThreadView({ threadId }: { threadId: string }) {
    const [input, setInput] = useState('');
    const agentTypingRef = useRef<
        ((typing: boolean) => void) | null
    >(null);
const PAGE_SIZE = 50;
const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);


    const messages = useChatStore(
        (s) => s.messages[threadId] ?? []
    );

    const typing = useChatStore(
        (s) => s.typing[`${threadId}:visitor`]
    );

const visitorLabel = getVisitorLabel(threadId);

const [online, setOnline] = useState(true);

useEffect(() => {
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


    useEffect(() => {
        messages
            .filter(
                (m) =>
                    m.sender === 'visitor' &&
                    (m.status === 'delivered' || m.status === 'sent')
            )
            .forEach((m) => {
                publish({
                    type: 'MESSAGE_READ',
                    payload: { id: m.id },
                });
            });

            useChatStore.getState().markThreadRead(threadId);
    }, [threadId]);

    const lastMessageId = messages[messages.length - 1]?.id;

    if (!agentTypingRef.current) {
        agentTypingRef.current = debounce((t: boolean) => {
            sendTyping({ threadId, sender: 'agent', typing: t });
        }, 300);
    }

const visibleMessages = messages.slice(-visibleCount);


    const send = () => {
        const msg = {
            id: uuid(),
            threadId,
            sender: 'agent' as const,
            body: input,
            createdAt: Date.now(),
            status: 'sending' as const,
            read: true,
        };

        useChatStore.getState().sendMessage(msg);
        deliver(msg);
        setInput('');
    };

    return (
  <div className="h-full flex flex-col bg-gray-900">
    {/* Header */}
    <div className="px-4 py-3 border-b border-gray-700 bg-gray-800">
      <h3 className="font-medium">
        {visitorLabel}
      </h3>
    </div>

 {/* Banner */}
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

      {typing && (
        <p className="text-xs italic text-gray-400">
          Visitor is typing…
        </p>
      )}
    </div>

    {/* Input */}
    <div className="border-t border-gray-700 bg-gray-800 p-3">
      <input
  value={input}
  onChange={(e) => {
    setInput(e.target.value);

    // 1️⃣ agent typing indicator
    agentTypingRef.current?.(true);
    setTimeout(() => agentTypingRef.current?.(false), 1200);

    // 2️⃣ mark thread as read when agent starts typing
    useChatStore.getState().markThreadRead(threadId);
  }}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      send();
      agentTypingRef.current?.(false);
    }
  }}
  placeholder="Reply to visitor…"
  className="
    w-full
    rounded-md
    bg-gray-900
    border
    border-gray-700
    px-3
    py-2
    text-sm
    text-white
    focus:outline-none
    focus:ring-0
  "
/>

    </div>
  </div>
);

}
