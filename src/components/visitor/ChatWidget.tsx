"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { KeyboardEvent, ChangeEvent } from "react";
import { v4 as uuid } from "uuid";

import { useChatStore } from "@/store/chatStore";

import { deliver } from "@/lib/realtime";
import { getThreadId } from "@/lib/thread";
import { Message } from "@/lib/models";
import { playSound, unlockSound } from "@/lib/sound";
import { MESSAGE_STATUS, ROLE } from "@/lib/constants";

import { useMessageNotification } from "@/hooks/useMessageNotification";
import { useOnline } from "@/hooks/useOnline";
import { useTyping } from "@/hooks/useTyping";

import { MessageList } from "@/components/shared/MessageList";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { ChatInput } from "@/components/shared/ChatInput";

const EMPTY_MESSAGES: Message[] = [];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  const online = useOnline();

  // initialize visitor thread
  useEffect(() => {
    setThreadId(getThreadId());
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const allMessages = useChatStore((s) => s.messages);
  const agentTyping = useChatStore((s) =>
    threadId ? s.typing[`${threadId}:${ROLE.AGENT}`] : false,
  );

  useMessageNotification(threadId);

  const messages = useMemo(() => {
    if (!threadId) return EMPTY_MESSAGES;
    return allMessages[threadId] ?? EMPTY_MESSAGES;
  }, [allMessages, threadId]);

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last) return;

    if (lastMessageIdRef.current === last.id) return;
    lastMessageIdRef.current = last.id;

    // 🔔 visitor hears agent ONLY on new message
    if (last.sender === ROLE.AGENT) {
      playSound();
    }
  }, [messages]);

  const lastMessage = messages[messages.length - 1];

  const showStatusForId =
    lastMessage && lastMessage.sender === ROLE.VISITOR
      ? lastMessage.id
      : undefined;

  const sendTyping = useTyping(threadId, ROLE.VISITOR);

  if (!threadId) return null;

  const send = () => {
    if (!input.trim()) return;

    const msg: Message = {
      id: uuid(),
      threadId,
      sender: ROLE.VISITOR,
      body: input,
      createdAt: Date.now(),
      status: MESSAGE_STATUS.SENDING,
      read: false,
    };

    useChatStore.getState().sendMessage(msg);
    deliver(msg);
    setInput("");
    sendTyping?.(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Chat launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-3xl cursor-pointer"
        aria-label="Open chat"
      >
        💬
      </button>

      {open && (
        <div className="mt-2 w-80 h-96 border border-gray-700 rounded-lg shadow-xl flex flex-col ">
          {/* Header */}
          <div className="px-3 py-2 border-b border-gray-700 text-sm font-medium ">
            Live Support
          </div>

          {!online && <OfflineBanner />}

          {/* Messages */}
          <MessageList messages={messages} showStatusForId={showStatusForId} />

          {/* Typing indicator */}
          {agentTyping && (
            <div className="px-3 pb-1">
              <p className="text-xs italic text-gray-600">Agent is typing…</p>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-700 p-2">
            <ChatInput
              value={input}
              placeholder="Type a message…"
              onFocus={unlockSound}
              onChange={setInput}
              onTyping={sendTyping}
              onSend={send}
            />
          </div>
        </div>
      )}
    </div>
  );
}
