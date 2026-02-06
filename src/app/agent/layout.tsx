'use client';

import { useEffect, useState } from 'react';
import { InboxList } from '@/components/agent/InboxList';
import { useChatStore } from '@/store/chatStore';

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const totalUnread = useChatStore((s) =>
    Object.values(s.messages)
      .flat()
      .filter((m) => m.sender === 'visitor' && !m.read)
      .length
  );

  return (
    <div className="h-screen flex bg-gray-900 text-white">
      {/* Inbox */}
      <aside className="w-80 border-r border-gray-700 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Inbox</h2>

          {/* 🔐 CLIENT-ONLY */}
          {mounted && totalUnread > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>

        <InboxList />
      </aside>

      {/* Chat area */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
