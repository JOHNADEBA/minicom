"use client";

import { useState, useEffect, useMemo } from "react";
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

const EMPTY_MESSAGES: Message[] = [];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);

  const online = useOnline();

  // initialize visitor thread
  useEffect(() => {
    setThreadId(getThreadId());
    const onKey = (e: KeyboardEvent) => {
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

  const lastMessage = messages[messages.length - 1];

  const showStatusForId =
    lastMessage && lastMessage.sender === ROLE.VISITOR
      ? lastMessage.id
      : undefined;

  useEffect(() => {
    const last = messages[messages.length - 1];

    if (!last) return;

    // 🔔 visitor hears agent
    if (last.sender === ROLE.AGENT) {
      playSound();
    }
  }, [messages]);

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
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                sendTyping?.(true);
                sendTyping?.(true);
                clearTimeout((sendTyping as any)?._t);
                (sendTyping as any)._t = setTimeout(() => {
                  sendTyping?.(false);
                }, 1200);
              }}
              onKeyDown={(e) => {
                unlockSound();
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type a message…"
              className="
                w-full
                rounded-md
                border
                border-gray-600
                px-3
                py-2
                text-sm
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
