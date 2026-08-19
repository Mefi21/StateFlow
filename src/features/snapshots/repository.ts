import { and, desc, eq, inArray, lt } from "drizzle-orm";
import { getDb } from "@/db";
import {
  entityTags,
  metricDefinitions,
  metricValues,
  snapshots,
  tags,
} from "@/db/schema";
import type { SnapshotInput } from "@/lib/validation/entries";
import { snapshotUpdateSchema } from "@/lib/validation/entries";
import type { z } from "zod";

export async function createSnapshot(userId: string, input: SnapshotInput) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const [previousSnapshot] = await tx
      .select({ id: snapshots.id })
      .from(snapshots)
      .where(
        and(
          eq(snapshots.userId, userId),
          lt(snapshots.recordedAt, new Date(input.recordedAt)),
        ),
      )
      .orderBy(desc(snapshots.recordedAt))
      .limit(1);
    const previousRows = previousSnapshot
      ? await tx
          .select({ slug: metricDefinitions.slug, value: metricValues.value })
          .from(metricValues)
          .innerJoin(
            metricDefinitions,
            eq(metricValues.metricDefinitionId, metricDefinitions.id),
          )
          .where(
            and(
              eq(metricValues.userId, userId),
              eq(metricValues.entryType, "snapshot"),
              eq(metricValues.entryId, previousSnapshot.id),
            ),
          )
      : [];
    const previousMetrics = Object.fromEntries(
      previousRows.map((row) => [row.slug, row.value]),
    );
    const inserted = await tx
      .insert(snapshots)
      .values({
        id: input.id,
        userId,
        recordedAt: new Date(input.recordedAt),
        timezone: input.timezone,
        note: input.note,
        isImportant: input.isImportant,
      })
      .onConflictDoNothing({ target: snapshots.id })
      .returning({ id: snapshots.id });

    if (!inserted.length) {
      const [owned] = await tx
        .select({ id: snapshots.id })
        .from(snapshots)
        .where(and(eq(snapshots.id, input.id), eq(snapshots.userId, userId)))
        .limit(1);
      if (!owned) throw new Error("RECORD_CONFLICT");
      return { id: owned.id, duplicate: true, previousMetrics };
    }

    const metricEntries = Object.entries(input.metrics);
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
          entryType: "snapshot",
          entryId: input.id,
          value,
          recordedAt: new Date(input.recordedAt),
        })),
      );
    }

    for (const name of [
      ...new Set(input.tags.map((tag) => tag.trim().toLocaleLowerCase("ru"))),
    ]) {
      const [tag] = await tx
        .insert(tags)
        .values({ userId, name })
        .onConflictDoUpdate({
          target: [tags.userId, tags.name],
          set: { name },
        })
        .returning({ id: tags.id });
      await tx
        .insert(entityTags)
        .values({
          userId,
          tagId: tag.id,
          entityType: "snapshot",
          entityId: input.id,
        })
        .onConflictDoNothing();
    }

    return { id: input.id, duplicate: false, previousMetrics };
  });
}

export async function findSnapshotForUser(userId: string, snapshotId: string) {
  const db = getDb();
  const [record] = await db
    .select()
    .from(snapshots)
    .where(and(eq(snapshots.userId, userId), eq(snapshots.id, snapshotId)))
    .limit(1);
  return record ?? null;
}

export async function deleteSnapshotForUser(
  userId: string,
  snapshotId: string,
) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const [owned] = await tx
      .select({ id: snapshots.id })
      .from(snapshots)
      .where(and(eq(snapshots.userId, userId), eq(snapshots.id, snapshotId)))
      .limit(1);
    if (!owned) return false;
    await tx
      .delete(metricValues)
      .where(
        and(
          eq(metricValues.userId, userId),
          eq(metricValues.entryType, "snapshot"),
          eq(metricValues.entryId, snapshotId),
        ),
      );
    await tx
      .delete(entityTags)
      .where(
        and(
          eq(entityTags.userId, userId),
          eq(entityTags.entityType, "snapshot"),
          eq(entityTags.entityId, snapshotId),
        ),
      );
    await tx
      .delete(snapshots)
      .where(and(eq(snapshots.userId, userId), eq(snapshots.id, snapshotId)));
    return true;
  });
}

export async function getSnapshotDetail(userId: string, snapshotId: string) {
  const db = getDb();
  const record = await findSnapshotForUser(userId, snapshotId);
  if (!record) return null;
  const values = await db
    .select({ slug: metricDefinitions.slug, value: metricValues.value })
    .from(metricValues)
    .innerJoin(
      metricDefinitions,
      eq(metricValues.metricDefinitionId, metricDefinitions.id),
    )
    .where(
      and(
        eq(metricValues.userId, userId),
        eq(metricValues.entryType, "snapshot"),
        eq(metricValues.entryId, snapshotId),
      ),
    );
  return {
    ...record,
    metrics: Object.fromEntries(values.map((row) => [row.slug, row.value])),
  };
}

export async function updateSnapshotForUser(
  userId: string,
  snapshotId: string,
  input: z.infer<typeof snapshotUpdateSchema>,
) {
  const db = getDb();
  return db.transaction(async (tx) => {
    const [owned] = await tx
      .select({ version: snapshots.version, recordedAt: snapshots.recordedAt })
      .from(snapshots)
      .where(and(eq(snapshots.userId, userId), eq(snapshots.id, snapshotId)))
      .limit(1);
    if (!owned) return { status: "not_found" as const };
    if (owned.version !== input.version)
      return { status: "conflict" as const, currentVersion: owned.version };

    const updated = await tx
      .update(snapshots)
      .set({
        ...(input.note !== undefined ? { note: input.note } : {}),
        ...(input.isImportant !== undefined
          ? { isImportant: input.isImportant }
          : {}),
        version: owned.version + 1,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(snapshots.userId, userId),
          eq(snapshots.id, snapshotId),
          eq(snapshots.version, input.version),
        ),
      )
      .returning({ version: snapshots.version });
    if (!updated.length) {
      const [current] = await tx
        .select({ version: snapshots.version })
        .from(snapshots)
        .where(and(eq(snapshots.userId, userId), eq(snapshots.id, snapshotId)))
        .limit(1);
      return {
        status: "conflict" as const,
        currentVersion: current?.version ?? owned.version,
      };
    }

    if (input.metrics) {
      const entries = Object.entries(input.metrics);
      const definitions = await tx
        .select({ id: metricDefinitions.id, slug: metricDefinitions.slug })
        .from(metricDefinitions)
        .where(
          inArray(
            metricDefinitions.slug,
            entries.map(([slug]) => slug),
          ),
        );
      const ids = new Map(
        definitions.map((definition) => [definition.slug, definition.id]),
      );
      if (ids.size !== entries.length)
        throw new Error("METRIC_DEFINITIONS_NOT_SEEDED");
      await tx
        .delete(metricValues)
        .where(
          and(
            eq(metricValues.userId, userId),
            eq(metricValues.entryType, "snapshot"),
            eq(metricValues.entryId, snapshotId),
          ),
        );
      if (entries.length)
        await tx.insert(metricValues).values(
          entries.map(([slug, value]) => ({
            userId,
            metricDefinitionId: ids.get(slug)!,
            entryType: "snapshot",
            entryId: snapshotId,
            value,
            recordedAt: owned.recordedAt,
          })),
        );
    }
    return { status: "updated" as const, version: updated[0].version };
  });
}
