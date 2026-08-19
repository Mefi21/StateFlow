import { ContextView } from "@/features/activities/context-view";
export default function DemoContextPage() {
  return (
    <ContextView
      demo
      initialActivities={[
        {
          id: "a1",
          category: "programming",
          startedAt: "2026-08-18T15:00:00+03:00",
          durationMinutes: 95,
          enjoyment: 7,
          mastery: 8,
        },
        {
          id: "a2",
          category: "walking",
          startedAt: "2026-08-18T18:00:00+03:00",
          durationMinutes: 42,
          enjoyment: 8,
          mastery: 4,
        },
      ]}
      initialEvents={[
        {
          id: "e1",
          title: "Завершил важную часть проекта",
          recordedAt: "2026-08-18T17:00:00+03:00",
          category: "achievement",
          valence: "positive",
          intensity: 7,
        },
      ]}
    />
  );
}
