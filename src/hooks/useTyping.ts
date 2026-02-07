"use client";

import { useRef, useEffect, useCallback } from "react";
import debounce from "lodash.debounce";
import type { DebouncedFunc } from "lodash";

import { sendTyping } from "@/lib/realtime";
import type { Sender } from "@/lib/models";

export function useTyping(threadId: string | null, sender: Sender) {
  const ref = useRef<DebouncedFunc<(typing: boolean) => void> | null>(null);

  useEffect(() => {
    if (!threadId) return;

    ref.current = debounce((typing: boolean) => {
      sendTyping({
        threadId,
        sender,
        typing,
      });
    }, 300);

    return () => {
      ref.current?.cancel();
      ref.current = null;
    };
  }, [threadId, sender]);

  return useCallback((typing: boolean) => {
    ref.current?.(typing);
  }, []);
}
