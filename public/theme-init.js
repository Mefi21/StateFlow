(() => {
  try {
    const theme = window.localStorage.getItem("stateflow-theme");
    if (theme === "light" || theme === "dark" || theme === "system") {
      document.documentElement.dataset.theme = theme;
    }
  } catch {
    // The server-rendered system theme remains the safe fallback.
  }
})();
