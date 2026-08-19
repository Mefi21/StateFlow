import "server-only";

import { and, desc, eq, gte } from "drizzle-orm";
import { getDb } from "@/db";
import {
  caffeineEntries,
  metricDefinitions,
  metricValues,
  sleepRecords,
  snapshots,
  userSettings,
} from "@/db/schema";
import { median } from "@/lib/statistics";

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

export async function getDashboardData(userId: string) {
  const db = getDb();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const today = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [values, snapshotRows, sleep, caffeine, settingsRows] =
    await Promise.all([
      db
        .select({
          slug: metricDefinitions.slug,
          value: metricValues.value,
          recordedAt: metricValues.recordedAt,
          entryType: metricValues.entryType,
        })
        .from(metricValues)
        .innerJoin(
          metricDefinitions,
          eq(metricValues.metricDefinitionId, metricDefinitions.id),
        )
        .where(
          and(
            eq(metricValues.userId, userId),
            gte(metricValues.recordedAt, since),
          ),
        )
        .orderBy(metricValues.recordedAt),
      db
        .select()
        .from(snapshots)
        .where(
          and(eq(snapshots.userId, userId), gte(snapshots.recordedAt, since)),
        )
        .orderBy(desc(snapshots.recordedAt)),
      db
        .select()
        .from(sleepRecords)
        .where(eq(sleepRecords.userId, userId))
        .orderBy(desc(sleepRecords.sleepStartedAt))
        .limit(1),
      db
        .select({
          caffeineMg: caffeineEntries.caffeineMg,
          recordedAt: caffeineEntries.recordedAt,
        })
        .from(caffeineEntries)
        .where(
          and(
            eq(caffeineEntries.userId, userId),
            gte(caffeineEntries.recordedAt, today),
          ),
        ),
      db
        .select({ timezone: userSettings.timezone })
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1),
    ]);

  const timezone = settingsRows[0]?.timezone ?? "UTC";
  const localDate = (date: Date) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value ?? "";
    return `${part("year")}-${part("month")}-${part("day")}`;
  };
  const grouped = new Map<
    string,
    Map<string, { daily: number[]; snapshots: number[] }>
  >();
  for (const row of values) {
    const date = localDate(row.recordedAt);
    const metrics =
      grouped.get(date) ??
      new Map<string, { daily: number[]; snapshots: number[] }>();
    const valuesForMetric = metrics.get(row.slug) ?? {
      daily: [],
      snapshots: [],
    };
    if (row.entryType === "daily") valuesForMetric.daily.push(row.value);
    else if (row.entryType === "snapshot")
      valuesForMetric.snapshots.push(row.value);
    metrics.set(row.slug, valuesForMetric);
    grouped.set(date, metrics);
  }
  const dailySeries = [...grouped].map(([date, metrics]) => ({
    date,
    metrics: Object.fromEntries(
      [...metrics].map(([slug, metricData]) => [
        slug,
        median(
          metricData.daily.length ? metricData.daily : metricData.snapshots,
        ) ?? 0,
      ]),
    ),
  }));

  const latestSnapshots = snapshotRows.slice(0, 2);
  const latest = latestSnapshots[0] ?? null;
  const latestMetrics = latest
    ? Object.fromEntries(
        values
          .filter(
            (row) => row.recordedAt.getTime() === latest.recordedAt.getTime(),
          )
          .map((row) => [row.slug, row.value]),
      )
    : {};
  const previous = latestSnapshots[1];
  const previousMetrics = previous
    ? Object.fromEntries(
        values
          .filter(
            (row) => row.recordedAt.getTime() === previous.recordedAt.getTime(),
          )
          .map((row) => [row.slug, row.value]),
      )
    : {};

  return {
    latest,
    latestMetrics,
    previousMetrics,
    dailySeries,
    sleep: sleep[0] ?? null,
    caffeineMg: caffeine.reduce((total, entry) => total + entry.caffeineMg, 0),
    snapshotCounts: Object.fromEntries(
      snapshotRows.reduce((counts, row) => {
        const date = localDate(row.recordedAt);
        counts.set(date, (counts.get(date) ?? 0) + 1);
        return counts;
      }, new Map<string, number>()),
    ),
  };
}
