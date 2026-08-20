import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { metricDefinitions, userMetricSettings } from "@/db/schema";
import { coreMetrics } from "@/features/metrics/definitions";
import { SettingsView } from "@/features/settings/settings-view";
import { requireUser } from "@/lib/auth/session";
import { getUserPreferences } from "@/lib/user-preferences";
export default async function SettingsPage() {
  const user = await requireUser();
  const db = getDb();
  const [settings, metricSettings] = await Promise.all([
    getUserPreferences(user.id),
    db
      .select({
        slug: metricDefinitions.slug,
        enabled: userMetricSettings.enabled,
        snapshotEnabled: userMetricSettings.snapshotEnabled,
        dailyEnabled: userMetricSettings.dailyEnabled,
        dashboardEnabled: userMetricSettings.dashboardEnabled,
        sortOrder: userMetricSettings.sortOrder,
      })
      .from(userMetricSettings)
      .innerJoin(
        metricDefinitions,
        eq(userMetricSettings.metricDefinitionId, metricDefinitions.id),
      )
      .where(eq(userMetricSettings.userId, user.id)),
  ]);
  return (
    <SettingsView
      admin={user.role === "admin"}
      initial={{
        theme: settings?.theme ?? "system",
        timezone: settings?.timezone ?? "UTC",
        targetSleepMinutes: settings?.targetSleepMinutes ?? 420,
        morningCheckInEnabled: settings?.morningCheckInEnabled ?? false,
      }}
      metrics={coreMetrics}
      initialMetricSettings={metricSettings}
    />
  );
}
