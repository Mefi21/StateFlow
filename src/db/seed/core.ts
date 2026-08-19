import { getDb } from "@/db";
import { metricDefinitions } from "@/db/schema";
import { coreMetrics } from "@/features/metrics/definitions";

export async function seedCoreMetrics(db = getDb()) {
  for (const [sortOrder, metric] of coreMetrics.entries()) {
    await db
      .insert(metricDefinitions)
      .values({
        slug: metric.slug,
        name: metric.name,
        shortName: metric.shortName,
        description: metric.question,
        category: metric.category,
        direction: metric.direction,
        sortOrder,
        isCore: true,
        defaultEnabled: true,
        snapshotEnabled: metric.snapshotEnabled,
        dailyEnabled: metric.dailyEnabled,
      })
      .onConflictDoUpdate({
        target: metricDefinitions.slug,
        set: {
          name: metric.name,
          shortName: metric.shortName,
          description: metric.question,
          category: metric.category,
          direction: metric.direction,
          sortOrder,
          snapshotEnabled: metric.snapshotEnabled,
          dailyEnabled: metric.dailyEnabled,
        },
      });
  }
}
