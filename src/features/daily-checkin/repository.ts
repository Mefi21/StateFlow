import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import { dailyEntries, metricDefinitions, metricValues } from "@/db/schema";
import type { DailyEntryInput } from "@/lib/validation/entries";

export async function saveDailyEntry(userId: string, input: DailyEntryInput) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const [entry] = await tx
      .insert(dailyEntries)
      .values({
        id: input.id,
        userId,
        entryDate: input.entryDate,
        timezone: input.timezone,
        isDraft: input.isDraft,
        contextualAnswers: input.contextualAnswers,
        note: input.note,
      })
      .onConflictDoUpdate({
        target: [dailyEntries.userId, dailyEntries.entryDate],
        set: {
          timezone: input.timezone,
          isDraft: input.isDraft,
          contextualAnswers: input.contextualAnswers,
          note: input.note,
          updatedAt: new Date(),
          version: input.isDraft ? dailyEntries.version : undefined,
        },
      })
      .returning({ id: dailyEntries.id });

    const metricEntries = Object.entries(input.metrics);
    await tx
      .delete(metricValues)
      .where(
        and(
          eq(metricValues.userId, userId),
          eq(metricValues.entryType, "daily"),
          eq(metricValues.entryId, entry.id),
        ),
      );
    if (metricEntries.length) {
      const definitions = await tx
        .select({ id: metricDefinitions.id, slug: metricDefinitions.slug })
        .from(metricDefinitions)
        .where(
          inArray(
            metricDefinitions.slug,
            metricEntries.map(([slug]) => slug),
          ),
        );
      const ids = new Map(
        definitions.map((definition) => [definition.slug, definition.id]),
      );
      if (ids.size !== metricEntries.length)
        throw new Error("METRIC_DEFINITIONS_NOT_SEEDED");
      await tx.insert(metricValues).values(
        metricEntries.map(([slug, value]) => ({
          userId,
          metricDefinitionId: ids.get(slug)!,
          entryType: "daily",
          entryId: entry.id,
          value,
          recordedAt: new Date(`${input.entryDate}T20:00:00.000Z`),
        })),
      );
    }
    return { id: entry.id, draft: input.isDraft };
  });
}
