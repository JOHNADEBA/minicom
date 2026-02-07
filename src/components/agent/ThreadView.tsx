"use client";
import { useEffect, useState } from "react";
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

const EMPTY_MESSAGES: readonly Message[] = [];

export function ThreadView({ threadId }: { threadId: string }) {
  const [input, setInput] = useState("");
  const online = useOnline();
  const typing = useChatStore((s) => s.typing[`${threadId}:${ROLE.VISITOR}`]);
  const messages = useChatStore((s) => s.messages[threadId] ?? EMPTY_MESSAGES);
  const visitorLabel = getVisitorLabel(threadId);
  const lastMessage = messages[messages.length - 1];

  const showStatusForId =
    lastMessage && lastMessage.sender === ROLE.AGENT
      ? lastMessage.id
      : undefined;

  const sendTyping = useTyping(threadId, ROLE.AGENT);

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
    const last = messages[messages.length - 1];

    if (!last) return;

    // 🔔 agent hears visitor
    if (last.sender === ROLE.VISITOR) {
      playSound();
    }
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

  return (
    <div className="flex h-full min-h-0 flex-col ">
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="font-medium">{visitorLabel}</h3>
      </div>

      {!online && <OfflineBanner />}

      <MessageList messages={messages} showStatusForId={showStatusForId} />

      {typing && (
        <p className="px-3 text-xs italic text-gray-600">Visitor is typing…</p>
      )}

      <div className="border-t border-gray-700 p-3">
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
          placeholder="Reply to visitor…"
          className="w-full rounded-md border dark:placeholder-gray-400 border-gray-700 px-3 py-2 text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}
