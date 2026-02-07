"use client";

import { useEffect, useState } from "react";

import { useChatStore } from "@/store/chatStore";

import type { Message } from "@/lib/models";

import { InboxList } from "@/components/agent/InboxList";
import { UnreadBadge } from "@/components/ui/UnreadBadge";
import { ROLE } from "@/lib/constants";

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalUnread = useChatStore(
    (s) =>
      Object.values(s.messages)
        .flat()
        .filter(
          (m): m is Message =>
            Boolean(m) && m.sender === ROLE.VISITOR && !m.read,
        ).length,
  );

  return (
    <div className="h-screen flex">
      {/* Inbox */}
      <aside className="w-80 border-r border-gray-700 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Inbox</h2>

          {mounted && totalUnread > 0 && (
            <div className="relative">
              {/* message icon */}
              <span className="text-2xl">💬</span>

              {/* badge */}
              <div className="absolute -top-2 -right-2">
                <UnreadBadge count={totalUnread} size="md" />
              </div>
            </div>
          )}
        </div>

        <InboxList />
      </aside>

      {/* Chat area */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
