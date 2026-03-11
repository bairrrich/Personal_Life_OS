"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

// Create context first
const ThemeContext = React.createContext<{
  _theme: Theme;
  setTheme: (_theme: Theme) => void;
}>({
  _theme: "system",
  setTheme: () => null,
});

export function ThemeProvider({
  children,
  defaultTheme: _defaultTheme = "system",
  storageKey = "theme",
}: ThemeProviderProps) {
  // Lazy initialization for useState
  const [theme, setTheme] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return _defaultTheme;
    const stored = localStorage.getItem(storageKey);
    return (stored as Theme) || _defaultTheme;
  });

  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    const themeToApply =
      theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : theme;

    root.classList.add(themeToApply);
    root.setAttribute("data-theme", themeToApply);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => {
        const newTheme = mediaQuery.matches ? "dark" : "light";
        root.classList.remove("light", "dark");
        root.classList.add(newTheme);
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem(storageKey, theme);
  }, [theme, storageKey]);

  return (
    <ThemeContext.Provider value={{ _theme: theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  return { theme: context._theme, setTheme: context.setTheme };
};
