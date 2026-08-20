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

test("mobile shell stays fixed and keeps long forms reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });

  for (const route of ["/demo", "/demo/history", "/demo/analytics"]) {
    await page.goto(route);
    const nav = page.locator(".mobile-nav");
    await expect(nav).toBeVisible();
    await expect
      .poll(async () => {
        const box = await nav.boundingBox();
        return box ? Math.round(box.y + box.height) : 0;
      })
      .toBe(852);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      ),
    ).toBe(false);
  }

  await page.goto("/demo/snapshot");
  const save = page.getByRole("button", { name: "Сохранить снимок" });
  await save.scrollIntoViewIfNeeded();
  const [saveBox, navBox] = await Promise.all([
    save.boundingBox(),
    page.locator(".mobile-nav").boundingBox(),
  ]);
  expect(saveBox).not.toBeNull();
  expect(navBox).not.toBeNull();
  expect(saveBox!.y + saveBox!.height).toBeLessThanOrEqual(navBox!.y);

  await page.goto("/demo/settings");
  await expect(page.locator(".metric-setting-toggle em").first()).toHaveText(
    "Вкл.",
  );
  await expect(page.locator(".metric-setting-toggle em").nth(1)).toHaveText(
    "Снимок",
  );
  const firstMetricName = page.locator(".metric-setting-row strong").first();
  await expect(firstMetricName).toHaveCSS("white-space", "normal");

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect
    .poll(() =>
      page.evaluate(() =>
        Math.abs(
          document.documentElement.scrollHeight -
            (window.scrollY + window.innerHeight),
        ),
      ),
    )
    .toBeLessThanOrEqual(1);
});
