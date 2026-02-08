"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { v4 as uuid } from "uuid";

import { useChatStore } from "@/store/chatStore";

import { deliver } from "@/lib/realtime";
import { getThreadId } from "@/lib/thread";
import type { Message } from "@/lib/models";
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

  //  Init thread + ESC close

  useEffect(() => {
    setThreadId(getThreadId());

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // BODY SCROLL LOCK (critical)

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const allMessages = useChatStore((s) => s.messages);
  const agentTyping = useChatStore((s) =>
    threadId ? s.typing[`${threadId}:${ROLE.AGENT}`] : false,
  );

  useMessageNotification(threadId);

  const messages = useMemo(() => {
    if (!threadId) return EMPTY_MESSAGES;
    return allMessages[threadId] ?? EMPTY_MESSAGES;
  }, [allMessages, threadId]);

  // Play sound ONLY on new agent message

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (!last) return;

    if (lastMessageIdRef.current === last.id) return;
    lastMessageIdRef.current = last.id;

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
      {/* 💬 Launcher */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-3xl cursor-pointer"
        aria-label="Open chat"
      >
        💬
      </button>

      {open && (
        <>
          {/* 🔒 STRONG BACKDROP (mobile only) */}
          <div
            className="
              fixed inset-0
              bg-black/70
              backdrop-blur-[2px]
              md:hidden
              z-40
            "
            onClick={() => setOpen(false)}
          />

          {/* 💬 CHAT PANEL */}
          <div
            className="
              fixed inset-0
              md:inset-auto
              md:bottom-16
              md:right-4
              md:w-80
              md:h-96
              bg-background
              border border-gray-700
              md:rounded-lg
              shadow-2xl
              flex flex-col
              z-50
            "
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-3 py-2 border-b border-gray-700 text-sm font-medium">
              <span>Live Support</span>

              <button
                className="md:hidden text-lg cursor-pointer"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>

            {!online && <OfflineBanner />}

            {/* Messages (ONLY SCROLLER) */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <MessageList
                messages={messages}
                showStatusForId={showStatusForId}
              />
            </div>

            {/* Typing indicator */}
            {agentTyping && (
              <p className="shrink-0 px-3 py-1 text-xs italic text-gray-500">
                Agent is typing…
              </p>
            )}

            {/* Input (always visible) */}
            <div className="shrink-0 border-t border-gray-700 p-2">
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
        </>
      )}
    </div>
  );
}
