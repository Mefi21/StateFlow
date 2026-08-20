import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";
import { getDb } from "@/db";
import { userSettings } from "@/db/schema";

/** Deduplicates a user's preferences within one server render only. */
export const getUserPreferences = cache(async (userId: string) => {
  const [settings] = await getDb()
    .select({
      theme: userSettings.theme,
      timezone: userSettings.timezone,
      targetSleepMinutes: userSettings.targetSleepMinutes,
      morningCheckInEnabled: userSettings.morningCheckInEnabled,
    })
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  return settings ?? null;
});
