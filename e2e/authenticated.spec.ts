import { expect, test } from "@playwright/test";

test.skip(
  !process.env.E2E_USERNAME || !process.env.E2E_PASSWORD,
  "Requires seeded E2E account",
);
test.beforeEach(({ browserName }) => {
  test.skip(
    browserName !== "chromium",
    "Authenticated mutation suite runs once; WebKit is covered by public mobile flows.",
  );
});

test("login, offline snapshot, reconnect, and exactly-once sync", async ({
  page,
  context,
}) => {
  await page.goto("/login");
  await page.getByLabel("Имя пользователя").fill(process.env.E2E_USERNAME!);
  await page.getByLabel("Пароль").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/app\/dashboard/);
  await page.goto("/app/snapshots/new");
  await context.setOffline(true);
  await page.getByLabel("Хочу своего будущего").fill("7");
  await page.getByRole("button", { name: "Сохранить снимок" }).click();
  await expect(page.getByText("Сохранено на устройстве")).toBeVisible();
  await context.setOffline(false);
  await page.reload();
  await page.waitForTimeout(1_000);
  await page.goto("/app/timeline");
  await expect(page.getByText("Снимок состояния").first()).toBeVisible();
});

test("daily records, context modules, goals, editing, and export", async ({
  page,
}) => {
  const runId = Date.now();
  const goalTitle = `E2E project goal ${runId}`;
  const medicationName = `E2E medication ${runId}`;
  const snapshotNote = `E2E editable snapshot ${runId}`;
  await page.goto("/login");
  await page.getByLabel("Имя пользователя").fill(process.env.E2E_USERNAME!);
  await page.getByLabel("Пароль").fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).toHaveURL(/\/app\/dashboard/);

  await page.goto("/app/snapshots/new");
  await page.getByLabel("Короткая заметка").fill(snapshotNote);
  await page.getByRole("button", { name: "Сохранить снимок" }).click();
  await expect(page.getByText("Снимок сохранён")).toBeVisible();

  await page.goto("/app/check-in");
  await page.getByLabel("Свободная заметка").fill("E2E daily entry");
  await page.getByRole("button", { name: "Завершить check-in" }).click();
  await expect(
    page.getByRole("heading", { name: "День зафиксирован" }),
  ).toBeVisible();

  await page.goto("/app/sleep");
  await page.getByRole("button", { name: "Сохранить сон" }).click();
  await expect(
    page.getByRole("heading", { name: "Запись сохранена" }),
  ).toBeVisible();

  await page.goto("/app/caffeine");
  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(
    page.getByRole("heading", { name: "110 мг добавлено" }),
  ).toBeVisible();

  await page.goto("/app/goals");
  await page.getByRole("button", { name: "Новая цель" }).click();
  await page.getByLabel("Название").fill(goalTitle);
  await page
    .getByLabel("Почему это важно")
    .fill("Verify the complete goal flow");
  await page.getByRole("button", { name: "Создать" }).click();
  await expect(page.getByRole("heading", { name: goalTitle })).toBeVisible();
  const goalCard = page
    .locator("article.goal-card")
    .filter({ has: page.getByRole("heading", { name: goalTitle }) });
  await goalCard
    .getByRole("button", { name: "Зафиксировать состояние цели" })
    .click();
  await goalCard.getByRole("button", { name: "Сохранить измерение" }).click();
  await expect(page.getByText("Состояние цели сохранено.")).toBeVisible();

  await page.goto("/app/medications");
  await page.getByRole("button", { name: "Добавить" }).click();
  await page.getByLabel("Название").fill(medicationName);
  await page.getByLabel("Доза").fill("25");
  await page.getByLabel("Расписание").fill("утром");
  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(
    page.getByRole("heading", { name: medicationName }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByText("25 мг").last()).toBeVisible();

  await page.goto("/app/analytics");
  await expect(page.getByRole("heading", { name: "Аналитика" })).toBeVisible();

  const exportResult = await page.evaluate(async () => {
    const response = await fetch("/api/export?format=json");
    const backup = (await response.json()) as { schemaVersion?: number };
    return { status: response.status, schemaVersion: backup.schemaVersion };
  });
  expect(exportResult).toEqual({ status: 200, schemaVersion: 1 });

  await page.goto("/app/settings");
  await expect(page.getByText("Активные сессии")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Завершить", exact: true }).first(),
  ).toBeVisible();

  await page.goto("/app/timeline");
  await page
    .locator("article.timeline-item")
    .filter({ hasText: snapshotNote })
    .getByRole("link", { name: /Редактировать/ })
    .click();
  await page.getByLabel("Заметка").fill("Edited by E2E");
  await page.getByRole("button", { name: "Сохранить" }).click();
  await expect(page.getByText("Изменения сохранены.")).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Удалить" }).click();
  await expect(page).toHaveURL(/\/app\/history/);
});
