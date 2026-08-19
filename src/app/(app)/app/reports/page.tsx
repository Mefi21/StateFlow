import { getDashboardData } from "@/features/dashboard/queries";
import { UserReportView } from "@/features/reports/user-report-view";
import { requireUser } from "@/lib/auth/session";
export default async function ReportsPage() {
  const user = await requireUser();
  return <UserReportView data={await getDashboardData(user.id)} />;
}
