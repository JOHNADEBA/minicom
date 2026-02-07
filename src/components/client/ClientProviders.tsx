"use client";

import { useEffect } from "react";

import { useChatStore } from "@/store/chatStore";

import { initRealtime } from "@/lib/realtime";
import { getTheme, setTheme } from "@/lib/theme";
import { initSound } from "@/lib/sound";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initRealtime();

    initSound();

    setTheme(getTheme());

    if (navigator.onLine) {
      useChatStore.getState().retryOffline();
    }

    const onOnline = () => useChatStore.getState().retryOffline();
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("online", onOnline);
    };
  }, []);

  return <>{children}</>;
}
