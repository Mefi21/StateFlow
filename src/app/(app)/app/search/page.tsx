import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { dailyEntries, goals, lifeEvents, snapshots } from "@/db/schema";
import { SearchView, type SearchResult } from "@/features/search/search-view";
import { requireUser } from "@/lib/auth/session";
export default async function SearchPage({
  searchParams,
}: PageProps<"/app/search">) {
  const user = await requireUser();
  const query = String((await searchParams).q ?? "")
    .trim()
    .slice(0, 100);
  let results: SearchResult[] = [];
  if (query) {
    const db = getDb();
    const [snapshotRows, dailyRows, eventRows, goalRows] = await Promise.all([
      db
        .select()
        .from(snapshots)
        .where(eq(snapshots.userId, user.id))
        .orderBy(desc(snapshots.recordedAt)),
      db
        .select()
        .from(dailyEntries)
        .where(eq(dailyEntries.userId, user.id))
        .orderBy(desc(dailyEntries.entryDate)),
      db
        .select()
        .from(lifeEvents)
        .where(eq(lifeEvents.userId, user.id))
        .orderBy(desc(lifeEvents.recordedAt)),
      db
        .select()
        .from(goals)
        .where(eq(goals.userId, user.id))
        .orderBy(desc(goals.startedAt)),
    ]);
    const normalized = query.toLocaleLowerCase("ru");
    results = [
      ...snapshotRows
        .filter((row) => row.note?.toLocaleLowerCase("ru").includes(normalized))
        .map((row) => ({
          id: row.id,
          type: "Snapshot",
          date: row.recordedAt.toISOString(),
          title: "Снимок состояния",
          excerpt: row.note!,
        })),
      ...dailyRows
        .filter((row) =>
          `${row.note ?? ""} ${Object.values(row.contextualAnswers).join(" ")}`
            .toLocaleLowerCase("ru")
            .includes(normalized),
        )
        .map((row) => ({
          id: row.id,
          type: "Daily",
          date: row.entryDate,
          title: "Daily Check-in",
          excerpt:
            row.note ??
            Object.values(row.contextualAnswers).find((value) =>
              value.toLocaleLowerCase("ru").includes(normalized),
            ) ??
            "",
        })),
      ...eventRows
        .filter((row) =>
          `${row.title} ${row.note ?? ""}`
            .toLocaleLowerCase("ru")
            .includes(normalized),
        )
        .map((row) => ({
          id: row.id,
          type: "Событие",
          date: row.recordedAt.toISOString(),
          title: row.title,
          excerpt: row.note ?? row.category,
        })),
      ...goalRows
        .filter((row) =>
          `${row.title} ${row.description ?? ""} ${row.whyItMatters ?? ""}`
            .toLocaleLowerCase("ru")
            .includes(normalized),
        )
        .map((row) => ({
          id: row.id,
          type: "Цель",
          date: row.startedAt,
          title: row.title,
          excerpt: row.whyItMatters ?? row.description ?? row.category,
        })),
    ].slice(0, 100);
  }
  return <SearchView query={query} results={results} />;
}
