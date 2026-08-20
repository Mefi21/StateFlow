(() => {
  const isTheme = (value) =>
    value === "light" || value === "dark" || value === "system";
  let theme;

  try {
    theme = window.localStorage.getItem("stateflow-theme");
  } catch {
    // Storage can be unavailable in hardened or private browsing contexts.
  }

  if (!isTheme(theme)) {
    try {
      const prefix = "stateflow-theme=";
      const preference = document.cookie
        .split("; ")
        .find((value) => value.startsWith(prefix));
      theme = preference
        ? decodeURIComponent(preference.slice(prefix.length))
        : undefined;
    } catch {
      // The server-rendered system preference remains the safe fallback.
    }
  }

  if (isTheme(theme)) {
    document.documentElement.dataset.theme = theme;
  }
})();
