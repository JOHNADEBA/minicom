"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/store/chatStore";
import { ROLE } from "@/lib/constants";

export function useMessageNotification(threadId?: string | null) {
  const lastCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/notify.mp4");
  }, []);

  useEffect(() => {
    if (!threadId) return;

    const unsubscribe = useChatStore.subscribe((state) => {
      const messages = state.messages[threadId] ?? [];
      const count = messages.length;

      // only react to NEW incoming messages
      if (count > lastCountRef.current) {
        const last = messages[count - 1];

        // 🔔 only notify on incoming messages
        if (last.sender === ROLE.VISITOR) {
          // page not focused OR chat closed
          if (document.hidden) {
            audioRef.current?.play().catch(() => {});
          }
        }
      }

      lastCountRef.current = count;
    });

    return unsubscribe;
  }, [threadId]);
}
