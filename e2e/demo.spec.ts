import { expect, test } from "@playwright/test";

test("public demo exposes real synthetic analytics", async ({ page }) => {
  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: "Добрый вечер" }),
  ).toBeVisible();
  await page.goto("/demo/analytics");
  await expect(page.getByRole("heading", { name: "Аналитика" })).toBeVisible();
  await expect(
    page.getByText("Корреляция не доказывает причинность."),
  ).toBeVisible();
});

test("demo snapshot is interactive but read-only", async ({ page }) => {
  await page.goto("/demo/snapshot");
  await page.getByLabel("Хочу своего будущего").fill("8");
  await page.getByRole("button", { name: "музыка" }).click();
  await page.getByRole("button", { name: "Сохранить снимок" }).click();
  await expect(page.getByText(/не изменила набор данных/)).toBeVisible();
});

test("history calendar works at iPhone viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/demo/history");
  await expect(page.getByRole("heading", { name: "История" })).toBeVisible();
  await expect(page.locator(".mobile-nav")).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});
