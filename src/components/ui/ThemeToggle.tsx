"use client";

import { useEffect, useState } from "react";
import { toggleTheme, getTheme } from "@/lib/theme";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setThemeState(getTheme());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => {
        toggleTheme();
        setThemeState(getTheme());
      }}
      aria-label="Toggle theme"
      className="
        rounded-full
        bg-gray-700
        px-3
        py-2
        text-sm
        text-white
        shadow
        hover:bg-gray-600
        cursor-pointer
      "
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
