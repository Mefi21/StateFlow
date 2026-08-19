import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { activities, lifeEvents } from "@/db/schema";
import { ContextView } from "@/features/activities/context-view";
import { requireUser } from "@/lib/auth/session";
export default async function ContextPage() {
  const user = await requireUser();
  const [activityRows, eventRows] = await Promise.all([
    getDb()
      .select()
      .from(activities)
      .where(eq(activities.userId, user.id))
      .orderBy(desc(activities.startedAt))
      .limit(50),
    getDb()
      .select()
      .from(lifeEvents)
      .where(eq(lifeEvents.userId, user.id))
      .orderBy(desc(lifeEvents.recordedAt))
      .limit(50),
  ]);
  return (
    <ContextView
      initialActivities={activityRows.map((row) => ({
        id: row.id,
        category: row.category,
        startedAt: row.startedAt.toISOString(),
        durationMinutes: row.durationMinutes,
        enjoyment: row.enjoyment,
        mastery: row.mastery,
      }))}
      initialEvents={eventRows.map((row) => ({
        id: row.id,
        title: row.title,
        recordedAt: row.recordedAt.toISOString(),
        category: row.category,
        valence: row.valence,
        intensity: row.intensity,
      }))}
    />
  );
}
