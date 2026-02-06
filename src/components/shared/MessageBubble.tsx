'use client';

import { useEffect, useState } from 'react';
import { Message } from '@/lib/models';
import { getRole } from '@/lib/role';

interface Props {
  message: Message;
  showStatus?: boolean;
}

export function MessageBubble({
  message,
  showStatus = false,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🚨 Prevent SSR mismatch
  if (!mounted) {
    return null;
  }

  const role = getRole();
const isMine = message.sender === role;


  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow ${
          isMine
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-white'
        }`}
      >
        <p className="whitespace-pre-wrap">
          {message.body}
        </p>

        {showStatus && isMine && message.status && (
          <div className="mt-1 text-[10px] opacity-70 text-right">
            {message.status}
          </div>
        )}
      </div>
    </div>
  );
}
