import { getDashboardData } from "@/features/dashboard/queries";
import { UserAnalyticsView } from "@/features/analytics/user-analytics-view";
import { requireUser } from "@/lib/auth/session";
export default async function AnalyticsPage() {
  const user = await requireUser();
  return <UserAnalyticsView data={await getDashboardData(user.id)} />;
}
