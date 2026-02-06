'use client';

import { toggleTheme, getTheme } from '@/lib/theme';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setThemeState(getTheme());
    setMounted(true);
  }, []);

  if (!mounted) return null; // 🔑 hydration-safe

  return (
    <button
      onClick={() => {
        toggleTheme();
        setThemeState(getTheme());
      }}
      aria-label="Toggle theme"
      className="
        fixed
        bottom-4
        left-8
        z-50
        rounded-full
        bg-gray-700
        px-3
        py-2
        text-sm
        text-white
        shadow
      "
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}
