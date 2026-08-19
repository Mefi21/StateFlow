import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  activities,
  caffeineEntries,
  dailyEntries,
  entityTags,
  goalMeasurements,
  goals,
  lifeEvents,
  medicationEvents,
  medicationPeriods,
  medications,
  metricDefinitions,
  metricValues,
  sleepRecords,
  snapshots,
  tags,
  userMetricSettings,
  userSettings,
} from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { apiError } from "@/lib/http/api-response";
import { privateNoStoreHeaders } from "@/lib/security/request";

const csvEscape = (value: unknown) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const db = getDb();
    const format = new URL(request.url).searchParams.get("format") ?? "json";
    const [
      settings,
      metricSettings,
      values,
      snapshotRows,
      dailyRows,
      sleep,
      caffeine,
      activityRows,
      medicationRows,
      medicationPeriodRows,
      medicationEventRows,
      eventRows,
      goalRows,
      measurementRows,
      tagRows,
      entityTagRows,
      definitions,
    ] = await Promise.all([
      db.select().from(userSettings).where(eq(userSettings.userId, user.id)),
      db
        .select()
        .from(userMetricSettings)
        .where(eq(userMetricSettings.userId, user.id)),
      db.select().from(metricValues).where(eq(metricValues.userId, user.id)),
      db.select().from(snapshots).where(eq(snapshots.userId, user.id)),
      db.select().from(dailyEntries).where(eq(dailyEntries.userId, user.id)),
      db.select().from(sleepRecords).where(eq(sleepRecords.userId, user.id)),
      db
        .select()
        .from(caffeineEntries)
        .where(eq(caffeineEntries.userId, user.id)),
      db.select().from(activities).where(eq(activities.userId, user.id)),
      db.select().from(medications).where(eq(medications.userId, user.id)),
      db
        .select()
        .from(medicationPeriods)
        .where(eq(medicationPeriods.userId, user.id)),
      db
        .select()
        .from(medicationEvents)
        .where(eq(medicationEvents.userId, user.id)),
      db.select().from(lifeEvents).where(eq(lifeEvents.userId, user.id)),
      db.select().from(goals).where(eq(goals.userId, user.id)),
      db
        .select()
        .from(goalMeasurements)
        .where(eq(goalMeasurements.userId, user.id)),
      db.select().from(tags).where(eq(tags.userId, user.id)),
      db.select().from(entityTags).where(eq(entityTags.userId, user.id)),
      db.select().from(metricDefinitions),
    ]);
    if (format === "csv") {
      const header = ["id", "recordedAt", "timezone", "note", "important"];
      const lines = [
        header.map(csvEscape).join(","),
        ...snapshotRows.map((row) =>
          [
            row.id,
            row.recordedAt.toISOString(),
            row.timezone,
            row.note,
            row.isImportant,
          ]
            .map(csvEscape)
            .join(","),
        ),
      ];
      return new Response(lines.join("\n"), {
        headers: {
          ...privateNoStoreHeaders(),
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": "attachment; filename=stateflow-snapshots.csv",
        },
      });
    }
    const backup = {
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      userSettings: settings,
      metricDefinitions: definitions,
      metricCustomization: metricSettings,
      entries: {
        snapshots: snapshotRows,
        daily: dailyRows,
        metricValues: values,
      },
      sleep,
      caffeine,
      activities: activityRows,
      medications: {
        definitions: medicationRows,
        periods: medicationPeriodRows,
        events: medicationEventRows,
      },
      events: eventRows,
      goals: { definitions: goalRows, measurements: measurementRows },
      tags: { definitions: tagRows, links: entityTagRows },
    };
    return new Response(JSON.stringify(backup, null, 2), {
      headers: {
        ...privateNoStoreHeaders(),
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": "attachment; filename=stateflow-backup.json",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED")
      return apiError("UNAUTHENTICATED", 401);
    return apiError("INTERNAL_ERROR", 500);
  }
}
