'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useChatStore } from '@/store/chatStore';
import { getVisitorLabel } from '@/lib/visitorLabel';

export function InboxList() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const messagesByThread = useChatStore((s) => s.messages);

  // 🚨 IMPORTANT: block SSR output
  if (!mounted) {
    return (
      <p
        className="text-sm text-gray-400"
        role="status"
        aria-live="polite"
      >
        Loading conversations…
      </p>
    );
  }

  const threads = Object.entries(messagesByThread)
    .filter(([, msgs]) => msgs.length > 0)
    .map(([threadId, msgs]) => {
      const lastMessage = msgs[msgs.length - 1];
      const unreadCount = msgs.filter(
        (m) => m.sender === 'visitor' && !m.read
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
      <p
        className="text-sm text-gray-400"
        role="status"
        aria-live="polite"
      >
        No conversations yet
      </p>
    );
  }

  return (
    <ul
      role="list"
      aria-label="Conversation inbox"
      className="space-y-0 divide-y divide-gray-800"
    >
      {threads.map((t) => (
        <li
          key={t.threadId}
          className={`p-3 transition ${
            t.unreadCount > 0
              ? 'bg-gray-800'
              : 'bg-gray-900'
          }`}
        >
          <Link href={`/agent/${t.threadId}`}>
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <div className="font-medium text-sm">
                  {t.visitorLabel}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {t.lastMessage.body}
                </div>
              </div>

              {t.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {t.unreadCount}
                </span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
