"use client";

import { ChangeEvent, KeyboardEvent } from "react";

interface ChatInputProps {
  value: string;
  placeholder?: string;
  onFocus?: () => void;

  onChange: (value: string) => void;
  onTyping?: (typing: boolean) => void;
  onSend: () => void;
}

export function ChatInput({
  value,
  placeholder,
  onFocus,
  onChange,
  onTyping,
  onSend,
}: ChatInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);

    if (onTyping) {
      onTyping(true);

      clearTimeout((onTyping as any)._t);
      (onTyping as any)._t = setTimeout(() => {
        onTyping(false);
      }, 1200);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <input
      value={value}
      onFocus={onFocus}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className="w-full rounded-md border border-gray-600 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none dark:border-gray-700"
    />
  );
}
