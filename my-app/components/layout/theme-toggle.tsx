"use client";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/app/providers/theme-provider";

const ICON = {
  light: "☀️",
  dark: "🌙",
} as const;

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  const nextLabel = theme === "light" ? "Đổi sang tối" : "Đổi sang sáng";
  const ariaLabel = theme === "light" ? "Chuyển sang giao diện tối" : "Chuyển sang giao diện sáng";

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      aria-label={ariaLabel}
      className="text-xs font-medium"
    >
      <span aria-hidden="true" className="text-base">
        {ICON[theme === "dark" ? "dark" : "light"]}
      </span>
      <span className="hidden sm:inline">{nextLabel}</span>
    </Button>
  );
}
