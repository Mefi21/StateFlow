import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  caffeineEntries,
  dailyEntries,
  goals,
  lifeEvents,
  medicationEvents,
  medications,
  sleepRecords,
  snapshots,
} from "@/db/schema";
import {
  TimelineView,
  type TimelineItem,
} from "@/features/timeline/timeline-view";
import { requireUser } from "@/lib/auth/session";
export default async function TimelinePage() {
  const user = await requireUser();
  const db = getDb();
  const [
    snapshotRows,
    sleepRows,
    caffeineRows,
    dailyRows,
    eventRows,
    medicationRows,
    goalRows,
  ] = await Promise.all([
    db
      .select()
      .from(snapshots)
      .where(eq(snapshots.userId, user.id))
      .orderBy(desc(snapshots.recordedAt))
      .limit(50),
    db
      .select()
      .from(sleepRecords)
      .where(eq(sleepRecords.userId, user.id))
      .orderBy(desc(sleepRecords.wokeUpAt))
      .limit(20),
    db
      .select()
      .from(caffeineEntries)
      .where(eq(caffeineEntries.userId, user.id))
      .orderBy(desc(caffeineEntries.recordedAt))
      .limit(30),
    db
      .select()
      .from(dailyEntries)
      .where(eq(dailyEntries.userId, user.id))
      .orderBy(desc(dailyEntries.entryDate))
      .limit(30),
    db
      .select()
      .from(lifeEvents)
      .where(eq(lifeEvents.userId, user.id))
      .orderBy(desc(lifeEvents.recordedAt))
      .limit(30),
    db
      .select({
        id: medicationEvents.id,
        recordedAt: medicationEvents.recordedAt,
        eventType: medicationEvents.eventType,
        name: medications.name,
        previousDose: medicationEvents.previousDose,
        newDose: medicationEvents.newDose,
      })
      .from(medicationEvents)
      .innerJoin(medications, eq(medicationEvents.medicationId, medications.id))
      .where(eq(medicationEvents.userId, user.id))
      .orderBy(desc(medicationEvents.recordedAt))
      .limit(30),
    db
      .select()
      .from(goals)
      .where(eq(goals.userId, user.id))
      .orderBy(desc(goals.startedAt))
      .limit(30),
  ]);
  const items: TimelineItem[] = [
    ...snapshotRows.map((row) => ({
      id: row.id,
      timestamp: row.recordedAt.toISOString(),
      type: "snapshot" as const,
      title: row.note || "Снимок состояния",
      important: row.isImportant,
      href: `/app/snapshots/${row.id}/edit`,
    })),
    ...sleepRows.map((row) => ({
      id: row.id,
      timestamp: row.wokeUpAt.toISOString(),
      type: "sleep" as const,
      title: `${(row.sleepDurationMinutes / 60).toFixed(1)} ч сна`,
      detail:
        row.subjectiveSleepQuality === null
          ? undefined
          : `Качество ${row.subjectiveSleepQuality}/10`,
    })),
    ...caffeineRows.map((row) => ({
      id: row.id,
      timestamp: row.recordedAt.toISOString(),
      type: "caffeine" as const,
      title: `${row.beverageType} · ${row.caffeineMg} мг`,
    })),
    ...dailyRows.map((row) => ({
      id: row.id,
      timestamp: new Date(`${row.entryDate}T20:00:00Z`).toISOString(),
      type: "event" as const,
      title: row.isDraft ? "Черновик Daily Check-in" : "Daily Check-in",
      detail: row.note ? "Добавлена личная заметка" : undefined,
    })),
    ...eventRows.map((row) => ({
      id: row.id,
      timestamp: row.recordedAt.toISOString(),
      type: "event" as const,
      title: row.title,
      detail: `${row.category} · ${row.valence} · интенсивность ${row.intensity.toFixed(1)}`,
    })),
    ...medicationRows.map((row) => ({
      id: row.id,
      timestamp: row.recordedAt.toISOString(),
      type: "medication" as const,
      title: `${row.name} · ${row.eventType}`,
      detail:
        row.newDose === null
          ? undefined
          : `${row.previousDose ?? "—"} → ${row.newDose}`,
    })),
    ...goalRows.map((row) => ({
      id: row.id,
      timestamp: new Date(`${row.startedAt}T12:00:00Z`).toISOString(),
      type: "goal" as const,
      title: row.title,
      detail: `${row.category} · прогресс ${row.progress}%`,
    })),
  ].toSorted((a, b) => b.timestamp.localeCompare(a.timestamp));
  return <TimelineView items={items} />;
}
