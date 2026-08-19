import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const developmentUrl =
  "postgresql://stateflow:stateflow@127.0.0.1:5432/stateflow";

const globalForDb = globalThis as unknown as {
  stateFlowSql?: ReturnType<typeof postgres>;
  stateFlowDb?: ReturnType<typeof drizzle<typeof schema>>;
};

export function getDb() {
  if (!globalForDb.stateFlowSql) {
    const connectionUrl = process.env.DATABASE_URL ?? developmentUrl;
    if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL)
      throw new Error("DATABASE_URL is required in production");
    globalForDb.stateFlowSql = postgres(connectionUrl, {
      max: process.env.NODE_ENV === "production" ? 5 : 2,
      prepare: false,
    });
  }
  globalForDb.stateFlowDb ??= drizzle(globalForDb.stateFlowSql, { schema });
  return globalForDb.stateFlowDb;
}

export async function closeDb() {
  await globalForDb.stateFlowSql?.end();
  globalForDb.stateFlowSql = undefined;
  globalForDb.stateFlowDb = undefined;
}

export type Database = ReturnType<typeof getDb>;
