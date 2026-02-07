"use client";

import { useEffect, useState } from "react";

import { useChatStore } from "@/store/chatStore";

import { Message } from "@/lib/models";
import { getRole } from "@/lib/role";
import { MESSAGE_STATUS } from "@/lib/constants";

interface Props {
  message: Message;
  showStatus?: boolean;
}

export function MessageBubble({ message, showStatus = false }: Props) {
  const [mounted, setMounted] = useState(false);
  const [isMine, setIsMine] = useState(false);

  useEffect(() => {
    const role = getRole();
    setIsMine(message.sender === role);
    setMounted(true);
  }, [message.sender]);

  const retry = () => {
    useChatStore.getState().retryMessage(message.id);
  };

  // 🔑 Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[75%] rounded-lg px-3 py-2 text-sm shadow ${
          isMine ? "bg-blue-900 text-white" : "bg-gray-700 text-white"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.body}</p>

        {/* ✅ STATUS / RETRY — ONLY FOR LATEST MESSAGE */}
        {isMine && showStatus && message.status && (
          <div className="mt-1 flex items-center justify-end gap-2 text-[10px] opacity-80">
            <span>{message.status}</span>

            {message.status === MESSAGE_STATUS.FAILED && (
              <button
                onClick={retry}
                aria-label="Retry message"
                title="Retry sending"
                className="
                  ml-1
                  inline-flex
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/30
                  px-1.5
                  py-0.5
                  text-xs
                  hover:bg-white/20
                  hover:border-white
                  cursor-pointer
                  transition
                "
              >
                🔄
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
