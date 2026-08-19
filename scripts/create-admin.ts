import "dotenv/config";
import { eq } from "drizzle-orm";
import { closeDb, getDb } from "@/db";
import { userSettings, users } from "@/db/schema";
import { seedCoreMetrics } from "@/db/seed/core";
import { auth } from "@/lib/auth/auth";

async function main() {
  const username = process.argv[2] ?? process.env.ADMIN_USERNAME;
  const password = process.argv[3] ?? process.env.ADMIN_PASSWORD;
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  if (!username || !password)
    throw new Error("Usage: npm run setup:admin -- <username> <password>");
  if (password.length < 8)
    throw new Error("Password must contain at least 8 characters");
  await seedCoreMetrics();
  const result = await auth.api.signUpEmail({
    body: {
      email: `${username.toLowerCase()}@stateflow.local`,
      name: username,
      username,
      password,
    },
  });
  await getDb()
    .update(users)
    .set({ role: "admin" })
    .where(eq(users.id, result.user.id));
  await getDb()
    .insert(userSettings)
    .values({ userId: result.user.id, timezone: process.env.TZ ?? "UTC" })
    .onConflictDoNothing();
  await closeDb();
  console.log(`Admin account "${username}" created.`);
}

main().catch(async (error: unknown) => {
  console.error(error instanceof Error ? error.message : "Admin setup failed");
  await closeDb();
  process.exitCode = 1;
});
