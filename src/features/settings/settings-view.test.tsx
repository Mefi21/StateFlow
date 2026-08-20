// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SettingsView } from "./settings-view";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/components/theme/theme-provider", () => ({
  useTheme: () => ({ theme: "system", setTheme: vi.fn() }),
}));

vi.mock("@/lib/auth/auth-client", () => ({
  authClient: { signOut: vi.fn() },
}));

describe("SettingsView", () => {
  it("announces a successful save with visible status text", async () => {
    const user = userEvent.setup();

    render(
      <SettingsView
        initial={{
          theme: "system",
          timezone: "Europe/Moscow",
          targetSleepMinutes: 480,
          morningCheckInEnabled: false,
        }}
        metrics={[]}
        demo
      />,
    );

    await user.click(screen.getByRole("button", { name: "Сохранить" }));

    expect(screen.getByRole("status").textContent).toBe("Настройки сохранены.");
  });
});
