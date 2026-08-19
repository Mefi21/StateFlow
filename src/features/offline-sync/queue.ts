import { openDB } from "idb";
import type { SnapshotInput } from "@/lib/validation/entries";

type PendingSnapshot = {
  id: string;
  createdAt: string;
  payload: SnapshotInput;
};

const database =
  typeof window === "undefined" || typeof indexedDB === "undefined"
    ? null
    : openDB("stateflow-offline", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("snapshots"))
            db.createObjectStore("snapshots", { keyPath: "id" });
        },
      });

export async function enqueueSnapshot(payload: SnapshotInput) {
  if (!database) throw new Error("BROWSER_STORAGE_UNAVAILABLE");
  await (
    await database
  ).put("snapshots", {
    id: payload.id,
    createdAt: new Date().toISOString(),
    payload,
  } satisfies PendingSnapshot);
}

export async function pendingSnapshots(): Promise<PendingSnapshot[]> {
  if (!database) return [];
  return (await (await database).getAll("snapshots")) as PendingSnapshot[];
}

export async function acknowledgeSnapshot(id: string) {
  if (!database) return;
  await (await database).delete("snapshots", id);
}

export async function syncPendingSnapshots() {
  const pending = await pendingSnapshots();
  if (!pending.length || !navigator.onLine)
    return { synced: 0, remaining: pending.length };
  let synced = 0;
  for (const record of pending) {
    const response = await fetch("/api/sync/snapshots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshots: [record.payload] }),
    });
    if (!response.ok) break;
    await acknowledgeSnapshot(record.id);
    synced += 1;
  }
  return { synced, remaining: pending.length - synced };
}
