import { TimelineView } from "@/features/timeline/timeline-view";
export default function DemoTimelinePage() {
  return (
    <TimelineView
      items={[
        {
          id: "1",
          timestamp: "2026-08-18T18:04:00+03:00",
          type: "snapshot",
          title: "Прогулка · музыка",
          detail: "Закончил задачу, энергично иду домой",
          important: true,
          metrics: [
            { label: "Wanting", value: 6 },
            { label: "Pleasure", value: 8 },
            { label: "Energy", value: 7 },
            { label: "Anxiety", value: 3 },
          ],
        },
        {
          id: "2",
          timestamp: "2026-08-18T17:52:00+03:00",
          type: "snapshot",
          title: "Работа · программирование",
          metrics: [
            { label: "Wanting", value: 4 },
            { label: "Pleasure", value: 4 },
            { label: "Energy", value: 5 },
          ],
        },
        {
          id: "3",
          timestamp: "2026-08-18T14:20:00+03:00",
          type: "caffeine",
          title: "Кофе · 90 мг",
          detail: "Последний кофеин сегодня",
        },
        {
          id: "4",
          timestamp: "2026-08-18T07:32:00+03:00",
          type: "sleep",
          title: "7 ч 24 мин сна",
          detail: "Качество 7/10 · 1 пробуждение",
        },
        {
          id: "5",
          timestamp: "2026-08-10T10:00:00+03:00",
          type: "medication",
          title: "Изменение дозировки",
          detail: "50 → 75 мг · synthetic demo record",
        },
      ]}
    />
  );
}
