"use client";

import { useLayoutEffect } from "react";
import { useTheme } from "@/components/theme/theme-provider";
import type { ThemePreference } from "@/lib/theme";

export function ThemeSync({ theme }: { theme: ThemePreference }) {
  const { setTheme } = useTheme();
  useLayoutEffect(() => {
    setTheme(theme);
  }, [setTheme, theme]);
  return null;
}
