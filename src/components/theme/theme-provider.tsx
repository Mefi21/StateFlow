"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  applyDocumentTheme,
  normalizeTheme,
  themeChangeEvent,
  themeStorageKey,
  type ThemePreference,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: ThemePreference;
  setTheme: (value: ThemePreference) => ThemePreference;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getDocumentTheme() {
  return normalizeTheme(document.documentElement.dataset.theme);
}

function subscribeToThemeChange(onStoreChange: () => void) {
  function handleStorage(event: StorageEvent) {
    if (event.key !== themeStorageKey) return;
    applyDocumentTheme(event.newValue, { persist: false });
    onStoreChange();
  }

  window.addEventListener(themeChangeEvent, onStoreChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(themeChangeEvent, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: ThemePreference;
}) {
  const theme = useSyncExternalStore(
    subscribeToThemeChange,
    getDocumentTheme,
    () => initialTheme,
  );

  const setTheme = useCallback((value: ThemePreference) => {
    const appliedTheme = applyDocumentTheme(value, { persist: true });
    window.dispatchEvent(new Event(themeChangeEvent));
    return appliedTheme;
  }, []);

  useLayoutEffect(() => {
    applyDocumentTheme(getDocumentTheme(), { persist: true });
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      document.documentElement.dataset.hydrated = "true";
    });
    return () => {
      window.cancelAnimationFrame(frame);
      delete document.documentElement.dataset.hydrated;
    };
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [setTheme, theme]);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
