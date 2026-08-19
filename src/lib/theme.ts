export const themePreferences = ["light", "dark", "system"] as const;

export type ThemePreference = (typeof themePreferences)[number];

export const themeStorageKey = "stateflow-theme";

export function normalizeTheme(value: unknown): ThemePreference {
  return themePreferences.includes(value as ThemePreference)
    ? (value as ThemePreference)
    : "system";
}

export function applyDocumentTheme(
  value: unknown,
  { persist = false }: { persist?: boolean } = {},
) {
  const theme = normalizeTheme(value);
  document.documentElement.dataset.theme = theme;
  if (persist) {
    try {
      window.localStorage.setItem(themeStorageKey, theme);
    } catch {
      // Storage can be unavailable in hardened or private browsing contexts.
    }
  }
  return theme;
}
