import { GoalsView } from "@/features/goals/goals-view";
export default function DemoGoalsPage() {
  return (
    <GoalsView
      demo
      initialGoals={[
        {
          id: "demo-1",
          title: "Стать сильнее как разработчик",
          whyItMatters: "Создавать сложные вещи уверенно и осмысленно",
          category: "развитие",
          progress: 68,
          targetDate: "2026-12-31",
          wanting: 7.1,
          mastery: 6.4,
          confidence: 6.8,
        },
        {
          id: "demo-2",
          title: "Вернуть регулярные прогулки",
          whyItMatters: "Пространство для мыслей и смена контекста",
          category: "здоровье",
          progress: 42,
          targetDate: null,
          wanting: 6.3,
          mastery: 5.8,
          confidence: 6.1,
        },
      ]}
    />
  );
}
