import "dotenv/config";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { closeDb, getDb } from "./index";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  await migrate(getDb(), { migrationsFolder: "./src/db/migrations" });
  await closeDb();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Migration failed");
  process.exitCode = 1;
});
