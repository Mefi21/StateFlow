import { coreMetrics } from "@/features/metrics/definitions";
import { SettingsView } from "@/features/settings/settings-view";
export default function DemoSettingsPage() {
  return (
    <SettingsView
      demo
      initial={{
        theme: "system",
        timezone: "Europe/Moscow",
        targetSleepMinutes: 420,
        morningCheckInEnabled: false,
      }}
      metrics={coreMetrics}
    />
  );
}
