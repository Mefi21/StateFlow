"use client";

import { useEffect } from "react";

export function ThemeSync({ theme }: { theme: string }) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return null;
}
