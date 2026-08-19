import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

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
      const colorScheme = await page
        .locator("html")
        .evaluate((element) => getComputedStyle(element).colorScheme.trim());
      expect(colorScheme, `${route} resolved color scheme`).toContain(
        resolvedScheme,
      );

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

test("demo settings applies theme immediately without writing demo data", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => {
    window.localStorage.setItem("stateflow-theme", "system");
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
  await page.getByRole("button", { name: "Светлая" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

  await page.getByRole("button", { name: "Тёмная" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.getByRole("button", { name: "Системная" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "system");
  const resolvedScheme = await page
    .locator("html")
    .evaluate((element) => getComputedStyle(element).colorScheme.trim());
  expect(resolvedScheme).toContain("dark");

  await page.getByRole("button", { name: "Сохранить" }).click();
  expect(settingsWrites).toEqual([]);
  await expect(page.getByRole("button", { name: /Сохранить/ })).toContainText(
    "Сохранить",
  );
});
