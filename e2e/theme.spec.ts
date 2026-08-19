import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";

const auditedRoutes = [
  "/",
  "/login",
  "/register",
  "/demo",
  "/demo/snapshot",
  "/demo/check-in",
  "/demo/timeline",
  "/demo/history",
  "/demo/analytics",
  "/demo/goals",
  "/demo/context",
  "/demo/medications",
  "/demo/reports",
  "/demo/search",
  "/demo/settings",
] as const;

const themeCases = [
  { theme: "light", preferredScheme: "dark", resolvedScheme: "light" },
  { theme: "dark", preferredScheme: "light", resolvedScheme: "dark" },
  { theme: "system", preferredScheme: "dark", resolvedScheme: "dark" },
] as const;

function routeArtifactName(route: string) {
  return route === "/" ? "home" : route.slice(1).replaceAll("/", "--");
}

const surfaceSelectors = {
  body: "body",
  appFrame: ".app-frame",
  panel: ".panel",
  sidebar: ".app-sidebar",
} as const;

async function readSurfaceColors(page: Page) {
  return page.evaluate((selectors) => {
    return Object.fromEntries(
      Object.entries(selectors).map(([name, selector]) => {
        const element = document.querySelector(selector);
        if (!element) throw new Error(`Missing theme surface: ${selector}`);
        const styles = getComputedStyle(element);
        return [
          name,
          { background: styles.backgroundColor, color: styles.color },
        ];
      }),
    );
  }, surfaceSelectors) as Promise<
    Record<string, { background: string; color: string }>
  >;
}

for (const { theme, preferredScheme, resolvedScheme } of themeCases) {
  test(`${theme} theme route, contrast, and responsive audit`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme: preferredScheme });
    await page.addInitScript((selectedTheme) => {
      window.localStorage.removeItem("stateflow-theme");
      if (selectedTheme !== "system") {
        window.localStorage.setItem("stateflow-theme", selectedTheme);
      }
    }, theme);

    const pageErrors: Array<{ route: string; message: string }> = [];
    const overflowFailures: string[] = [];
    const contrastFailures: Array<{
      route: string;
      targets: unknown[];
    }> = [];
    let activeRoute: string = auditedRoutes[0];

    page.on("pageerror", (error) => {
      pageErrors.push({ route: activeRoute, message: error.message });
    });

    for (const route of auditedRoutes) {
      activeRoute = route;
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);

      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect
        .poll(
          () =>
            page
              .locator("html")
              .evaluate((element) =>
                getComputedStyle(element).colorScheme.trim(),
              ),
          { message: `${route} resolved color scheme` },
        )
        .toContain(resolvedScheme);

      const hasHorizontalOverflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
            document.documentElement.clientWidth >
          1,
      );
      if (hasHorizontalOverflow) overflowFailures.push(route);

      const axeResult = await new AxeBuilder({ page })
        .withRules(["color-contrast"])
        .analyze();
      if (axeResult.violations.length) {
        contrastFailures.push({
          route,
          targets: axeResult.violations.flatMap((violation) =>
            violation.nodes.map((node) => node.target),
          ),
        });
      }

      if (route === "/" && theme === "dark") {
        const preview = page.locator(".product-preview");
        await expect(preview).toHaveAttribute("data-theme", "light");
        await expect
          .poll(() =>
            preview.evaluate((element) =>
              getComputedStyle(element).colorScheme.trim(),
            ),
          )
          .toContain("light");
      }

      if (theme !== "system") {
        await page.screenshot({
          path: testInfo.outputPath(
            "screenshots",
            `${routeArtifactName(route)}--${theme}.png`,
          ),
          fullPage: true,
          animations: "disabled",
        });
      }
    }

    expect(pageErrors, "uncaught page errors").toEqual([]);
    expect(overflowFailures, "routes with horizontal page overflow").toEqual(
      [],
    );
    expect(contrastFailures, "WCAG color-contrast violations").toEqual([]);
  });
}

test("demo settings controls, persists, and resolves the global theme", async ({
  page,
  browserName,
}, testInfo) => {
  test.skip(
    browserName !== "chromium",
    "Persistence flow runs once in Chromium.",
  );
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => {
    if (!window.localStorage.getItem("stateflow-theme")) {
      window.localStorage.setItem("stateflow-theme", "light");
    }
  });

  const settingsWrites: string[] = [];
  page.on("request", (request) => {
    if (
      request.method() !== "GET" &&
      new URL(request.url()).pathname === "/api/settings"
    ) {
      settingsWrites.push(request.method());
    }
  });

  await page.goto("/demo/settings");
  const lightButton = page.getByRole("button", { name: "Светлая" });
  const darkButton = page.getByRole("button", { name: "Тёмная" });
  const systemButton = page.getByRole("button", { name: "Системная" });

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(lightButton).toHaveClass(/selected/);
  expect(await page.locator("body [data-theme]").count()).toBe(0);
  const lightColors = await readSurfaceColors(page);

  await darkButton.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(darkButton).toHaveClass(/selected/);
  const darkSettingsColors = await readSurfaceColors(page);

  for (const surface of Object.keys(surfaceSelectors)) {
    expect(
      darkSettingsColors[surface].background,
      `${surface} background must differ between explicit light and dark`,
    ).not.toBe(lightColors[surface].background);
    expect(
      darkSettingsColors[surface].color,
      `${surface} text must differ between explicit light and dark`,
    ).not.toBe(lightColors[surface].color);
  }

  await page.locator(".app-sidebar .wordmark").click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const darkNavigationColors = await readSurfaceColors(page);
  expect(darkNavigationColors).toEqual(darkSettingsColors);

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await readSurfaceColors(page)).toEqual(darkNavigationColors);

  await page.goto("/demo/settings");
  await expect(darkButton).toHaveClass(/selected/);
  await lightButton.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(lightButton).toHaveClass(/selected/);
  expect(await readSurfaceColors(page)).toEqual(lightColors);

  await systemButton.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "system");
  await expect(systemButton).toHaveClass(/selected/);
  await expect.poll(() => readSurfaceColors(page)).toEqual(darkSettingsColors);

  await page.emulateMedia({ colorScheme: "light" });
  await expect.poll(() => readSurfaceColors(page)).toEqual(lightColors);

  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(() => readSurfaceColors(page)).toEqual(darkSettingsColors);

  await page.getByRole("button", { name: "Сохранить" }).click();
  expect(settingsWrites).toEqual([]);
  await expect(systemButton).toHaveClass(/selected/);

  const computedColorsPath = testInfo.outputPath("computed-colors.json");
  await writeFile(
    computedColorsPath,
    JSON.stringify({ light: lightColors, dark: darkSettingsColors }, null, 2),
  );
  await testInfo.attach("demo-computed-theme-colors", {
    path: computedColorsPath,
    contentType: "application/json",
  });
});
