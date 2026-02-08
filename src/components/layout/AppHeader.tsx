"use client";

import { useChatStore } from "@/store/chatStore";
import { ROLE } from "@/lib/constants";
import { ThemeToggle } from "../ui/ThemeToggle";
import { UnreadBadge } from "../ui/UnreadBadge";

export function AppHeader() {
  const totalUnread = useChatStore(
    (s) =>
      Object.values(s.messages)
        .flat()
        .filter((m) => m.sender === ROLE.VISITOR && !m.read).length,
  );

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-gray-700 bg-background">
      {/* Left */}
      <span className="font-semibold">Minicom</span>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* 🔔 Mobile unread badge */}
        {totalUnread > 0 && (
          <div className="relative md:hidden">
            <span className="text-3xl">💬</span>
            <span
              className="
                absolute
                -top-1
                -right-1
              "
            >
              <UnreadBadge count={totalUnread} size="md" />
            </span>
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
