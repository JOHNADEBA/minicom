"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useChatStore } from "@/store/chatStore";
import { getVisitorLabel } from "@/lib/visitorLabel";
import type { Message } from "@/lib/models";
import { ROLE } from "@/lib/constants";

import { UnreadBadge } from "@/components/ui/UnreadBadge";

const EMPTY_MESSAGES: readonly Message[] = [];

export function InboxList() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const messagesByThread = useChatStore((s) => s.messages);

  if (!mounted) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Loading conversations…
      </p>
    );
  }

  const threads = Object.entries(messagesByThread)
    .map(
      ([threadId, msgs]) =>
        [threadId, Array.isArray(msgs) ? msgs : EMPTY_MESSAGES] as const,
    )
    .filter(([, msgs]) => msgs.length > 0)
    .map(([threadId, msgs]) => {
      const lastMessage = msgs[msgs.length - 1];
      const unreadCount = msgs.filter(
        (m) => m.sender === ROLE.VISITOR && !m.read,
      ).length;

      return {
        threadId,
        visitorLabel: getVisitorLabel(threadId),
        lastMessage,
        unreadCount,
        lastActivity: lastMessage.createdAt,
      };
    })
    .sort((a, b) => {
      if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
      if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
      return b.lastActivity - a.lastActivity;
    });

  if (threads.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No conversations yet
      </p>
    );
  }

  return (
    <ul
      role="list"
      aria-label="Conversation inbox"
      className="
        divide-y
        divide-gray-200
        dark:divide-gray-800
      "
    >
      {threads.map((t) => {
        const isUnread = t.unreadCount > 0;

        return (
          <li
            key={t.threadId}
            className={`
              group
              relative
              transition-all
              duration-200
              cursor-pointer
              hover:text-white
              dark:hover:bg-gray-700
              rounded-lg
            `}
          >
            <Link href={`/agent/${t.threadId}`} className="block p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div
                    className={`
                      text-sm font-medium truncate
                      
                    `}
                  >
                    {t.visitorLabel}
                  </div>

                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {t.lastMessage.body}
                  </div>
                </div>

                <UnreadBadge count={t.unreadCount} />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
