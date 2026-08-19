import { ReportView } from "@/features/reports/report-view";
import { demoDays } from "@/features/demo/data";
export default function DemoReportsPage() {
  return <ReportView days={demoDays} demo />;
}
