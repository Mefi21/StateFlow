import { randomUUID } from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const databaseUrl = process.env.TEST_DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "TEST_DATABASE_URL is required to run integration tests. Add it to .env.",
  );
}
process.env.DATABASE_URL = databaseUrl;

describe("snapshot ownership", () => {
  const userA = `test-a-${randomUUID()}`;
  const userB = `test-b-${randomUUID()}`;
  const snapshotId = randomUUID();

  beforeAll(async () => {
    const { getDb } = await import("@/db");
    const { snapshots, users } = await import("@/db/schema");
    const db = getDb();
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    await db.insert(users).values([
      { id: userA, name: "A", email: `${userA}@test.invalid` },
      { id: userB, name: "B", email: `${userB}@test.invalid` },
    ]);
    await db.insert(snapshots).values({
      id: snapshotId,
      userId: userA,
      recordedAt: new Date(),
      timezone: "UTC",
    });
  }, 30_000);

  afterAll(async () => {
    const { closeDb, getDb } = await import("@/db");
    const { users } = await import("@/db/schema");
    await getDb()
      .delete(users)
      .where(inArray(users.id, [userA, userB]));
    await closeDb();
  });

  it("does not return user A's snapshot to user B", async () => {
    const { findSnapshotForUser } =
      await import("@/features/snapshots/repository");
    expect(await findSnapshotForUser(userB, snapshotId)).toBeNull();
    expect((await findSnapshotForUser(userA, snapshotId))?.id).toBe(snapshotId);
  });

  it("all direct snapshot deletes include ownership", async () => {
    const { getDb } = await import("@/db");
    const { snapshots } = await import("@/db/schema");
    const existing = await getDb()
      .select({ id: snapshots.id })
      .from(snapshots)
      .where(eq(snapshots.id, snapshotId));
    expect(existing).toHaveLength(1);
    const { deleteSnapshotForUser } =
      await import("@/features/snapshots/repository");
    expect(await deleteSnapshotForUser(userB, snapshotId)).toBe(false);
    expect(
      await getDb()
        .select({ id: snapshots.id })
        .from(snapshots)
        .where(eq(snapshots.id, snapshotId)),
    ).toHaveLength(1);
  });
});
