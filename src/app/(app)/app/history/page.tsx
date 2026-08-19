import { getDashboardData } from "@/features/dashboard/queries";
import { HistoryView } from "@/features/history/history-view";
import { requireUser } from "@/lib/auth/session";
export default async function HistoryPage() {
  const user = await requireUser();
  const data = await getDashboardData(user.id);
  return (
    <HistoryView
      days={data.dailySeries.map((day) => ({
        date: day.date,
        metrics: day.metrics,
        snapshots: data.snapshotCounts[day.date] ?? 0,
      }))}
    />
  );
}
