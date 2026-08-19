import "dotenv/config";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { closeDb, getDb } from "@/db";
import {
  activities,
  caffeineEntries,
  dailyEntries,
  goals,
  lifeEvents,
  medicationEvents,
  medicationPeriods,
  medications,
  metricDefinitions,
  metricValues,
  sleepRecords,
  snapshots,
  userSettings,
  users,
} from "@/db/schema";
import { demoDays } from "@/features/demo/data";
import { seedCoreMetrics } from "./core";

const demoUserId = "stateflow-demo-user";
const chunk = <T>(values: T[], size: number) =>
  Array.from({ length: Math.ceil(values.length / size) }, (_, index) =>
    values.slice(index * size, (index + 1) * size),
  );

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  await seedCoreMetrics();
  const db = getDb();
  const definitions = await db
    .select({ id: metricDefinitions.id, slug: metricDefinitions.slug })
    .from(metricDefinitions);
  const ids = new Map(
    definitions.map((definition) => [definition.slug, definition.id]),
  );

  await db.transaction(async (tx) => {
    await tx.delete(users).where(eq(users.id, demoUserId));
    await tx.insert(users).values({
      id: demoUserId,
      name: "Demo profile",
      email: "demo@stateflow.invalid",
      username: "demo",
      displayUsername: "demo",
      role: "user",
      emailVerified: false,
    });
    await tx
      .insert(userSettings)
      .values({ userId: demoUserId, timezone: "Europe/Moscow", isDemo: true });

    const dailyRows = await tx
      .insert(dailyEntries)
      .values(
        demoDays.map((day) => ({
          userId: demoUserId,
          entryDate: day.date,
          timezone: "Europe/Moscow",
          contextualAnswers: {},
          note: null,
        })),
      )
      .returning({ id: dailyEntries.id, date: dailyEntries.entryDate });
    const dateToDailyId = new Map(
      dailyRows.map((entry) => [entry.date, entry.id]),
    );
    const valueRows = demoDays.flatMap((day) => {
      const values = {
        future_wanting: day.futureWanting,
        anticipation: day.anticipation,
        current_pleasure: day.pleasure,
        life_interest: day.lifeInterest,
        energy: day.energy,
        anxiety: day.anxiety,
        activation: day.activation,
        mastery: day.mastery,
        goal_drive: day.goalDrive,
        pride: day.pride,
        escape_urge: day.escapeUrge,
        emotional_intensity: day.emotionalIntensity,
      };
      return Object.entries(values).map(([slug, value]) => ({
        userId: demoUserId,
        metricDefinitionId: ids.get(slug)!,
        entryType: "daily",
        entryId: dateToDailyId.get(day.date)!,
        value,
        recordedAt: new Date(`${day.date}T18:00:00.000Z`),
      }));
    });
    for (const rows of chunk(valueRows, 1000))
      await tx.insert(metricValues).values(rows);

    await tx.insert(sleepRecords).values(
      demoDays.map((day) => {
        const woke = new Date(`${day.date}T04:30:00.000Z`);
        const started = new Date(woke.getTime() - day.sleepHours * 3_600_000);
        return {
          userId: demoUserId,
          sleepDate: day.date,
          timezone: "Europe/Moscow",
          sleepStartedAt: started,
          wokeUpAt: woke,
          sleepDurationMinutes: Math.round(day.sleepHours * 60),
          timeInBedMinutes: Math.round(day.sleepHours * 60 + 18),
          sleepMidpoint: new Date((started.getTime() + woke.getTime()) / 2),
          awakeningsCount: Math.round(day.anxiety / 4),
          subjectiveSleepQuality: Math.max(0, Math.min(10, day.sleepHours - 1)),
        };
      }),
    );
    await tx.insert(caffeineEntries).values(
      demoDays
        .filter((day) => day.caffeineMg > 0)
        .map((day) => ({
          userId: demoUserId,
          recordedAt: new Date(`${day.date}T08:30:00.000Z`),
          timezone: "Europe/Moscow",
          beverageType: "coffee",
          caffeineMg: day.caffeineMg,
          amount: "synthetic daily total",
        })),
    );
    await tx.insert(activities).values(
      demoDays.flatMap((day) => [
        {
          userId: demoUserId,
          category: "work",
          startedAt: new Date(`${day.date}T06:00:00.000Z`),
          durationMinutes: day.workMinutes,
        },
        ...(day.programmingMinutes
          ? [
              {
                userId: demoUserId,
                category: "programming",
                startedAt: new Date(`${day.date}T15:00:00.000Z`),
                durationMinutes: day.programmingMinutes,
                mastery: day.mastery,
              },
            ]
          : []),
        ...(day.walkingMinutes
          ? [
              {
                userId: demoUserId,
                category: "walking",
                startedAt: new Date(`${day.date}T16:30:00.000Z`),
                durationMinutes: day.walkingMinutes,
                enjoyment: day.pleasure,
              },
            ]
          : []),
      ]),
    );

    for (const [index, day] of demoDays.entries()) {
      const snapshotId = randomUUID();
      const recordedAt = new Date(
        `${day.date}T15:${String((index * 7) % 60).padStart(2, "0")}:00.000Z`,
      );
      await tx.insert(snapshots).values({
        id: snapshotId,
        userId: demoUserId,
        recordedAt,
        timezone: "Europe/Moscow",
        note:
          index % 41 === 0
            ? "Finished a project task and went for an evening walk."
            : null,
        isImportant: index % 79 === 0,
      });
      const snapshotValues = {
        future_wanting: day.futureWanting,
        current_pleasure: day.pleasure,
        energy: day.energy,
        anxiety: day.anxiety,
        activation: day.activation,
        emotional_intensity: day.emotionalIntensity,
        escape_urge: day.escapeUrge,
      };
      await tx.insert(metricValues).values(
        Object.entries(snapshotValues).map(([slug, value]) => ({
          userId: demoUserId,
          metricDefinitionId: ids.get(slug)!,
          entryType: "snapshot",
          entryId: snapshotId,
          value,
          recordedAt,
        })),
      );
    }

    const [medication] = await tx
      .insert(medications)
      .values({
        userId: demoUserId,
        name: "Synthetic medication",
        genericName: "Demo-only record",
        unit: "mg",
      })
      .returning({ id: medications.id });
    await tx.insert(medicationPeriods).values({
      userId: demoUserId,
      medicationId: medication.id,
      startDate: "2026-05-18",
      dose: 50,
      schedule: "morning",
      note: "Synthetic data only",
    });
    await tx.insert(medicationEvents).values({
      userId: demoUserId,
      medicationId: medication.id,
      eventType: "started",
      recordedAt: new Date("2026-05-18T09:00:00.000Z"),
      newDose: 50,
    });
    await tx.insert(lifeEvents).values([
      {
        userId: demoUserId,
        title: "Started a new project",
        recordedAt: new Date("2026-03-12T12:00:00.000Z"),
        category: "work",
        valence: "mixed",
        intensity: 7,
        note: "Synthetic event",
      },
      {
        userId: demoUserId,
        title: "Short vacation",
        recordedAt: new Date("2026-07-02T12:00:00.000Z"),
        category: "travel",
        valence: "positive",
        intensity: 6,
        note: "Synthetic event",
      },
    ]);
    await tx.insert(goals).values([
      {
        userId: demoUserId,
        title: "Become a stronger developer",
        whyItMatters: "Build complex systems with confidence",
        startedAt: "2025-10-01",
        targetDate: "2026-12-31",
        progress: 68,
        category: "development",
      },
      {
        userId: demoUserId,
        title: "Walk consistently",
        whyItMatters: "Create space for thought and context changes",
        startedAt: "2026-02-01",
        progress: 42,
        category: "wellbeing",
      },
    ]);
  });
  await closeDb();
  console.log(
    `Demo seed complete: ${demoDays.length} days for read-only user ${demoUserId}.`,
  );
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : "Demo seed failed");
  await closeDb();
  process.exitCode = 1;
});
