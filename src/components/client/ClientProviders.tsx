'use client';

import { useEffect } from 'react';
import { initRealtime } from '@/lib/realtime';
import { useChatStore } from '@/store/chatStore';
import { getTheme, setTheme } from '@/lib/theme';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initRealtime();

    // apply persisted theme immediately
    setTheme(getTheme());

    window.addEventListener('online', () =>
      useChatStore.getState().retryOffline()
    );
  }, []);

  return <>{children}</>;
}
