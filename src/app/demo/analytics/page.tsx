import { AnalyticsView } from "@/features/analytics/analytics-view";
import { demoDays } from "@/features/demo/data";
export default function DemoAnalyticsPage() {
  return <AnalyticsView days={demoDays} demo />;
}
