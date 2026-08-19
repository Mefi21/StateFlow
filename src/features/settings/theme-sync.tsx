"use client";

import { useLayoutEffect } from "react";
import { applyDocumentTheme, type ThemePreference } from "@/lib/theme";

export function ThemeSync({ theme }: { theme: ThemePreference }) {
  useLayoutEffect(() => {
    applyDocumentTheme(theme, { persist: true });
  }, [theme]);
  return null;
}
