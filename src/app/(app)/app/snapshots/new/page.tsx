import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { metricDefinitions, userMetricSettings } from "@/db/schema";
import { SnapshotForm } from "@/features/snapshots/snapshot-form";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Новый снимок" };
export default async function NewSnapshotPage() {
  const user = await requireUser();
  const settings = await getDb()
    .select({
      slug: metricDefinitions.slug,
      enabled: userMetricSettings.enabled,
      formEnabled: userMetricSettings.snapshotEnabled,
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
  return <SnapshotForm metricSlugs={slugs} />;
}
