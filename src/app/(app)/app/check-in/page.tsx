import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { metricDefinitions, userMetricSettings } from "@/db/schema";
import { DailyCheckinForm } from "@/features/daily-checkin/daily-checkin-form";
import { requireUser } from "@/lib/auth/session";

export default async function DailyCheckinPage() {
  const user = await requireUser();
  const settings = await getDb()
    .select({
      slug: metricDefinitions.slug,
      enabled: userMetricSettings.enabled,
      formEnabled: userMetricSettings.dailyEnabled,
      sortOrder: userMetricSettings.sortOrder,
    })
    .from(userMetricSettings)
    .innerJoin(
      metricDefinitions,
      eq(userMetricSettings.metricDefinitionId, metricDefinitions.id),
    )
    .where(eq(userMetricSettings.userId, user.id))
    .orderBy(userMetricSettings.sortOrder);
  const slugs = settings.length
    ? settings
        .filter((item) => item.enabled && item.formEnabled)
        .map((item) => item.slug)
    : undefined;
  return <DailyCheckinForm metricSlugs={slugs} />;
}
