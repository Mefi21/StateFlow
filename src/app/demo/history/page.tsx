import { HistoryView } from "@/features/history/history-view";
import { demoDays } from "@/features/demo/data";
export default function DemoHistoryPage() {
  return (
    <HistoryView
      demo
      days={demoDays.map((day, index) => ({
        date: day.date,
        snapshots: day.snapshots,
        sleepHours: day.sleepHours,
        caffeineMg: day.caffeineMg,
        note:
          index === demoDays.length - 1
            ? "Закончил задачу и вышел пройтись под музыку"
            : undefined,
        metrics: {
          future_wanting: day.futureWanting,
          current_pleasure: day.pleasure,
          energy: day.energy,
          anxiety: day.anxiety,
          escape_urge: day.escapeUrge,
          activation: day.activation,
        },
      }))}
    />
  );
}
