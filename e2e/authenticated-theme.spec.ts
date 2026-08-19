import { expect, test, type Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";

const username = process.env.E2E_THEME_USERNAME;
const password = process.env.E2E_PASSWORD;

test.skip(!username || !password, "Requires a dedicated E2E theme account");
test.beforeEach(({ browserName }) => {
  test.skip(
    browserName !== "chromium",
    "Authenticated theme persistence runs once; public mobile routes cover WebKit.",
  );
});

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Имя пользователя").fill(username!);
  await page.getByLabel("Пароль").fill(password!);
  const signedIn = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname.includes("/api/auth/sign-in/username"),
  );
  await page.getByRole("button", { name: "Войти" }).click();
  expect((await signedIn).ok()).toBe(true);
  await expect(page).toHaveURL(/\/app\/dashboard/);
}

async function appColors(page: Page) {
  return page.evaluate(() => {
    const selectors = {
      body: "body",
      appFrame: ".app-frame",
      panel: ".panel",
      sidebar: ".app-sidebar",
    };
    return Object.fromEntries(
      Object.entries(selectors).map(([name, selector]) => {
        const element = document.querySelector(selector);
        if (!element)
          throw new Error(`Missing authenticated surface: ${selector}`);
        const styles = getComputedStyle(element);
        return [
          name,
          { background: styles.backgroundColor, color: styles.color },
        ];
      }),
    );
  }) as Promise<Record<string, { background: string; color: string }>>;
}

async function saveSettings(page: Page) {
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/api/settings",
  );
  await page.getByRole("button", { name: "Сохранить" }).click();
  expect((await saved).ok()).toBe(true);
}

test("authenticated theme is global and survives save, navigation, and reload", async ({
  page,
}, testInfo) => {
  await login(page);
  await page.goto("/app/settings");

  const darkButton = page.getByRole("button", { name: "Тёмная" });
  await darkButton.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(darkButton).toHaveClass(/selected/);
  expect(
    await page
      .locator(".app-frame")
      .evaluate((node) => node.hasAttribute("data-theme")),
  ).toBe(false);
  await saveSettings(page);
  const darkColors = await appColors(page);
  await page.screenshot({
    path: testInfo.outputPath("screenshots", "authenticated--dark.png"),
    fullPage: true,
    animations: "disabled",
  });

  await page.goto("/app/dashboard");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.goto("/app/settings");
  await expect(darkButton).toHaveClass(/selected/);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await appColors(page)).toEqual(darkColors);

  const lightButton = page.getByRole("button", { name: "Светлая" });
  await lightButton.click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await saveSettings(page);
  const lightColors = await appColors(page);
  expect(lightColors).not.toEqual(darkColors);

  await page.goto("/app/dashboard");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.goto("/app/settings");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  expect(await appColors(page)).toEqual(lightColors);

  await page.screenshot({
    path: testInfo.outputPath("screenshots", "authenticated--light.png"),
    fullPage: true,
    animations: "disabled",
  });
  const computedColorsPath = testInfo.outputPath("computed-colors.json");
  await writeFile(
    computedColorsPath,
    JSON.stringify({ light: lightColors, dark: darkColors }, null, 2),
  );
  await testInfo.attach("authenticated-computed-theme-colors", {
    path: computedColorsPath,
    contentType: "application/json",
  });
});
