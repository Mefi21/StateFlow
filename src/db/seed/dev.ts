import "dotenv/config";
import { closeDb } from "@/db";
import { seedCoreMetrics } from "./core";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  await seedCoreMetrics();
  await closeDb();
  console.log("Core metric definitions seeded.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Seed failed");
  process.exitCode = 1;
});
