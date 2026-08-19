import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { goalMeasurements, goals } from "@/db/schema";
import { GoalsView } from "@/features/goals/goals-view";
import { requireUser } from "@/lib/auth/session";
export default async function GoalsPage() {
  const user = await requireUser();
  const rows = await getDb()
    .select({
      id: goals.id,
      title: goals.title,
      whyItMatters: goals.whyItMatters,
      category: goals.category,
      progress: goals.progress,
      targetDate: goals.targetDate,
      wanting: goalMeasurements.wanting,
      mastery: goalMeasurements.mastery,
      confidence: goalMeasurements.confidence,
    })
    .from(goals)
    .leftJoin(goalMeasurements, eq(goalMeasurements.goalId, goals.id))
    .where(eq(goals.userId, user.id))
    .orderBy(desc(goalMeasurements.recordedAt));
  const latestMeasurements = [
    ...new Map(rows.map((row) => [row.id, row])).values(),
  ].map((row) => ({
    ...row,
    wanting: row.wanting ?? undefined,
    mastery: row.mastery ?? undefined,
    confidence: row.confidence ?? undefined,
  }));
  return <GoalsView initialGoals={latestMeasurements} />;
}
