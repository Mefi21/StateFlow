import { DashboardView } from "@/features/dashboard/dashboard-view";
import { demoDays } from "@/features/demo/data";

export default function DemoPage() {
  return <DashboardView days={demoDays} demo />;
}
