"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";

import { useChatStore } from "@/store/chatStore";

import { deliver, publish } from "@/lib/realtime";
import { getVisitorLabel } from "@/lib/visitorLabel";
import { Message } from "@/lib/models";
import { playSound, unlockSound } from "@/lib/sound";
import { EVENT, MESSAGE_STATUS, ROLE } from "@/lib/constants";

import { useOnline } from "@/hooks/useOnline";
import { useTyping } from "@/hooks/useTyping";

import { MessageList } from "@/components/shared/MessageList";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { ChatInput } from "../shared/ChatInput";

const EMPTY_MESSAGES: readonly Message[] = [];

export function ThreadView({ threadId }: { threadId: string }) {
  const [input, setInput] = useState("");
  const online = useOnline();
  const typing = useChatStore((s) => s.typing[`${threadId}:${ROLE.VISITOR}`]);
  const messages = useChatStore((s) => s.messages[threadId] ?? EMPTY_MESSAGES);
  const visitorLabel = getVisitorLabel(threadId);
  const prevCountRef = useRef(messages.length);

  const router = useRouter();
  const lastMessage = messages[messages.length - 1];
  const sendTyping = useTyping(threadId, ROLE.AGENT);

  const showStatusForId =
    lastMessage && lastMessage.sender === ROLE.AGENT
      ? lastMessage.id
      : undefined;

  useEffect(() => {
    messages
      .filter((m) => m.sender === ROLE.VISITOR && !m.read)
      .forEach((m) =>
        publish({
          type: EVENT.MESSAGE_READ,
          payload: { id: m.id, sender: m.sender },
        }),
      );

    useChatStore.getState().markThreadRead(threadId);
  }, [threadId]);

  useEffect(() => {
    const prevCount = prevCountRef.current;
    const nextCount = messages.length;

    if (nextCount > prevCount) {
      const last = messages[nextCount - 1];

      // 🔔 ONLY when a NEW visitor message arrives
      if (last.sender === ROLE.VISITOR) {
        playSound();
      }
    }

    prevCountRef.current = nextCount;
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;

    const msg = {
      id: uuid(),
      threadId,
      sender: ROLE.AGENT,
      body: input,
      createdAt: Date.now(),
      status: MESSAGE_STATUS.SENDING,
      read: true,
    };

    useChatStore.getState().sendMessage(msg);
    deliver(msg);
    setInput("");
  };

  const markUnreadAsRead = (threadId: string) => {
    const store = useChatStore.getState();

    store.messages[threadId]
      ?.filter((m) => m.sender === ROLE.VISITOR && !m.read)
      .forEach((m) => {
        publish({
          type: EVENT.MESSAGE_READ,
          payload: { id: m.id, sender: ROLE.AGENT },
        });
      });

    store.markThreadRead(threadId);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {/* Thread header */}
      <div className="shrink-0 px-4 py-3 border-b border-gray-700 flex items-center gap-3">
        <button
          className="md:hidden text-sm text-gray-400 cursor-pointer"
          onClick={() => router.push("/agent")}
        >
          ← Inbox
        </button>

        <h3 className="font-medium truncate">{visitorLabel}</h3>
      </div>

      {!online && <OfflineBanner />}

      {/* ✅ THE ONLY SCROLLER */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <MessageList
          key={threadId}
          messages={messages}
          showStatusForId={showStatusForId}
        />
      </div>

      {typing && (
        <p className="shrink-0 px-3 py-1 text-xs italic text-gray-600">
          Visitor is typing…
        </p>
      )}

      {/* Input always visible */}
      <div className="shrink-0 border-t border-gray-700 p-3 bg-background">
        <ChatInput
          value={input}
          placeholder="Reply to visitor…"
          onFocus={unlockSound}
          onChange={(value) => {
            setInput(value);
            markUnreadAsRead(threadId);
          }}
          onTyping={sendTyping}
          onSend={send}
        />
      </div>
    </div>
  );
}
