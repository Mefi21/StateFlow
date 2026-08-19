import { expect, type Page } from "@playwright/test";

type RuntimeIssue = {
  route: string;
  message: string;
};

function currentRoute(page: Page) {
  try {
    return new URL(page.url()).pathname;
  } catch {
    return page.url() || "(navigation pending)";
  }
}

export function captureRuntimeErrors(page: Page) {
  const pageErrors: RuntimeIssue[] = [];
  const consoleErrors: RuntimeIssue[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push({ route: currentRoute(page), message: error.message });
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push({
        route: currentRoute(page),
        message: message.text(),
      });
    }
  });

  return { pageErrors, consoleErrors };
}

export async function waitForHydration(page: Page) {
  await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    });
  });
}
