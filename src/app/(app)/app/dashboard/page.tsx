import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { metricDefinitions, userMetricSettings } from "@/db/schema";
import { getDashboardData } from "@/features/dashboard/queries";
import { UserDashboardView } from "@/features/dashboard/user-dashboard-view";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await requireUser();
  const [data, settings] = await Promise.all([
    getDashboardData(user.id),
    getDb()
      .select({
        slug: metricDefinitions.slug,
        enabled: userMetricSettings.enabled,
        dashboardEnabled: userMetricSettings.dashboardEnabled,
      })
      .from(userMetricSettings)
      .innerJoin(
        metricDefinitions,
        eq(userMetricSettings.metricDefinitionId, metricDefinitions.id),
      )
      .where(eq(userMetricSettings.userId, user.id))
      .orderBy(userMetricSettings.sortOrder),
  ]);
  const slugs = settings.length
    ? settings
        .filter((item) => item.enabled && item.dashboardEnabled)
        .map((item) => item.slug)
    : undefined;
  return <UserDashboardView data={data} metricSlugs={slugs} />;
}
