"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "talentflow-ui-theme";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.dataset.theme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    return getSystemTheme();
  });

  useEffect(() => {
    applyTheme(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored !== "light" && stored !== "dark") {
        setThemeState(media.matches ? "dark" : "light");
      }
    };
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => (current === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme phải được sử dụng trong ThemeProvider");
  }
  return context;
}
